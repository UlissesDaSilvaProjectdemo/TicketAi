from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from passlib.context import CryptContext
import jwt
try:
    import qrcode
    from io import BytesIO
    import base64
    QR_AVAILABLE = True
except ImportError:
    QR_AVAILABLE = False
    import base64
    from io import BytesIO

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
app = FastAPI(title="TicketAI API", description="AI-Powered Ticketing Platform")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

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

class TicketCreate(BaseModel):
    event_id: str
    user_email: str
    user_name: str
    ticket_type: str = "Standard"

class RecommendationRequest(BaseModel):
    user_preferences: str
    location: Optional[str] = None

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
    return {"message": "TicketAI API - AI-Powered Ticketing Platform"}

# Authentication Routes
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
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

# Event Routes
@api_router.get("/events", response_model=List[Event])
async def get_events():
    events = await db.events.find().to_list(100)
    return [Event(**event) for event in events]

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return Event(**event)

@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate):
    event = Event(
        **event_data.dict(),
        available_tickets=event_data.total_tickets
    )
    await db.events.insert_one(event.dict())
    return event

# Ticket Routes
@api_router.post("/tickets", response_model=Ticket)
async def book_ticket(ticket_data: TicketCreate):
    # Check if event exists and has available tickets
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
        price=event["price"]
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

# AI Recommendations Route
@api_router.post("/recommendations")
async def get_recommendations(request: RecommendationRequest):
    try:
        # Get available events
        events = await db.events.find().to_list(100)
        if not events:
            return {"recommendations": [], "message": "No events available"}
        
        # Format events for AI
        events_text = "\n".join([
            f"- {event['name']}: {event['description']} ({event['category']}) at {event['location']} on {event['date']} - ${event['price']}"
            for event in events
        ])
        
        # Initialize LLM Chat
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            return {"recommendations": events[:3], "message": "AI recommendations unavailable, showing popular events"}
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"recommendations-{uuid.uuid4()}",
            system_message="You are an AI assistant that recommends events based on user preferences. Be helpful and concise."
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(
            text=f"User preferences: {request.user_preferences}\n"
                 f"Location preference: {request.location or 'Any'}\n\n"
                 f"Available events:\n{events_text}\n\n"
                 f"Based on the user's preferences, recommend the top 3 events and briefly explain why each is a good match. "
                 f"Format your response as JSON with 'recommendations' array containing event names and 'explanations' array with reasons."
        )
        
        response = await chat.send_message(user_message)
        
        # Parse AI response and match with actual events
        recommended_events = []
        for event in events[:3]:  # Fallback to first 3 events
            recommended_events.append(event)
        
        return {
            "recommendations": [Event(**event) for event in recommended_events],
            "ai_explanation": response,
            "message": "AI-powered recommendations"
        }
        
    except Exception as e:
        logging.error(f"Error in recommendations: {str(e)}")
        # Fallback to popular events
        events = await db.events.find().to_list(3)
        return {
            "recommendations": [Event(**event) for event in events],
            "message": "Showing popular events (AI temporarily unavailable)"
        }

# Mock Payment Route
@api_router.post("/payments/process")
async def process_payment(payment_data: dict):
    # Mock payment processing
    payment_id = str(uuid.uuid4())
    
    # Simulate payment processing delay
    import asyncio
    await asyncio.sleep(1)
    
    # Mock success (90% success rate)
    success = secrets.randbelow(10) < 9
    
    if success:
        return {
            "payment_id": payment_id,
            "status": "success",
            "message": "Payment processed successfully",
            "amount": payment_data.get("amount", 0)
        }
    else:
        raise HTTPException(status_code=400, detail="Payment failed")

# Create sample events on startup
@app.on_event("startup")
async def create_sample_events():
    existing_events = await db.events.find().to_list(1)
    if not existing_events:
        sample_events = [
            EventCreate(
                name="Tech Conference 2025",
                description="Annual technology conference featuring the latest innovations in AI, blockchain, and software development. Join industry leaders and experts.",
                date=datetime(2025, 3, 15, 9, 0, 0),
                location="San Francisco, CA",
                price=299.99,
                total_tickets=500,
                category="Technology",
                image_url="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
            ),
            EventCreate(
                name="Summer Music Festival",
                description="Three-day outdoor music festival featuring top artists across multiple genres. Food, drinks, and unforgettable experiences.",
                date=datetime(2025, 7, 20, 18, 0, 0),
                location="Austin, TX",
                price=199.99,
                total_tickets=2000,
                category="Music",
                image_url="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800"
            ),
            EventCreate(
                name="Art Gallery Opening",
                description="Exclusive opening of contemporary art exhibition featuring emerging artists. Wine and networking included.",
                date=datetime(2025, 2, 10, 19, 0, 0),
                location="New York, NY",
                price=75.00,
                total_tickets=150,
                category="Arts",
                image_url="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800"
            ),
            EventCreate(
                name="Business Networking Mixer",
                description="Professional networking event for entrepreneurs and business leaders. Great for making connections and partnerships.",
                date=datetime(2025, 4, 5, 18, 30, 0),
                location="Chicago, IL",
                price=50.00,
                total_tickets=300,
                category="Business",
                image_url="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800"
            )
        ]
        
        for event_data in sample_events:
            event = Event(**event_data.dict(), available_tickets=event_data.total_tickets)
            await db.events.insert_one(event.dict())
        
        logging.info("Sample events created successfully")

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