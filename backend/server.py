from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, BackgroundTasks, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
import httpx
import asyncio
import time
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
import secrets
from models import *
from services import EmailService, PaymentService, SocialService, ResaleService, NotificationService

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

# Initialize services
email_service = EmailService()
payment_service = PaymentService(db)
social_service = SocialService(db)
resale_service = ResaleService(db)
notification_service = NotificationService(db, email_service)

# Create the main app
app = FastAPI(title="TicketAI API", description="Complete AI-Powered Ticketing Platform with Advanced Features")
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

# TicketMaster Integration (keeping existing implementation)
class TicketMasterClient:
    def __init__(self):
        self.api_key = os.environ.get('TICKETMASTER_API_KEY', 'demo_key')
        self.base_url = "https://app.ticketmaster.com/discovery/v2"
        self.client = httpx.AsyncClient(timeout=30.0)
        self.demo_mode = True
    
    async def search_events(self, params: dict) -> List[Event]:
        """Search TicketMaster events (demo implementation)"""
        if self.demo_mode:
            return await self._get_demo_ticketmaster_events(params)
        return []
    
    async def _get_demo_ticketmaster_events(self, params: dict) -> List[Event]:
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
                "venue_info": {"name": "MetLife Stadium", "address": "1 MetLife Stadium Dr, East Rutherford, NJ 07073", "capacity": 82500},
                "price_ranges": [{"min": 89.99, "max": 599.99, "currency": "USD"}],
                "average_rating": 4.8,
                "tags": ["pop", "tour", "stadium"]
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
                "venue_info": {"name": "Madison Square Garden", "address": "4 Pennsylvania Plaza, New York, NY 10001", "capacity": 20789},
                "price_ranges": [{"min": 299.99, "max": 2999.99, "currency": "USD"}],
                "average_rating": 4.9,
                "tags": ["basketball", "finals", "championship"]
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
                "venue_info": {"name": "Richard Rodgers Theatre", "address": "226 W 46th St, New York, NY 10036", "capacity": 1319},
                "price_ranges": [{"min": 89.99, "max": 399.99, "currency": "USD"}],
                "average_rating": 4.7,
                "tags": ["musical", "broadway", "historical"]
            }
        ]
        
        return [Event(**event_data) for event_data in demo_events[:params.get("size", 5)]]
    
    async def close(self):
        await self.client.aclose()

ticketmaster_client = TicketMasterClient()

