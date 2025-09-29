from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from passlib.context import CryptContext
import jwt
import httpx
import asyncio
import time
from emergentintegrations.llm.chat import LlmChat, UserMessage
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"

# Create the main app without a prefix
app = FastAPI(title="TicketAI API", description="AI-Powered Ticketing Platform with TicketMaster Integration")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# QR Code generation with fallback
try:
    import qrcode
    from io import BytesIO
    import base64
    QR_AVAILABLE = True
except ImportError:
    QR_AVAILABLE = False
    import base64
    from io import BytesIO

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime

class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    date: datetime
    location: str
    price: float
    available_tickets: int
    total_tickets: int
    image_url: Optional[str] = None
    category: str = "General"
    source: str = "local"  # "local" or "ticketmaster"
    external_id: Optional[str] = None  # TicketMaster event ID
    external_url: Optional[str] = None  # TicketMaster URL
    venue_info: Optional[Dict] = None
    price_ranges: Optional[List[Dict]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventCreate(BaseModel):
    name: str
    description: str
    date: datetime
    location: str
    price: float
    total_tickets: int
    image_url: Optional[str] = None
    category: str = "General"

class Ticket(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    user_email: str
    user_name: str
    ticket_type: str = "Standard"
    qr_code: str
    status: str = "confirmed"
    purchase_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    price: float
    source: str = "local"  # "local" or "ticketmaster"
    external_order_id: Optional[str] = None

class TicketCreate(BaseModel):
    event_id: str
    user_email: str
    user_name: str
    ticket_type: str = "Standard"

class AISearchRequest(BaseModel):
    query: str
    location: Optional[str] = None
    date_range: Optional[str] = None
    category: Optional[str] = None
    max_results: int = 10

class RecommendationRequest(BaseModel):
    user_preferences: str
    location: Optional[str] = None

class TicketMasterSearchParams(BaseModel):
    keyword: Optional[str] = None
    city: Optional[str] = None
    state_code: Optional[str] = None
    country_code: str = "US"
    classification_name: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    size: int = 20
    page: int = 0

# TicketMaster Integration
class TicketMasterClient:
    def __init__(self):
        # Demo mode - using sample data
        self.api_key = os.environ.get('TICKETMASTER_API_KEY', 'demo_key')
        self.base_url = "https://app.ticketmaster.com/discovery/v2"
        self.client = httpx.AsyncClient(timeout=30.0)
        self.demo_mode = True  # Using demo mode as specified
    
    async def search_events(self, params: TicketMasterSearchParams) -> List[Event]:
        """Search TicketMaster events (demo implementation)"""
        if self.demo_mode:
            return await self._get_demo_ticketmaster_events(params)
        
        # Real API implementation would go here
        try:
            search_params = {
                "apikey": self.api_key,
                "size": params.size,
                "page": params.page
            }
            
            if params.keyword:
                search_params["keyword"] = params.keyword
            if params.city:
                search_params["city"] = params.city
            
            response = await self.client.get(
                f"{self.base_url}/events.json",
                params=search_params
            )
            
            if response.status_code == 200:
                data = response.json()
                return await self._parse_ticketmaster_events(data)
            else:
                logging.warning(f"TicketMaster API error: {response.status_code}")
                return []
                
        except Exception as e:
            logging.error(f"TicketMaster API error: {str(e)}")
            return []
    
    async def _get_demo_ticketmaster_events(self, params: TicketMasterSearchParams) -> List[Event]:
        """Generate demo TicketMaster events"""
        demo_events = [
            {
                "id": str(uuid.uuid4()),
                "name": "Taylor Swift | The Eras Tour",
                "description": "Taylor Swift brings The Eras Tour to your city with her biggest hits spanning her entire career. Don't miss this spectacular show!",
                "date": datetime(2025, 8, 15, 20, 0, 0),
                "location": "MetLife Stadium, East Rutherford, NJ",
                "price": 299.99,
                "available_tickets": 5000,
                "total_tickets": 80000,
                "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
                "category": "Music",
                "source": "ticketmaster",
                "external_id": "tm_swift_eras_2025",
                "external_url": "https://www.ticketmaster.com/taylor-swift-the-eras-tour",
                "venue_info": {
                    "name": "MetLife Stadium",
                    "address": "1 MetLife Stadium Dr, East Rutherford, NJ 07073",
                    "capacity": 82500
                },
                "price_ranges": [
                    {"min": 89.99, "max": 599.99, "currency": "USD"}
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "name": "NBA Finals Game 7",
                "description": "The ultimate basketball showdown! Watch the NBA Finals Game 7 live with the best teams competing for the championship.",
                "date": datetime(2025, 6, 20, 20, 0, 0),
                "location": "Madison Square Garden, New York, NY",
                "price": 899.99,
                "available_tickets": 1200,
                "total_tickets": 20000,
                "image_url": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
                "category": "Sports",
                "source": "ticketmaster",
                "external_id": "tm_nba_finals_g7",
                "external_url": "https://www.ticketmaster.com/nba-finals-game-7",
                "venue_info": {
                    "name": "Madison Square Garden",
                    "address": "4 Pennsylvania Plaza, New York, NY 10001",
                    "capacity": 20789
                },
                "price_ranges": [
                    {"min": 299.99, "max": 2999.99, "currency": "USD"}
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Broadway: Hamilton",
                "description": "Experience the revolutionary musical that's taken Broadway by storm. Hamilton tells the story of America's founding father Alexander Hamilton.",
                "date": datetime(2025, 5, 10, 19, 30, 0),
                "location": "Richard Rodgers Theatre, New York, NY",
                "price": 189.99,
                "available_tickets": 80,
                "total_tickets": 1319,
                "image_url": "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800",
                "category": "Arts",
                "source": "ticketmaster",
                "external_id": "tm_hamilton_broadway",
                "external_url": "https://www.ticketmaster.com/hamilton-broadway",
                "venue_info": {
                    "name": "Richard Rodgers Theatre",
                    "address": "226 W 46th St, New York, NY 10036",
                    "capacity": 1319
                },
                "price_ranges": [
                    {"min": 89.99, "max": 399.99, "currency": "USD"}
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Coachella Valley Music Festival",
                "description": "The premier music and arts festival featuring top artists, art installations, and desert vibes. Weekend 1 passes available now!",
                "date": datetime(2025, 4, 18, 12, 0, 0),
                "location": "Empire Polo Club, Indio, CA",
                "price": 449.99,
                "available_tickets": 2500,
                "total_tickets": 125000,
                "image_url": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
                "category": "Music",
                "source": "ticketmaster",
                "external_id": "tm_coachella_2025",
                "external_url": "https://www.ticketmaster.com/coachella-2025",
                "venue_info": {
                    "name": "Empire Polo Club",
                    "address": "81-800 Avenue 51, Indio, CA 92201",
                    "capacity": 125000
                },
                "price_ranges": [
                    {"min": 449.99, "max": 1599.99, "currency": "USD"}
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Super Bowl LIX",
                "description": "The biggest game in American sports! Watch the NFL championship game live with halftime show entertainment and all the excitement.",
                "date": datetime(2025, 2, 9, 18, 30, 0),
                "location": "Caesars Superdome, New Orleans, LA",
                "price": 2499.99,
                "available_tickets": 300,
                "total_tickets": 76468,
                "image_url": "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800",
                "category": "Sports",
                "source": "ticketmaster",
                "external_id": "tm_superbowl_59",
                "external_url": "https://www.ticketmaster.com/super-bowl-lix",
                "venue_info": {
                    "name": "Caesars Superdome",
                    "address": "1500 Sugar Bowl Dr, New Orleans, LA 70112",
                    "capacity": 76468
                },
                "price_ranges": [
                    {"min": 999.99, "max": 9999.99, "currency": "USD"}
                ]
            }
        ]
        
        # Filter based on search parameters
        filtered_events = []
        for event_data in demo_events:
            if params.keyword and params.keyword.lower() not in event_data["name"].lower():
                continue
            if params.classification_name and params.classification_name.lower() != event_data["category"].lower():
                continue
            
            event = Event(**event_data)
            filtered_events.append(event)
        
        return filtered_events[:params.size]
    
    async def _parse_ticketmaster_events(self, data: Dict) -> List[Event]:
        """Parse TicketMaster API response into Event objects"""
        events = []
        if "_embedded" in data and "events" in data["_embedded"]:
            for event_data in data["_embedded"]["events"]:
                try:
                    event = Event(
                        id=str(uuid.uuid4()),
                        name=event_data["name"],
                        description=event_data.get("info", ""),
                        date=datetime.fromisoformat(event_data["dates"]["start"]["dateTime"].replace("Z", "+00:00")),
                        location=f"{event_data['_embedded']['venues'][0]['name']}, {event_data['_embedded']['venues'][0]['city']['name']}",
                        price=event_data.get("priceRanges", [{"min": 0}])[0]["min"],
                        available_tickets=1000,  # Placeholder
                        total_tickets=5000,  # Placeholder
                        image_url=event_data.get("images", [{}])[0].get("url"),
                        category=event_data["classifications"][0]["segment"]["name"],
                        source="ticketmaster",
                        external_id=event_data["id"],
                        external_url=event_data.get("url"),
                        venue_info=event_data.get("_embedded", {}).get("venues", [{}])[0],
                        price_ranges=event_data.get("priceRanges")
                    )
                    events.append(event)
                except Exception as e:
                    logging.warning(f"Failed to parse TicketMaster event: {str(e)}")
                    continue
        
        return events
    
    async def close(self):
        await self.client.aclose()

# Initialize TicketMaster client
ticketmaster_client = TicketMasterClient()

# AI Search Implementation
class AISearchEngine:
    def __init__(self):
        self.llm_key = os.environ.get('EMERGENT_LLM_KEY')
    
    async def semantic_search(self, request: AISearchRequest) -> Dict:
        """Perform AI-powered semantic search across events"""
        try:
            # Get all events (local + TicketMaster)
            local_events = await db.events.find().to_list(100)
            tm_params = TicketMasterSearchParams(
                keyword=request.query,
                city=request.location,
                size=request.max_results
            )
            ticketmaster_events = await ticketmaster_client.search_events(tm_params)
            
            all_events = []
            
            # Convert local events
            for event_data in local_events:
                all_events.append(Event(**event_data))
            
            # Add TicketMaster events
            all_events.extend(ticketmaster_events)
            
            if not all_events:
                return {
                    "events": [],
                    "ai_analysis": "No events found matching your search criteria.",
                    "search_interpretation": request.query
                }
            
            # Use AI to analyze and rank results
            if self.llm_key:
                return await self._ai_rank_events(request, all_events)
            else:
                # Fallback: simple keyword matching
                return await self._simple_search(request, all_events)
                
        except Exception as e:
            logging.error(f"AI Search error: {str(e)}")
            return {
                "events": [],
                "ai_analysis": "Search temporarily unavailable. Please try again.",
                "search_interpretation": request.query
            }
    
    async def _ai_rank_events(self, request: AISearchRequest, events: List[Event]) -> Dict:
        """Use AI to analyze search intent and rank events"""
        try:
            # Prepare events data for AI analysis
            events_text = "\n".join([
                f"Event: {event.name} | Category: {event.category} | Location: {event.location} | "
                f"Date: {event.date} | Price: ${event.price} | Description: {event.description[:100]}..."
                for event in events[:20]  # Limit for AI processing
            ])
            
            chat = LlmChat(
                api_key=self.llm_key,
                session_id=f"search-{uuid.uuid4()}",
                system_message="You are an AI assistant that helps users find relevant events based on their search queries. Analyze the user's intent and rank events by relevance."
            ).with_model("openai", "gpt-4o-mini")
            
            user_message = UserMessage(
                text=f"User search query: '{request.query}'\n"
                     f"Location preference: {request.location or 'Any'}\n"
                     f"Date preference: {request.date_range or 'Any'}\n"
                     f"Category preference: {request.category or 'Any'}\n\n"
                     f"Available events:\n{events_text}\n\n"
                     f"Please:\n"
                     f"1. Analyze the user's search intent\n"
                     f"2. Rank the top {min(request.max_results, 10)} most relevant events\n"
                     f"3. Explain why each event matches the search query\n"
                     f"Return event names in order of relevance with brief explanations."
            )
            
            ai_response = await chat.send_message(user_message)
            
            # Parse AI response and return ranked events
            ranked_events = self._parse_ai_ranking(ai_response, events)
            
            return {
                "events": [event.dict() for event in ranked_events[:request.max_results]],
                "ai_analysis": ai_response,
                "search_interpretation": f"Analyzed '{request.query}' and found {len(ranked_events)} relevant events",
                "total_found": len(ranked_events)
            }
            
        except Exception as e:
            logging.error(f"AI ranking error: {str(e)}")
            return await self._simple_search(request, events)
    
    def _parse_ai_ranking(self, ai_response: str, events: List[Event]) -> List[Event]:
        """Parse AI response and return events in ranked order"""
        # Simple implementation: return events in original order
        # In production, this would parse AI response and reorder events
        return events
    
    async def _simple_search(self, request: AISearchRequest, events: List[Event]) -> Dict:
        """Fallback simple search implementation"""
        query_lower = request.query.lower()
        
        # Score events based on keyword matches
        scored_events = []
        for event in events:
            score = 0
            
            # Name match (highest priority)
            if query_lower in event.name.lower():
                score += 10
            
            # Description match
            if query_lower in event.description.lower():
                score += 5
            
            # Category match
            if request.category and request.category.lower() in event.category.lower():
                score += 8
            
            # Location match
            if request.location and request.location.lower() in event.location.lower():
                score += 6
            
            if score > 0:
                scored_events.append((score, event))
        
        # Sort by score and return
        scored_events.sort(key=lambda x: x[0], reverse=True)
        ranked_events = [event for _, event in scored_events[:request.max_results]]
        
        return {
            "events": [event.dict() for event in ranked_events],
            "ai_analysis": f"Found {len(ranked_events)} events matching '{request.query}' using keyword search.",
            "search_interpretation": request.query,
            "total_found": len(ranked_events)
        }

# Initialize AI search engine
ai_search_engine = AISearchEngine()

# Authentication Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"email": email})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Utility Functions
def generate_qr_code(data: str) -> str:
    if QR_AVAILABLE:
        try:
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(data)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            
            img_base64 = base64.b64encode(buffer.read()).decode()
            return f"data:image/png;base64,{img_base64}"
        except Exception as e:
            logging.warning(f"QR code generation failed: {e}")
    
    # Fallback: return a simple placeholder image
    placeholder = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    return f"data:image/png;base64,{placeholder}"

# Routes
@api_router.get("/")
async def root():
    return {"message": "TicketAI API - AI-Powered Ticketing Platform with TicketMaster Integration"}

# Authentication Routes
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    password_hash = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=password_hash
    )
    
    await db.users.insert_one(user.dict())
    return UserResponse(**user.dict())

@api_router.post("/auth/login")
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer", "user": UserResponse(**user)}

# Enhanced Event Routes with TicketMaster Integration
@api_router.get("/events", response_model=List[Event])
async def get_events(
    include_ticketmaster: bool = True,
    category: Optional[str] = None,
    location: Optional[str] = None
):
    """Get all events including TicketMaster events"""
    events = []
    
    # Get local events
    query = {}
    if category:
        query["category"] = {"$regex": category, "$options": "i"}
    
    local_events = await db.events.find(query).to_list(50)
    for event_data in local_events:
        events.append(Event(**event_data))
    
    # Get TicketMaster events
    if include_ticketmaster:
        tm_params = TicketMasterSearchParams(
            classification_name=category,
            city=location,
            size=20
        )
        tm_events = await ticketmaster_client.search_events(tm_params)
        events.extend(tm_events)
    
    return events

@api_router.get("/events/search", response_model=Dict[str, Any])
async def search_events(
    q: str,
    location: Optional[str] = None,
    category: Optional[str] = None,
    max_results: int = 20
):
    """Enhanced search across local and TicketMaster events"""
    search_request = AISearchRequest(
        query=q,
        location=location,
        category=category,
        max_results=max_results
    )
    
    return await ai_search_engine.semantic_search(search_request)

@api_router.post("/events/ai-search", response_model=Dict[str, Any])
async def ai_semantic_search(request: AISearchRequest):
    """AI-powered semantic search with natural language understanding"""
    return await ai_search_engine.semantic_search(request)

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    # Try local events first
    event = await db.events.find_one({"id": event_id})
    if event:
        return Event(**event)
    
    # If not found locally, could be a TicketMaster event
    # For demo, return not found
    raise HTTPException(status_code=404, detail="Event not found")

@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate):
    event = Event(
        **event_data.dict(),
        available_tickets=event_data.total_tickets,
        source="local"
    )
    await db.events.insert_one(event.dict())
    return event

# Ticket Routes (Enhanced for TicketMaster)
@api_router.post("/tickets", response_model=Ticket)
async def book_ticket(ticket_data: TicketCreate):
    # Check if event exists locally
    event = await db.events.find_one({"id": ticket_data.event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event["available_tickets"] <= 0:
        raise HTTPException(status_code=400, detail="No tickets available")
    
    # Generate QR code
    qr_data = f"TICKET:{ticket_data.event_id}:{ticket_data.user_email}:{uuid.uuid4()}"
    qr_code = generate_qr_code(qr_data)
    
    # Create ticket
    ticket = Ticket(
        **ticket_data.dict(),
        qr_code=qr_code,
        price=event["price"],
        source=event.get("source", "local")
    )
    
    # Save ticket and update event availability
    await db.tickets.insert_one(ticket.dict())
    await db.events.update_one(
        {"id": ticket_data.event_id},
        {"$inc": {"available_tickets": -1}}
    )
    
    return ticket

@api_router.get("/tickets/user/{user_email}", response_model=List[Ticket])
async def get_user_tickets(user_email: str):
    tickets = await db.tickets.find({"user_email": user_email}).to_list(100)
    return [Ticket(**ticket) for ticket in tickets]

# AI Recommendations Route (Enhanced)
@api_router.post("/recommendations")
async def get_recommendations(request: RecommendationRequest):
    try:
        # Get all available events
        local_events = await db.events.find().to_list(50)
        tm_params = TicketMasterSearchParams(size=20)
        ticketmaster_events = await ticketmaster_client.search_events(tm_params)
        
        all_events = []
        for event_data in local_events:
            all_events.append(Event(**event_data))
        all_events.extend(ticketmaster_events)
        
        if not all_events:
            return {"recommendations": [], "message": "No events available"}
        
        # Format events for AI
        events_text = "\n".join([
            f"- {event.name}: {event.description} ({event.category}) at {event.location} on {event.date} - ${event.price} [Source: {event.source}]"
            for event in all_events
        ])
        
        # Initialize LLM Chat
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            return {"recommendations": all_events[:3], "message": "AI recommendations unavailable, showing popular events"}
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"recommendations-{uuid.uuid4()}",
            system_message="You are an AI assistant that recommends events based on user preferences. Consider both local and TicketMaster events. Provide detailed explanations for your recommendations."
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(
            text=f"User preferences: {request.user_preferences}\n"
                 f"Location preference: {request.location or 'Any'}\n\n"
                 f"Available events (mix of local and TicketMaster events):\n{events_text}\n\n"
                 f"Based on the user's preferences, recommend the top 3-5 events and briefly explain why each is a good match. "
                 f"Consider the event source (local events support our platform directly, TicketMaster events offer broader selection)."
        )
        
        response = await chat.send_message(user_message)
        
        # Return top events as recommendations
        recommended_events = all_events[:5]  # Simple fallback
        
        return {
            "recommendations": [event.dict() for event in recommended_events],
            "ai_explanation": response,
            "message": "AI-powered recommendations from local and TicketMaster events",
            "total_events_considered": len(all_events)
        }
        
    except Exception as e:
        logging.error(f"Error in recommendations: {str(e)}")
        # Fallback to popular events
        events = await db.events.find().to_list(3)
        return {
            "recommendations": [Event(**event).dict() for event in events],
            "message": "Showing popular events (AI temporarily unavailable)"
        }

# TicketMaster Specific Routes
@api_router.get("/ticketmaster/events")
async def get_ticketmaster_events(
    keyword: Optional[str] = None,
    city: Optional[str] = None,
    classification: Optional[str] = None,
    size: int = 20
):
    """Get events from TicketMaster"""
    params = TicketMasterSearchParams(
        keyword=keyword,
        city=city,
        classification_name=classification,
        size=size
    )
    
    events = await ticketmaster_client.search_events(params)
    return {"events": [event.dict() for event in events], "source": "ticketmaster"}

@api_router.post("/ticketmaster/purchase/{event_id}")
async def initiate_ticketmaster_purchase(
    event_id: str,
    user_data: dict
):
    """Redirect to TicketMaster for purchase (demo implementation)"""
    # In production, this would create a proper TicketMaster purchase flow
    # For demo, we return a redirect URL
    
    return {
        "redirect_url": f"https://www.ticketmaster.com/event/{event_id}",
        "message": "Redirecting to TicketMaster for secure checkout",
        "external_purchase": True
    }

# Mock Payment Route (Enhanced)
@api_router.post("/payments/process")
async def process_payment(payment_data: dict):
    payment_id = str(uuid.uuid4())
    
    # Simulate payment processing delay
    await asyncio.sleep(1)
    
    # Mock success (90% success rate)
    success = secrets.randbelow(10) < 9
    
    if success:
        return {
            "payment_id": payment_id,
            "status": "success",
            "message": "Payment processed successfully",
            "amount": payment_data.get("amount", 0),
            "method": payment_data.get("method", "local")
        }
    else:
        raise HTTPException(status_code=400, detail="Payment failed")

# Analytics and Admin Routes
@api_router.get("/analytics/events")
async def get_event_analytics():
    """Get event analytics data"""
    local_events = await db.events.count_documents({})
    total_tickets = await db.tickets.count_documents({})
    
    return {
        "total_local_events": local_events,
        "total_tickets_sold": total_tickets,
        "ticketmaster_integration": "active",
        "ai_search_enabled": bool(os.environ.get('EMERGENT_LLM_KEY'))
    }

# Create sample events on startup (Enhanced with TicketMaster integration note)
@app.on_event("startup")
async def create_sample_events():
    existing_events = await db.events.find().to_list(1)
    if not existing_events:
        sample_events = [
            EventCreate(
                name="Tech Conference 2025",
                description="Annual technology conference featuring the latest innovations in AI, blockchain, and software development. Join industry leaders and experts for this local event supporting our community.",
                date=datetime(2025, 3, 15, 9, 0, 0),
                location="San Francisco, CA",
                price=299.99,
                total_tickets=500,
                category="Technology",
                image_url="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
            ),
            EventCreate(
                name="Summer Music Festival",
                description="Three-day outdoor music festival featuring emerging local artists and established performers. Support local music while enjoying great entertainment.",
                date=datetime(2025, 7, 20, 18, 0, 0),
                location="Austin, TX",
                price=199.99,
                total_tickets=2000,
                category="Music",
                image_url="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800"
            ),
            EventCreate(
                name="Art Gallery Opening",
                description="Exclusive opening of contemporary art exhibition featuring emerging local artists. Wine and networking included in this intimate community event.",
                date=datetime(2025, 2, 10, 19, 0, 0),
                location="New York, NY",
                price=75.00,
                total_tickets=150,
                category="Arts",
                image_url="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800"
            ),
            EventCreate(
                name="Business Networking Mixer",
                description="Professional networking event for local entrepreneurs and business leaders. Great for making connections and partnerships in your community.",
                date=datetime(2025, 4, 5, 18, 30, 0),
                location="Chicago, IL",
                price=50.00,
                total_tickets=300,
                category="Business",
                image_url="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800"
            )
        ]
        
        for event_data in sample_events:
            event = Event(
                **event_data.dict(),
                available_tickets=event_data.total_tickets,
                source="local"
            )
            await db.events.insert_one(event.dict())
        
        logging.info("Sample local events created successfully")
        logging.info("TicketMaster integration active - events will include both local and TicketMaster listings")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    await ticketmaster_client.close()