# AI Search Engine (keeping existing implementation)
class AISearchEngine:
    def __init__(self):
        self.llm_key = os.environ.get('EMERGENT_LLM_KEY')
    
    async def semantic_search(self, request: AISearchRequest) -> Dict:
        try:
            local_events = await db.events.find().to_list(100)
            tm_events = await ticketmaster_client.search_events({"keyword": request.query, "size": request.max_results})
            
            all_events = [Event(**event_data) for event_data in local_events] + tm_events
            
            if not all_events:
                return {"events": [], "ai_analysis": "No events found.", "search_interpretation": request.query}
            
            if self.llm_key:
                return await self._ai_rank_events(request, all_events)
            else:
                return await self._simple_search(request, all_events)
                
        except Exception as e:
            logging.error(f"AI Search error: {str(e)}")
            return {"events": [], "ai_analysis": "Search temporarily unavailable.", "search_interpretation": request.query}
    
    async def _ai_rank_events(self, request: AISearchRequest, events: List[Event]) -> Dict:
        try:
            events_text = "\n".join([
                f"Event: {event.name} | Category: {event.category} | Location: {event.location} | "
                f"Date: {event.date} | Price: ${event.price} | Rating: {event.average_rating}/5"
                for event in events[:20]
            ])
            
            chat = LlmChat(
                api_key=self.llm_key,
                session_id=f"search-{uuid.uuid4()}",
                system_message="You are an AI assistant that helps users find relevant events. Analyze search intent and rank events by relevance."
            ).with_model("openai", "gpt-4o-mini")
            
            user_message = UserMessage(
                text=f"User search: '{request.query}'\nLocation: {request.location or 'Any'}\n"
                     f"Events:\n{events_text}\n\nRank top {min(request.max_results, 10)} most relevant events with explanations."
            )
            
            ai_response = await chat.send_message(user_message)
            ranked_events = events[:request.max_results]
            
            return {
                "events": [event.dict() for event in ranked_events],
                "ai_analysis": ai_response,
                "search_interpretation": f"Analyzed '{request.query}' and found {len(ranked_events)} relevant events",
                "total_found": len(ranked_events)
            }
            
        except Exception as e:
            logging.error(f"AI ranking error: {str(e)}")
            return await self._simple_search(request, events)
    
    async def _simple_search(self, request: AISearchRequest, events: List[Event]) -> Dict:
        query_lower = request.query.lower()
        scored_events = []
        
        for event in events:
            score = 0
            if query_lower in event.name.lower(): score += 10
            if query_lower in event.description.lower(): score += 5
            if request.category and request.category.lower() in event.category.lower(): score += 8
            if request.location and request.location.lower() in event.location.lower(): score += 6
            
            if score > 0:
                scored_events.append((score, event))
        
        scored_events.sort(key=lambda x: x[0], reverse=True)
        ranked_events = [event for _, event in scored_events[:request.max_results]]
        
        return {
            "events": [event.dict() for event in ranked_events],
            "ai_analysis": f"Found {len(ranked_events)} events matching '{request.query}' using keyword search.",
            "search_interpretation": request.query,
            "total_found": len(ranked_events)
        }

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

async def get_optional_current_user(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False))):
    """Optional authentication for endpoints that work with or without login"""
    if not credentials:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None

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
    
    placeholder = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    return f"data:image/png;base64,{placeholder}"

# Routes
@api_router.get("/")
async def root():
    return {"message": "TicketAI API - Complete AI-Powered Ticketing Platform"}

# Authentication Routes (Enhanced)
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, background_tasks: BackgroundTasks):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    password_hash = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=password_hash,
        phone=user_data.phone,
        preferences={},
        wishlist=[],
        notification_settings={
            "email_confirmations": True,
            "email_reminders": True,
            "sms_notifications": False,
            "push_notifications": True
        }
    )
    
    await db.users.insert_one(user.dict())
    
    # Send welcome notification
    background_tasks.add_task(
        notification_service.create_notification,
        user.id,
        "welcome",
        "Welcome to TicketAI!",
        "Discover amazing events powered by AI. Start by exploring events or getting personalized recommendations."
    )
    
    return UserResponse(**user.dict())

@api_router.post("/auth/login")
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer", "user": UserResponse(**user)}

# Enhanced Event Routes
@api_router.get("/events", response_model=List[Event])
async def get_events(
    include_ticketmaster: bool = True,
    category: Optional[str] = None,
    location: Optional[str] = None,
    featured_only: bool = False,
    min_rating: float = 0.0
):
    events = []
    
    # Local events query
    query = {}
    if category:
        query["category"] = {"$regex": category, "$options": "i"}
    if featured_only:
        query["is_featured"] = True
    if min_rating > 0:
        query["average_rating"] = {"$gte": min_rating}
    
    local_events = await db.events.find(query).to_list(50)
    for event_data in local_events:
        events.append(Event(**event_data))
    
    # TicketMaster events
    if include_ticketmaster:
        tm_events = await ticketmaster_client.search_events({
            "keyword": category,
            "city": location,
            "size": 20
        })
        events.extend(tm_events)
    
    return events

@api_router.get("/events/featured", response_model=List[Event])
async def get_featured_events():
    """Get featured events"""
    local_events = await db.events.find({"is_featured": True}).to_list(10)
    events = [Event(**event) for event in local_events]
    
    # Add some TicketMaster events as featured
    tm_events = await ticketmaster_client.search_events({"size": 5})
    events.extend(tm_events)
    
    return events[:10]

@api_router.get("/events/trending", response_model=List[Event])
async def get_trending_events():
    """Get trending events based on bookings and ratings"""
    pipeline = [
        {"$lookup": {
            "from": "tickets",
            "localField": "id",
            "foreignField": "event_id",
            "as": "tickets"
        }},
        {"$addFields": {
            "ticket_count": {"$size": "$tickets"},
            "trend_score": {"$add": [
                {"$multiply": ["$average_rating", 2]},
                {"$size": "$tickets"}
            ]}
        }},
        {"$sort": {"trend_score": -1}},
        {"$limit": 10}
    ]
    
    trending = await db.events.aggregate(pipeline).to_list(10)
    events = [Event(**event) for event in trending]
    
    return events

@api_router.post("/events/search", response_model=Dict[str, Any])
async def ai_semantic_search(request: AISearchRequest):
    return await ai_search_engine.semantic_search(request)

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return Event(**event)

# Admin/Organizer Event Management
@api_router.post("/admin/events", response_model=Event)
async def create_event(event_data: EventCreate, current_user: User = Depends(get_current_user)):
    event = Event(
        **event_data.dict(),
        available_tickets=event_data.total_tickets,
        source="local",
        organizer_id=current_user.id
    )
    await db.events.insert_one(event.dict())
    return event

@api_router.put("/admin/events/{event_id}", response_model=Event)
async def update_event(event_id: str, event_data: EventUpdate, current_user: User = Depends(get_current_user)):
    # Verify ownership
    event = await db.events.find_one({"id": event_id, "organizer_id": current_user.id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found or access denied")
    
    update_data = {k: v for k, v in event_data.dict().items() if v is not None}
    await db.events.update_one({"id": event_id}, {"$set": update_data})
    
    updated_event = await db.events.find_one({"id": event_id})
    return Event(**updated_event)

# Enhanced Ticket Routes with Real Payments
@api_router.post("/tickets/checkout")
async def create_checkout_session(
    request: CheckoutRequest,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Create Stripe checkout session for ticket purchase"""
    user_email = current_user.email if current_user else None
    result = await payment_service.create_checkout_session(request, user_email)
    return result

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    """Get payment status and handle ticket creation"""
    try:
        stripe_checkout = StripeCheckout(
            api_key=os.environ.get('STRIPE_API_KEY'),
            webhook_url=""  # Not needed for status check
        )
        
        status_response = await stripe_checkout.get_checkout_status(session_id)
        
        if status_response.payment_status == "paid":
            # Handle successful payment
            result = await payment_service.handle_payment_success(session_id)
            if result and result["status"] == "success":
                return {
                    "status": "completed",
                    "payment_status": "paid",
                    "tickets": result["tickets"]
                }
        
        return {
            "status": status_response.status,
            "payment_status": status_response.payment_status
        }
        
    except Exception as e:
        logging.error(f"Error checking payment status: {str(e)}")
        return {"status": "error", "message": "Failed to check payment status"}

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle Stripe webhooks"""
    try:
        body = await request.body()
        stripe_signature = request.headers.get("stripe-signature")
        
        stripe_checkout = StripeCheckout(
            api_key=os.environ.get('STRIPE_API_KEY'),
            webhook_url=""
        )
        
        webhook_response = await stripe_checkout.handle_webhook(body, stripe_signature)
        
        if webhook_response.payment_status == "paid":
            # Process payment success in background
            background_tasks.add_task(
                payment_service.handle_payment_success,
                webhook_response.session_id
            )
        
        return {"status": "success"}
        
    except Exception as e:
        logging.error(f"Webhook error: {str(e)}")
        return {"status": "error"}

@api_router.get("/tickets/user/{user_email}", response_model=List[Ticket])
async def get_user_tickets(user_email: str, current_user: User = Depends(get_current_user)):
    if current_user.email != user_email:
        raise HTTPException(status_code=403, detail="Access denied")
    
    tickets = await db.tickets.find({"user_email": user_email}).to_list(100)
    return [Ticket(**ticket) for ticket in tickets]

# Ticket Transfer
@api_router.post("/tickets/transfer")
async def transfer_ticket(
    transfer_request: TicketTransfer,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Transfer ticket to another user"""
    # Verify ticket ownership
    ticket = await db.tickets.find_one({
        "id": transfer_request.ticket_id,
        "user_email": current_user.email,
        "status": "confirmed"
    })
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found or cannot be transferred")
    
    # Update ticket ownership
    transfer_record = {
        "from_email": current_user.email,
        "to_email": transfer_request.new_owner_email,
        "transfer_date": datetime.now(timezone.utc),
        "message": transfer_request.transfer_message
    }
    
    await db.tickets.update_one(
        {"id": transfer_request.ticket_id},
        {
            "$set": {
                "user_email": transfer_request.new_owner_email,
                "user_name": transfer_request.new_owner_name
            },
            "$push": {"transfer_history": transfer_record}
        }
    )
    
    return {"status": "success", "message": "Ticket transferred successfully"}

# Social Features Routes
@api_router.post("/social/wishlist/{event_id}")
async def add_to_wishlist(event_id: str, current_user: User = Depends(get_current_user)):
    success = await social_service.add_to_wishlist(current_user.id, event_id)
    if success:
        return {"status": "added", "message": "Event added to wishlist"}
    else:
        return {"status": "exists", "message": "Event already in wishlist"}

@api_router.delete("/social/wishlist/{event_id}")
async def remove_from_wishlist(event_id: str, current_user: User = Depends(get_current_user)):
    success = await social_service.remove_from_wishlist(current_user.id, event_id)
    return {"status": "success" if success else "error"}

@api_router.get("/social/wishlist", response_model=List[Event])
async def get_wishlist(current_user: User = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user.id})
    if not user or not user.get("wishlist"):
        return []
    
    events = await db.events.find({"id": {"$in": user["wishlist"]}}).to_list(100)
    return [Event(**event) for event in events]

@api_router.post("/social/reviews", response_model=EventReview)
async def create_review(review: ReviewCreate, current_user: User = Depends(get_current_user)):
    event_review = await social_service.create_review(review, current_user.id, current_user.name)
    if not event_review:
        raise HTTPException(status_code=400, detail="Failed to create review")
    return event_review

@api_router.get("/social/reviews/{event_id}", response_model=List[EventReview])
async def get_event_reviews(event_id: str):
    reviews = await db.event_reviews.find({"event_id": event_id}).sort("created_at", -1).to_list(100)
    return [EventReview(**review) for review in reviews]

# Resale Market Routes
@api_router.post("/resale/list", response_model=ResaleTicket)
async def list_ticket_for_resale(
    listing: ResaleListingCreate,
    current_user: User = Depends(get_current_user)
):
    resale_ticket = await resale_service.list_ticket_for_resale(
        listing, current_user.email, current_user.name
    )
    if not resale_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found or cannot be listed")
    return resale_ticket

@api_router.get("/resale/listings", response_model=List[ResaleTicket])
async def get_resale_listings(event_id: Optional[str] = None):
    listings = await resale_service.get_resale_listings(event_id)
    return listings

# Notification Routes
@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(current_user: User = Depends(get_current_user)):
    notifications = await db.notifications.find({"user_id": current_user.id}).sort("created_at", -1).to_list(50)
    return [Notification(**notification) for notification in notifications]

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.id},
        {"$set": {"is_read": True}}
    )
    return {"status": "success"}

# Analytics Routes
@api_router.get("/analytics/events")
async def get_event_analytics():
    local_events = await db.events.count_documents({})
    total_tickets = await db.tickets.count_documents({})
    total_revenue = await db.payment_transactions.aggregate([
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    
    return {
        "total_local_events": local_events,
        "total_tickets_sold": total_tickets,
        "total_revenue": total_revenue[0]["total"] if total_revenue else 0,
        "ticketmaster_integration": "active",
        "ai_search_enabled": bool(os.environ.get('EMERGENT_LLM_KEY')),
        "payment_processing": "stripe_live",
        "resale_market": "active"
    }

# AI Recommendations (Enhanced)
@api_router.post("/recommendations")
async def get_recommendations(request: RecommendationRequest, current_user: Optional[User] = Depends(get_optional_current_user)):
    try:
        # Get user's event history for better recommendations
        user_history = []
        if current_user:
            tickets = await db.tickets.find({"user_email": current_user.email}).to_list(50)
            user_history = [ticket["event_id"] for ticket in tickets]
        
        # Get all events
        local_events = await db.events.find().to_list(50)
        tm_events = await ticketmaster_client.search_events({"size": 20})
        
        all_events = [Event(**event_data) for event_data in local_events] + tm_events
        
        if not all_events:
            return {"recommendations": [], "message": "No events available"}
        
        # Enhanced AI prompt with user history
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            return {"recommendations": all_events[:3], "message": "AI recommendations unavailable"}
        
        events_text = "\n".join([
            f"- {event.name}: {event.description} ({event.category}) at {event.location} "
            f"- ${event.price} | Rating: {event.average_rating}/5 | Source: {event.source}"
            for event in all_events
        ])
        
        history_text = ""
        if user_history:
            history_events = await db.events.find({"id": {"$in": user_history}}).to_list(20)
            history_text = f"\nUser's past events: {', '.join([event.get('name', '') for event in history_events])}"
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"recommendations-{uuid.uuid4()}",
            system_message="You are an AI that recommends events based on user preferences and history. Provide personalized suggestions."
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(
            text=f"User preferences: {request.user_preferences}\n"
                 f"Location: {request.location or 'Any'}\n{history_text}\n\n"
                 f"Available events:\n{events_text}\n\n"
                 f"Recommend the top 5 events with detailed explanations considering user's preferences and history."
        )
        
        response = await chat.send_message(user_message)
        recommended_events = all_events[:5]
        
        return {
            "recommendations": [event.dict() for event in recommended_events],
            "ai_explanation": response,
            "message": "AI-powered personalized recommendations",
            "total_events_considered": len(all_events)
        }
        
    except Exception as e:
        logging.error(f"Error in recommendations: {str(e)}")
        events = await db.events.find().sort("average_rating", -1).to_list(3)
        return {
            "recommendations": [Event(**event).dict() for event in events],
            "message": "Showing highly-rated events"
        }

# Background Tasks
@app.on_event("startup")
async def startup_event():
    """Initialize the application"""
    # Create sample events
    existing_events = await db.events.find().to_list(1)
    if not existing_events:
        sample_events = [
            EventCreate(
                name="Tech Conference 2025",
                description="Annual technology conference featuring the latest innovations in AI, blockchain, and software development.",
                date=datetime(2025, 3, 15, 9, 0, 0),
                location="San Francisco, CA",
                price=299.99,
                total_tickets=500,
                category="Technology",
                image_url="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
                tags=["ai", "blockchain", "networking"]
            ),
            EventCreate(
                name="Summer Music Festival",
                description="Three-day outdoor music festival featuring emerging artists and established performers.",
                date=datetime(2025, 7, 20, 18, 0, 0),
                location="Austin, TX",
                price=199.99,
                total_tickets=2000,
                category="Music",
                image_url="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
                tags=["music", "outdoor", "festival"]
            )
        ]
        
        for event_data in sample_events:
            event = Event(
                **event_data.dict(),
                available_tickets=event_data.total_tickets,
                source="local",
                is_featured=True,
                average_rating=4.5
            )
            await db.events.insert_one(event.dict())
        
        logging.info("Sample events created successfully")

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_event():
    client.close()
    await ticketmaster_client.close()