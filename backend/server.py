from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
import json
import asyncio
import jwt
from datetime import timedelta
import stripe


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Helper functions for datetime serialization
def prepare_for_mongo(data):
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
            elif key == 'date' and isinstance(value, str):
                # Keep date strings as is
                pass
            elif key == 'time' and isinstance(value, str):
                # Keep time strings as is
                pass
    return data

def parse_from_mongo(item):
    if isinstance(item, dict):
        for key, value in item.items():
            if key == 'timestamp' and isinstance(value, str):
                try:
                    item[key] = datetime.fromisoformat(value)
                except:
                    pass
    return item

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    venue: str
    location: str
    date: str  # ISO format date string
    time: str  # Time string
    category: str
    price: str
    available_tickets: int
    age_restriction: str
    duration: str
    image_url: Optional[str] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventCreate(BaseModel):
    name: str
    description: str
    venue: str
    location: str
    date: str
    time: str
    category: str
    price: str
    available_tickets: int
    age_restriction: str
    duration: str
    image_url: Optional[str] = None
    tags: List[str] = []

class AISearchRequest(BaseModel):
    query: str
    location: Optional[str] = None

class AIRecommendationRequest(BaseModel):
    interests: str
    location: Optional[str] = None

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    amount: float
    currency: str = "usd"
    package_id: Optional[str] = None
    payment_status: str = "pending"
    status: str = "initiated"
    metadata: Optional[dict] = None
    user_email: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DonationRequest(BaseModel):
    package_id: Optional[str] = None
    custom_amount: Optional[float] = None
    origin_url: str

# Live Streaming Models
class StreamEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    organizer_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    ingest_rtmp_url: Optional[str] = None
    stream_key: Optional[str] = None
    playback_id: Optional[str] = None
    status: str = "scheduled"  # scheduled, live, ended
    price: float
    ticket_type: str = "pay_per_view"  # pay_per_view, subscription, vip
    thumbnail_url: Optional[str] = None
    quality: str = "HD"
    features: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StreamEventCreate(BaseModel):
    title: str
    description: str
    start_time: datetime
    end_time: Optional[datetime] = None
    price: float
    ticket_type: str = "pay_per_view"
    thumbnail_url: Optional[str] = None
    quality: str = "HD"
    features: List[str] = []

class StreamTicket(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    stream_event_id: str
    user_id: str
    ticket_type: str
    price: float
    purchased_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    access_expires: Optional[datetime] = None
    stripe_payment_intent_id: Optional[str] = None

class PlaybackToken(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    stream_ticket_id: str
    token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StreamAnalytics(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    stream_event_id: str
    user_id: Optional[str] = None
    event_type: str  # viewer_joined, viewer_left, chat_message, tip_sent, etc.
    payload: dict = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# CRM Models for Promoter Dashboard
class PromoterUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: Optional[str] = None
    company: Optional[str] = None
    credits: int = 0
    plan: str = "free"  # free, pro, enterprise
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None
    settings: dict = {}

class CRMEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    promoter_id: str
    name: str
    description: str
    category: str
    venue: str
    location: str
    date: str
    time: str
    price: float
    capacity: int
    status: str = "scheduled"  # scheduled, active, completed, cancelled
    tickets_sold: int = 0
    revenue: float = 0.0
    stream_viewers: int = 0
    engagement_score: float = 0.0
    boost_level: int = 0  # 0=none, 1=basic, 2=premium, 3=max
    boost_expires: Optional[datetime] = None
    image_url: Optional[str] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CRMContact(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    promoter_id: str
    name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    purchase_history: int = 0
    total_spent: float = 0.0
    last_event: Optional[str] = None
    engagement_score: float = 0.0
    segments: List[str] = []  # vip, regular, new_customer, etc.
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_interaction: Optional[datetime] = None

class CRMCampaign(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    promoter_id: str
    name: str
    type: str  # email, sms, push, social
    status: str = "draft"  # draft, active, paused, completed
    target_segments: List[str] = []
    content: dict = {}  # subject, body, etc.
    sent_count: int = 0
    opened_count: int = 0
    clicked_count: int = 0
    converted_count: int = 0
    revenue: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    scheduled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class CRMPayout(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    promoter_id: str
    amount: float
    currency: str = "usd"
    status: str = "pending"  # pending, processing, paid, failed
    payout_method: str = "stripe"  # stripe, bank_transfer, paypal
    transaction_ids: List[str] = []  # Related transaction IDs
    stripe_payout_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    processed_at: Optional[datetime] = None
    metadata: dict = {}

class CRMTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    promoter_id: str
    event_id: Optional[str] = None
    contact_id: Optional[str] = None
    type: str  # ticket_sale, stream_view, tip, merchandise, boost_payment, subscription
    amount: float
    currency: str = "usd"
    status: str = "completed"  # pending, completed, failed, refunded
    payment_method: str = "stripe"
    stripe_payment_intent_id: Optional[str] = None
    description: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: dict = {}

class CRMDashboardData(BaseModel):
    total_revenue: float
    total_revenue_mtd: float
    tickets_sold: int
    active_events: int
    stream_revenue: float
    pending_payouts: float
    revenue_growth: float
    audience_growth: float
    conversion_rate: float
    avg_ticket_price: float
    top_events: List[dict]
    revenue_breakdown: dict
    period_start: datetime
    period_end: datetime

class CRMApiUsage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str  # External platform using TicketAI CRM
    client_name: str
    plan: str = "pay_as_you_go"  # pay_as_you_go, monthly, enterprise
    endpoint: str  # /api/crm/events, /api/crm/analytics, etc.
    requests_count: int = 1
    billing_amount: float = 0.0  # Cost per request
    currency: str = "usd"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    billing_period: str  # daily, monthly
    metadata: dict = {}

class ContactInquiry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    company: Optional[str] = None
    event_type: Optional[str] = None
    message: Optional[str] = None
    source: str = "website"  # landing_page_crm_popup, contact_form, etc.
    status: str = "new"  # new, contacted, qualified, converted
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: Optional[str] = None

class Subscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    country_code: str
    subscribed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    source: str = "popup"  # popup, footer, etc.
    status: str = "active"  # active, unsubscribed

class PlaybackTokenRequest(BaseModel):
    stream_event_id: str
    user_id: str

class StreamPurchaseRequest(BaseModel):
    stream_event_id: str
    user_id: str
    origin_url: str

# Mock CRM data for development
MOCK_CRM_EVENTS = [
    {
        "id": "crm-event-1",
        "promoter_id": "test-promoter-1",
        "name": "TechFest 2025",
        "description": "Annual technology conference and expo",
        "category": "Technology",
        "venue": "Convention Center",
        "location": "San Francisco, CA",
        "date": "2024-12-15",
        "time": "09:00",
        "price": 125.00,
        "capacity": 1200,
        "status": "active",
        "tickets_sold": 950,
        "revenue": 11875.00,
        "stream_viewers": 2340,
        "engagement_score": 85.0,
        "boost_level": 2,
        "image_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        "tags": ["tech", "conference", "networking"],
        "created_at": datetime.now(timezone.utc) - timedelta(days=30)
    },
    {
        "id": "crm-event-2", 
        "promoter_id": "test-promoter-1",
        "name": "Music Night LA",
        "description": "Live music and entertainment",
        "category": "Music",
        "venue": "The Grand Theater",
        "location": "Los Angeles, CA",
        "date": "2024-12-20",
        "time": "19:00",
        "price": 75.00,
        "capacity": 800,
        "status": "scheduled",
        "tickets_sold": 400,
        "revenue": 6000.00,
        "stream_viewers": 0,
        "engagement_score": 92.0,
        "boost_level": 1,
        "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
        "tags": ["music", "live", "concert"],
        "created_at": datetime.now(timezone.utc) - timedelta(days=15)
    },
    {
        "id": "crm-event-3",
        "promoter_id": "test-promoter-1", 
        "name": "Comedy Jam",
        "description": "Stand-up comedy night",
        "category": "Comedy",
        "venue": "Comedy Club Downtown",
        "location": "New York, NY",
        "date": "2024-11-25",
        "time": "20:30",
        "price": 45.00,
        "capacity": 350,
        "status": "completed",
        "tickets_sold": 320,
        "revenue": 3200.00,
        "stream_viewers": 890,
        "engagement_score": 78.0,
        "boost_level": 0,
        "image_url": "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800",
        "tags": ["comedy", "standup", "entertainment"],
        "created_at": datetime.now(timezone.utc) - timedelta(days=45)
    }
]

MOCK_CRM_CONTACTS = [
    {
        "id": "contact-1",
        "promoter_id": "test-promoter-1",
        "name": "Sarah Johnson",
        "email": "sarah@example.com",
        "phone": "+1-555-0123",
        "location": "Los Angeles, CA",
        "purchase_history": 4,
        "total_spent": 180.00,
        "last_event": "TechFest 2025",
        "engagement_score": 95.0,
        "segments": ["vip", "tech_enthusiast"],
        "created_at": datetime.now(timezone.utc) - timedelta(days=120),
        "last_interaction": datetime.now(timezone.utc) - timedelta(days=3)
    },
    {
        "id": "contact-2",
        "promoter_id": "test-promoter-1",
        "name": "Michael Chen", 
        "email": "michael@example.com",
        "phone": "+1-555-0124",
        "location": "San Francisco, CA",
        "purchase_history": 7,
        "total_spent": 315.00,
        "last_event": "Music Night LA",
        "engagement_score": 88.0,
        "segments": ["regular", "music_lover"],
        "created_at": datetime.now(timezone.utc) - timedelta(days=200),
        "last_interaction": datetime.now(timezone.utc) - timedelta(days=7)
    },
    {
        "id": "contact-3",
        "promoter_id": "test-promoter-1",
        "name": "Emma Davis",
        "email": "emma@example.com", 
        "phone": "+1-555-0125",
        "location": "New York, NY",
        "purchase_history": 2,
        "total_spent": 90.00,
        "last_event": "Comedy Jam",
        "engagement_score": 72.0,
        "segments": ["new_customer", "comedy_fan"],
        "created_at": datetime.now(timezone.utc) - timedelta(days=60),
        "last_interaction": datetime.now(timezone.utc) - timedelta(days=14)
    }
]

MOCK_CRM_CAMPAIGNS = [
    {
        "id": "campaign-1",
        "promoter_id": "test-promoter-1",
        "name": "TechFest Early Bird",
        "type": "email",
        "status": "active",
        "target_segments": ["tech_enthusiast", "vip"],
        "content": {
            "subject": "Early Bird Special - TechFest 2025",
            "body": "Get your tickets now with 20% discount"
        },
        "sent_count": 2450,
        "opened_count": 1840,
        "clicked_count": 340,
        "converted_count": 85,
        "revenue": 4250.00,
        "created_at": datetime.now(timezone.utc) - timedelta(days=10),
        "scheduled_at": datetime.now(timezone.utc) - timedelta(days=8)
    },
    {
        "id": "campaign-2",
        "promoter_id": "test-promoter-1",
        "name": "VIP Upgrade Offer",
        "type": "notification",
        "status": "completed",
        "target_segments": ["regular"],
        "content": {
            "title": "Upgrade to VIP Access",
            "message": "Limited time VIP upgrade available"
        },
        "sent_count": 950,
        "opened_count": 720,
        "clicked_count": 180,
        "converted_count": 45,
        "revenue": 2250.00,
        "created_at": datetime.now(timezone.utc) - timedelta(days=25),
        "completed_at": datetime.now(timezone.utc) - timedelta(days=20)
    }
]

MOCK_CRM_TRANSACTIONS = [
    {
        "id": "tx-1",
        "promoter_id": "test-promoter-1",
        "event_id": "crm-event-1",
        "contact_id": "contact-1",
        "type": "ticket_sale",
        "amount": 125.00,
        "currency": "usd",
        "status": "completed",
        "payment_method": "stripe",
        "description": "TechFest 2025 - General Admission",
        "created_at": datetime.now(timezone.utc) - timedelta(days=5)
    },
    {
        "id": "tx-2", 
        "promoter_id": "test-promoter-1",
        "event_id": "crm-event-2",
        "contact_id": "contact-2",
        "type": "stream_view",
        "amount": 15.00,
        "currency": "usd",
        "status": "completed",
        "payment_method": "stripe",
        "description": "Music Night LA - Stream Access",
        "created_at": datetime.now(timezone.utc) - timedelta(days=2)
    },
    {
        "id": "tx-3",
        "promoter_id": "test-promoter-1",
        "event_id": "crm-event-3",
        "contact_id": "contact-3",
        "type": "tip",
        "amount": 10.00,
        "currency": "usd", 
        "status": "completed",
        "payment_method": "stripe",
        "description": "Tip for Comedy Jam performance",
        "created_at": datetime.now(timezone.utc) - timedelta(days=1)
    }
]

# Mock event data for development
MOCK_EVENTS = [
    {
        "id": str(uuid.uuid4()),
        "name": "Arctic Monkeys Live",
        "description": "The legendary indie rock band returns with their latest tour featuring hits from their new album.",
        "venue": "Madison Square Garden",
        "location": "New York, NY",
        "date": "2024-12-15",
        "time": "20:00",
        "category": "Music",
        "price": "$89",
        "available_tickets": 150,
        "age_restriction": "18+",
        "duration": "3 hours",
        "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
        "tags": ["rock", "indie", "live music", "concert"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid.uuid4()),
        "name": "AI & Machine Learning Summit",
        "description": "Join industry leaders discussing the future of AI and machine learning technologies.",
        "venue": "Javits Center",
        "location": "New York, NY",
        "date": "2025-01-10",
        "time": "09:00",
        "category": "Conference",
        "price": "$299",
        "available_tickets": 500,
        "age_restriction": "All Ages",
        "duration": "8 hours",
        "image_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop",
        "tags": ["technology", "ai", "conference", "networking"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Stand-Up Comedy Night",
        "description": "Laugh out loud with the city's best comedians in an intimate venue.",
        "venue": "Comedy Cellar",
        "location": "New York, NY",
        "date": "2024-12-16",
        "time": "21:00",
        "category": "Comedy",
        "price": "$35",
        "available_tickets": 80,
        "age_restriction": "21+",
        "duration": "2 hours",
        "image_url": "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=300&h=200&fit=crop",
        "tags": ["comedy", "entertainment", "nightlife"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Modern Art Gallery Opening",
        "description": "Exclusive opening of contemporary art exhibition featuring emerging artists.",
        "venue": "MoMA",
        "location": "New York, NY",
        "date": "2024-12-19",
        "time": "18:00",
        "category": "Art",
        "price": "Free",
        "available_tickets": 200,
        "age_restriction": "All Ages",
        "duration": "4 hours",
        "image_url": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200&fit=crop",
        "tags": ["art", "gallery", "culture", "exhibition"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Knicks vs Lakers",
        "description": "Epic NBA matchup between two legendary teams in the heart of New York.",
        "venue": "Madison Square Garden",
        "location": "New York, NY",
        "date": "2024-12-21",
        "time": "19:30",
        "category": "Sports",
        "price": "$150",
        "available_tickets": 300,
        "age_restriction": "All Ages",
        "duration": "3 hours",
        "image_url": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=200&fit=crop",
        "tags": ["basketball", "nba", "sports", "knicks", "lakers"],
        "created_at": datetime.now(timezone.utc)
    }
]

# Initialize LLM Chat
def get_llm_chat():
    return LlmChat(
        api_key=os.environ.get('EMERGENT_LLM_KEY'),
        session_id=str(uuid.uuid4()),
        system_message="You are an AI assistant that helps users find events. You analyze user queries and match them with relevant events. Always respond in JSON format with event recommendations."
    ).with_model("openai", "gpt-5")

# Donation packages - defined on backend for security
DONATION_PACKAGES = {
    "coffee": 5.0,
    "super": 15.0,
    "champion": 50.0
}

# Initialize Stripe
stripe.api_key = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')

def get_stripe_checkout(host_url: str):
    api_key = os.environ.get('STRIPE_API_KEY')
    webhook_url = f"{host_url}/api/webhook/stripe"
    return StripeCheckout(api_key=api_key, webhook_url=webhook_url)

# Basic routes
@api_router.get("/")
async def root():
    return {"message": "TicketAI API - AI-Powered Event Discovery"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    prepared_dict = prepare_for_mongo(status_obj.dict())
    _ = await db.status_checks.insert_one(prepared_dict)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**parse_from_mongo(status_check)) for status_check in status_checks]

# Events endpoints
@api_router.get("/events", response_model=List[Event])
async def get_events():
    """Get all events (currently returns mock data)"""
    try:
        # For now, return mock data. Later we'll fetch from database
        events = []
        for event_data in MOCK_EVENTS:
            event = Event(**event_data)
            events.append(event)
        return events
    except Exception as e:
        logger.error(f"Error getting events: {e}")
        raise HTTPException(status_code=500, detail="Failed to get events")

@api_router.post("/events", response_model=Event)
async def create_event(event: EventCreate):
    """Create a new event"""
    try:
        event_dict = event.dict()
        event_obj = Event(**event_dict)
        prepared_dict = prepare_for_mongo(event_obj.dict())
        
        # Store in database
        result = await db.events.insert_one(prepared_dict)
        
        return event_obj
    except Exception as e:
        logger.error(f"Error creating event: {e}")
        raise HTTPException(status_code=500, detail="Failed to create event")

@api_router.post("/ai-search")
async def ai_search(request: AISearchRequest):
    """AI-powered event search using natural language"""
    try:
        # Get all available events (mock data for now)
        events_data = MOCK_EVENTS
        
        # Create a structured prompt for the AI
        events_json = json.dumps([{
            "id": event["id"],
            "name": event["name"],
            "description": event["description"],
            "venue": event["venue"],
            "location": event["location"],
            "date": event["date"],
            "time": event["time"],
            "category": event["category"],
            "price": event["price"],
            "tags": event["tags"]
        } for event in events_data], indent=2)
        
        prompt = f"""
        User Query: "{request.query}"
        Location Preference: {request.location or "Any location"}
        
        Available Events:
        {events_json}
        
        Based on the user's query, find the most relevant events. Consider:
        - Keywords in the query matching event names, descriptions, categories, or tags
        - Date preferences if mentioned
        - Price preferences if mentioned
        - Location if specified
        - Category preferences
        
        Return ONLY a JSON array of event IDs that match the query, ordered by relevance.
        Example: ["event-id-1", "event-id-2"]
        
        If no events match well, return an empty array: []
        """
        
        # Get AI response
        chat = get_llm_chat()
        user_message = UserMessage(text=prompt)
        ai_response = await chat.send_message(user_message)
        
        # Parse AI response to get event IDs
        try:
            # Extract JSON from AI response
            response_text = ai_response.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:-3].strip()
            elif response_text.startswith("```"):
                response_text = response_text[3:-3].strip()
            
            selected_ids = json.loads(response_text)
            
            # Filter events by selected IDs
            matching_events = []
            for event in events_data:
                if event["id"] in selected_ids:
                    matching_events.append(Event(**event))
            
            # If no specific matches, do keyword-based fallback
            if not matching_events:
                query_lower = request.query.lower()
                for event in events_data:
                    if (any(keyword in event["name"].lower() or 
                           keyword in event["description"].lower() or 
                           keyword in event["category"].lower() or
                           keyword in " ".join(event["tags"]).lower()
                           for keyword in query_lower.split()) or
                        query_lower in event["name"].lower() or
                        query_lower in event["description"].lower()):
                        matching_events.append(Event(**event))
                        if len(matching_events) >= 6:  # Limit results
                            break
            
            return {
                "query": request.query,
                "results": matching_events[:6],  # Return max 6 results
                "total_found": len(matching_events)
            }
            
        except json.JSONDecodeError:
            # Fallback to keyword matching if AI response is not valid JSON
            logger.warning("AI response was not valid JSON, using keyword fallback")
            query_lower = request.query.lower()
            matching_events = []
            
            for event in events_data:
                if (any(keyword in event["name"].lower() or 
                       keyword in event["description"].lower() or 
                       keyword in event["category"].lower() or
                       keyword in " ".join(event["tags"]).lower()
                       for keyword in query_lower.split()) or
                    query_lower in event["name"].lower() or
                    query_lower in event["description"].lower()):
                    matching_events.append(Event(**event))
                    if len(matching_events) >= 6:
                        break
            
            return {
                "query": request.query,
                "results": matching_events,
                "total_found": len(matching_events)
            }
        
    except Exception as e:
        logger.error(f"Error in AI search: {e}")
        raise HTTPException(status_code=500, detail=f"AI search failed: {str(e)}")

@api_router.post("/ai-recommendations")
async def ai_recommendations(request: AIRecommendationRequest):
    """Get AI-powered event recommendations based on user interests"""
    try:
        # Get all available events (mock data for now)
        events_data = MOCK_EVENTS
        
        # Create a structured prompt for the AI
        events_json = json.dumps([{
            "id": event["id"],
            "name": event["name"],
            "description": event["description"],
            "venue": event["venue"],
            "location": event["location"],
            "date": event["date"],
            "time": event["time"],
            "category": event["category"],
            "price": event["price"],
            "tags": event["tags"]
        } for event in events_data], indent=2)
        
        prompt = f"""
        User Interests: "{request.interests}"
        Location Preference: {request.location or "Any location"}
        
        Available Events:
        {events_json}
        
        Based on the user's interests, recommend the most suitable events. Consider:
        - How well the events match their stated interests
        - Variety in recommendations (different categories if appropriate)
        - Quality and relevance of the match
        - Location preference if specified
        
        Return ONLY a JSON array of event IDs that you recommend, ordered by relevance.
        Example: ["event-id-1", "event-id-2", "event-id-3"]
        
        Recommend 3-5 events maximum.
        """
        
        # Get AI response
        chat = get_llm_chat()
        user_message = UserMessage(text=prompt)
        ai_response = await chat.send_message(user_message)
        
        # Parse AI response to get event IDs
        try:
            # Extract JSON from AI response
            response_text = ai_response.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:-3].strip()
            elif response_text.startswith("```"):
                response_text = response_text[3:-3].strip()
            
            selected_ids = json.loads(response_text)
            
            # Filter events by selected IDs
            recommended_events = []
            for event in events_data:
                if event["id"] in selected_ids:
                    recommended_events.append(Event(**event))
            
            # If no specific matches, provide general recommendations
            if not recommended_events:
                recommended_events = [Event(**event) for event in events_data[:3]]
            
            return {
                "interests": request.interests,
                "location": request.location,
                "recommendations": recommended_events[:5],  # Max 5 recommendations
                "total_found": len(recommended_events)
            }
            
        except json.JSONDecodeError:
            # Fallback to returning first few events
            logger.warning("AI response was not valid JSON, using fallback recommendations")
            recommended_events = [Event(**event) for event in events_data[:3]]
            
            return {
                "interests": request.interests,
                "location": request.location,
                "recommendations": recommended_events,
                "total_found": len(recommended_events)
            }
        
    except Exception as e:
        logger.error(f"Error in AI recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"AI recommendations failed: {str(e)}")

# Donation endpoints
@api_router.post("/donations/checkout", response_model=CheckoutSessionResponse)
async def create_donation_checkout(request: DonationRequest, http_request: Request):
    try:
        # Validate donation amount
        amount = None
        if request.package_id:
            if request.package_id not in DONATION_PACKAGES:
                raise HTTPException(status_code=400, detail="Invalid donation package")
            amount = DONATION_PACKAGES[request.package_id]
        elif request.custom_amount:
            if request.custom_amount < 1.0 or request.custom_amount > 1000.0:
                raise HTTPException(status_code=400, detail="Custom amount must be between $1 and $1000")
            amount = float(request.custom_amount)
        else:
            raise HTTPException(status_code=400, detail="Either package_id or custom_amount is required")

        # Get host URL from request
        host_url = str(http_request.base_url).rstrip('/')
        
        # Create success and cancel URLs
        success_url = f"{request.origin_url}/donation/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{request.origin_url}"
        
        # Initialize Stripe
        stripe_checkout = get_stripe_checkout(host_url)
        
        # Create checkout session
        checkout_request = CheckoutSessionRequest(
            amount=amount,
            currency="usd",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "type": "donation",
                "package_id": request.package_id or "custom",
                "amount": str(amount)
            }
        )
        
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create payment transaction record
        transaction = PaymentTransaction(
            session_id=session.session_id,
            amount=amount,
            currency="usd",
            package_id=request.package_id,
            payment_status="pending",
            status="initiated",
            metadata=checkout_request.metadata
        )
        
        # Store transaction in database
        transaction_dict = prepare_for_mongo(transaction.dict())
        await db.payment_transactions.insert_one(transaction_dict)
        
        logger.info(f"Created donation checkout session: {session.session_id} for amount: ${amount}")
        
        return session
        
    except Exception as e:
        logger.error(f"Error creating donation checkout: {e}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")

@api_router.get("/donations/status/{session_id}", response_model=CheckoutStatusResponse)
async def get_donation_status(session_id: str, http_request: Request):
    try:
        # Get host URL from request
        host_url = str(http_request.base_url).rstrip('/')
        
        # Initialize Stripe
        stripe_checkout = get_stripe_checkout(host_url)
        
        # Get checkout status from Stripe
        checkout_status = await stripe_checkout.get_checkout_status(session_id)
        
        # Find transaction in database
        transaction = await db.payment_transactions.find_one({"session_id": session_id})
        
        if transaction:
            # Update transaction status if payment is successful and not already processed
            if (checkout_status.payment_status == "paid" and 
                transaction.get("payment_status") != "paid"):
                
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {
                        "$set": {
                            "payment_status": checkout_status.payment_status,
                            "status": checkout_status.status,
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                logger.info(f"Updated donation transaction {session_id} to paid status")
        
        return checkout_status
        
    except Exception as e:
        logger.error(f"Error getting donation status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get payment status")

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        # Get host URL from request
        host_url = str(request.base_url).rstrip('/')
        
        # Initialize Stripe
        stripe_checkout = get_stripe_checkout(host_url)
        
        # Handle webhook
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Process webhook event
        if webhook_response.event_type == "checkout.session.completed":
            # Update transaction in database
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {
                    "$set": {
                        "payment_status": webhook_response.payment_status,
                        "status": "completed",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            logger.info(f"Webhook updated donation transaction {webhook_response.session_id}")
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Error processing stripe webhook: {e}")
        raise HTTPException(status_code=400, detail="Webhook processing failed")

# Live Streaming endpoints
@api_router.get("/streams", response_model=List[StreamEvent])
async def get_streams():
    """Get all streaming events (live and upcoming)"""
    try:
        # For now, return mock data. In production, fetch from database
        mock_streams = [
            {
                "id": str(uuid.uuid4()),
                "title": "Arctic Monkeys - Live from Studio",
                "description": "Exclusive live performance from the legendary indie rock band",
                "organizer_id": str(uuid.uuid4()),
                "start_time": datetime.now(timezone.utc) - timedelta(hours=1),
                "status": "live",
                "price": 19.99,
                "ticket_type": "pay_per_view",
                "thumbnail_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop",
                "quality": "HD",
                "features": ["Multi-camera", "Live Chat", "Backstage Access"],
                "created_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Foo Fighters - World Tour Finale",
                "description": "The epic finale of the world tour with special guests",
                "organizer_id": str(uuid.uuid4()),
                "start_time": datetime.now(timezone.utc) + timedelta(days=5),
                "status": "scheduled",
                "price": 24.99,
                "ticket_type": "vip_access",
                "thumbnail_url": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=250&fit=crop",
                "quality": "4K",
                "features": ["4K Stream", "Backstage Pass", "Meet & Greet", "Exclusive Merch"],
                "created_at": datetime.now(timezone.utc)
            }
        ]
        
        return [StreamEvent(**stream) for stream in mock_streams]
        
    except Exception as e:
        logger.error(f"Error getting streams: {e}")
        raise HTTPException(status_code=500, detail="Failed to get streams")

@api_router.post("/streams", response_model=StreamEvent)
async def create_stream_event(stream: StreamEventCreate, organizer_id: str):
    """Create a new streaming event (for organizers)"""
    try:
        stream_dict = stream.dict()
        stream_dict["organizer_id"] = organizer_id
        stream_obj = StreamEvent(**stream_dict)
        
        # In production, this would:
        # 1. Create Mux live input for RTMP ingest
        # 2. Generate stream key and RTMP URL
        # 3. Store in database
        
        prepared_dict = prepare_for_mongo(stream_obj.dict())
        result = await db.stream_events.insert_one(prepared_dict)
        
        logger.info(f"Created stream event: {stream_obj.id}")
        return stream_obj
        
    except Exception as e:
        logger.error(f"Error creating stream event: {e}")
        raise HTTPException(status_code=500, detail="Failed to create stream event")

@api_router.post("/streams/{stream_id}/purchase")
async def purchase_stream_access(stream_id: str, request: StreamPurchaseRequest):
    """Create Stripe checkout session for stream access"""
    try:
        # Find stream event
        stream = await db.stream_events.find_one({"id": stream_id})
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        
        # Get host URL
        origin_url = request.origin_url
        success_url = f"{origin_url}/stream/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{origin_url}/live-streaming"
        
        # Create Stripe checkout session
        stripe_session = await stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': stream['title'],
                        'description': f"Access to live stream: {stream['title']}"
                    },
                    'unit_amount': int(stream['price'] * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'type': 'stream_access',
                'stream_id': stream_id,
                'user_id': request.user_id
            }
        )
        
        # Create pending stream ticket
        ticket = StreamTicket(
            stream_event_id=stream_id,
            user_id=request.user_id,
            ticket_type=stream['ticket_type'],
            price=stream['price'],
            stripe_payment_intent_id=stripe_session.payment_intent
        )
        
        ticket_dict = prepare_for_mongo(ticket.dict())
        await db.stream_tickets.insert_one(ticket_dict)
        
        logger.info(f"Created stream purchase session: {stripe_session.id}")
        
        return {"url": stripe_session.url, "session_id": stripe_session.id}
        
    except Exception as e:
        logger.error(f"Error creating stream purchase: {e}")
        raise HTTPException(status_code=500, detail="Failed to create stream purchase")

@api_router.post("/streams/{stream_id}/playback-token")
async def create_playback_token(stream_id: str, request: PlaybackTokenRequest):
    """Generate playback token for authenticated stream access"""
    try:
        # Check if user has valid ticket for this stream
        ticket = await db.stream_tickets.find_one({
            "stream_event_id": stream_id,
            "user_id": request.user_id,
            "$or": [
                {"access_expires": {"$gte": datetime.now(timezone.utc)}},
                {"access_expires": None}
            ]
        })
        
        if not ticket:
            raise HTTPException(status_code=403, detail="No valid access ticket found")
        
        # Generate JWT playback token
        payload = {
            "sub": request.user_id,
            "stream_id": stream_id,
            "ticket_id": ticket["id"]
        }
        
        token = jwt.encode(payload, os.environ.get('PLAYBACK_JWT_SECRET', 'change-me'), 
                          algorithm='HS256')
        
        # Store playback token
        playback_token = PlaybackToken(
            stream_ticket_id=ticket["id"],
            token=token,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
        )
        
        token_dict = prepare_for_mongo(playback_token.dict())
        await db.playback_tokens.insert_one(token_dict)
        
        # In production, this would return signed CloudFront URLs or Mux playback URLs
        playback_url = f"https://stream.example.com/hls/{stream_id}/index.m3u8?token={token}"
        
        return {
            "token": token,
            "playback_url": playback_url,
            "expires_at": playback_token.expires_at,
            "expires_in": 600
        }
        
    except Exception as e:
        logger.error(f"Error creating playback token: {e}")
        raise HTTPException(status_code=500, detail="Failed to create playback token")

@api_router.post("/streams/{stream_id}/analytics")
async def log_stream_analytics(stream_id: str, event_type: str, payload: dict = {}):
    """Log streaming analytics events"""
    try:
        analytics = StreamAnalytics(
            stream_event_id=stream_id,
            user_id=payload.get('user_id'),
            event_type=event_type,
            payload=payload
        )
        
        analytics_dict = prepare_for_mongo(analytics.dict())
        await db.stream_analytics.insert_one(analytics_dict)
        
        # Update real-time metrics if needed
        if event_type == "viewer_joined":
            await db.stream_events.update_one(
                {"id": stream_id},
                {"$inc": {"current_viewers": 1, "total_viewers": 1}}
            )
        elif event_type == "viewer_left":
            await db.stream_events.update_one(
                {"id": stream_id},
                {"$inc": {"current_viewers": -1}}
            )
        
        return {"status": "logged"}
        
    except Exception as e:
        logger.error(f"Error logging analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to log analytics")

@api_router.get("/streams/{stream_id}/metrics")
async def get_stream_metrics(stream_id: str):
    """Get real-time stream metrics"""
    try:
        # Get current stream info
        stream = await db.stream_events.find_one({"id": stream_id})
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        
        # Get analytics summary
        total_viewers = await db.stream_analytics.count_documents({
            "stream_event_id": stream_id,
            "event_type": "viewer_joined"
        })
        
        current_viewers = stream.get("current_viewers", 0)
        
        # Get engagement metrics
        chat_messages = await db.stream_analytics.count_documents({
            "stream_event_id": stream_id,
            "event_type": "chat_message"
        })
        
        tips_sent = await db.stream_analytics.count_documents({
            "stream_event_id": stream_id,
            "event_type": "tip_sent"
        })
        
        return {
            "stream_id": stream_id,
            "current_viewers": current_viewers,
            "total_viewers": total_viewers,
            "chat_messages": chat_messages,
            "tips_sent": tips_sent,
            "status": stream.get("status", "scheduled")
        }
        
    except Exception as e:
        logger.error(f"Error getting stream metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get metrics")

# ======================= CRM API ENDPOINTS =======================

# CRM Dashboard Analytics
@api_router.get("/crm/dashboard/{promoter_id}", response_model=CRMDashboardData)
async def get_crm_dashboard(promoter_id: str):
    """Get comprehensive dashboard data for promoter CRM"""
    try:
        # Date range for current month
        now = datetime.now(timezone.utc)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Get promoter's events
        events = await db.crm_events.find({"promoter_id": promoter_id}).to_list(None)
        
        # Get promoter's transactions for MTD
        transactions = await db.crm_transactions.find({
            "promoter_id": promoter_id,
            "created_at": {"$gte": month_start},
            "status": "completed"
        }).to_list(None)
        
        # Calculate metrics
        total_revenue_mtd = sum(t.get("amount", 0) for t in transactions)
        tickets_sold = sum(e.get("tickets_sold", 0) for e in events)
        active_events = len([e for e in events if e.get("status") == "active"])
        
        # Stream revenue (last 24h)
        day_ago = now - timedelta(days=1)
        stream_transactions = await db.crm_transactions.find({
            "promoter_id": promoter_id,
            "type": {"$in": ["stream_view", "tip"]},
            "created_at": {"$gte": day_ago},
            "status": "completed"
        }).to_list(None)
        stream_revenue = sum(t.get("amount", 0) for t in stream_transactions)
        
        # Pending payouts
        pending_payouts = await db.crm_payouts.find({
            "promoter_id": promoter_id,
            "status": "pending"
        }).to_list(None)
        pending_amount = sum(p.get("amount", 0) for p in pending_payouts)
        
        # Growth calculations (mock for now - would compare to previous period)
        revenue_growth = 12.5
        audience_growth = 8.3
        conversion_rate = 3.2
        avg_ticket_price = total_revenue_mtd / max(tickets_sold, 1)
        
        # Top events by revenue
        top_events = sorted(events, key=lambda x: x.get("revenue", 0), reverse=True)[:3]
        top_events_data = [
            {
                "id": e.get("id"),
                "name": e.get("name"),
                "revenue": e.get("revenue", 0),
                "tickets_sold": e.get("tickets_sold", 0),
                "status": e.get("status")
            } for e in top_events
        ]
        
        # Revenue breakdown
        ticket_revenue = sum(t.get("amount", 0) for t in transactions if t.get("type") == "ticket_sale")
        merchandise_revenue = sum(t.get("amount", 0) for t in transactions if t.get("type") == "merchandise")
        
        return CRMDashboardData(
            total_revenue=total_revenue_mtd,
            total_revenue_mtd=total_revenue_mtd,
            tickets_sold=tickets_sold,
            active_events=active_events,
            stream_revenue=stream_revenue,
            pending_payouts=pending_amount,
            revenue_growth=revenue_growth,
            audience_growth=audience_growth,
            conversion_rate=conversion_rate,
            avg_ticket_price=avg_ticket_price,
            top_events=top_events_data,
            revenue_breakdown={
                "ticket_sales": ticket_revenue,
                "live_streams": stream_revenue,
                "merchandise": merchandise_revenue
            },
            period_start=month_start,
            period_end=now
        )
        
    except Exception as e:
        logger.error(f"Error getting CRM dashboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get dashboard data")

# CRM Events Management
@api_router.get("/crm/events/{promoter_id}")
async def get_crm_events(promoter_id: str, status: Optional[str] = None, limit: int = 50):
    """Get events for promoter CRM"""
    try:
        query = {"promoter_id": promoter_id}
        if status:
            query["status"] = status
            
        events = await db.crm_events.find(query).limit(limit).to_list(None)
        return [CRMEvent(**event) for event in events]
        
    except Exception as e:
        logger.error(f"Error getting CRM events: {e}")
        raise HTTPException(status_code=500, detail="Failed to get events")

@api_router.post("/crm/events")
async def create_crm_event(event: CRMEvent):
    """Create new event in CRM"""
    try:
        event_dict = prepare_for_mongo(event.dict())
        await db.crm_events.insert_one(event_dict)
        return {"status": "created", "id": event.id}
        
    except Exception as e:
        logger.error(f"Error creating CRM event: {e}")
        raise HTTPException(status_code=500, detail="Failed to create event")

@api_router.put("/crm/events/{event_id}")
async def update_crm_event(event_id: str, updates: dict):
    """Update event in CRM"""
    try:
        updates["updated_at"] = datetime.now(timezone.utc)
        updates = prepare_for_mongo(updates)
        
        result = await db.crm_events.update_one(
            {"id": event_id},
            {"$set": updates}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Event not found")
            
        return {"status": "updated"}
        
    except Exception as e:
        logger.error(f"Error updating CRM event: {e}")
        raise HTTPException(status_code=500, detail="Failed to update event")

# CRM Audience Management
@api_router.get("/crm/contacts/{promoter_id}")
async def get_crm_contacts(promoter_id: str, segment: Optional[str] = None, limit: int = 100):
    """Get contacts for promoter CRM"""
    try:
        query = {"promoter_id": promoter_id}
        if segment:
            query["segments"] = {"$in": [segment]}
            
        contacts = await db.crm_contacts.find(query).limit(limit).to_list(None)
        return [CRMContact(**contact) for contact in contacts]
        
    except Exception as e:
        logger.error(f"Error getting CRM contacts: {e}")
        raise HTTPException(status_code=500, detail="Failed to get contacts")

@api_router.post("/crm/contacts")
async def create_crm_contact(contact: CRMContact):
    """Create new contact in CRM"""
    try:
        contact_dict = prepare_for_mongo(contact.dict())
        await db.crm_contacts.insert_one(contact_dict)
        return {"status": "created", "id": contact.id}
        
    except Exception as e:
        logger.error(f"Error creating CRM contact: {e}")
        raise HTTPException(status_code=500, detail="Failed to create contact")

@api_router.get("/crm/audience-analytics/{promoter_id}")
async def get_audience_analytics(promoter_id: str):
    """Get audience analytics for promoter"""
    try:
        # Get contact counts by segment
        contacts = await db.crm_contacts.find({"promoter_id": promoter_id}).to_list(None)
        
        total_contacts = len(contacts)
        avg_engagement = sum(c.get("engagement_score", 0) for c in contacts) / max(total_contacts, 1)
        avg_customer_value = sum(c.get("total_spent", 0) for c in contacts) / max(total_contacts, 1)
        
        # Segment breakdown
        segments = {}
        for contact in contacts:
            for segment in contact.get("segments", []):
                segments[segment] = segments.get(segment, 0) + 1
        
        return {
            "total_contacts": total_contacts,
            "avg_engagement": round(avg_engagement, 1),
            "avg_customer_value": round(avg_customer_value, 2),
            "segment_breakdown": segments,
            "growth_rate": 15.2  # Mock growth rate
        }
        
    except Exception as e:
        logger.error(f"Error getting audience analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get audience analytics")

# CRM Marketing Campaigns
@api_router.get("/crm/campaigns/{promoter_id}")
async def get_crm_campaigns(promoter_id: str, status: Optional[str] = None):
    """Get marketing campaigns for promoter"""
    try:
        query = {"promoter_id": promoter_id}
        if status:
            query["status"] = status
            
        campaigns = await db.crm_campaigns.find(query).to_list(None)
        return [CRMCampaign(**campaign) for campaign in campaigns]
        
    except Exception as e:
        logger.error(f"Error getting CRM campaigns: {e}")
        raise HTTPException(status_code=500, detail="Failed to get campaigns")

@api_router.post("/crm/campaigns")
async def create_crm_campaign(campaign: CRMCampaign):
    """Create new marketing campaign"""
    try:
        campaign_dict = prepare_for_mongo(campaign.dict())
        await db.crm_campaigns.insert_one(campaign_dict)
        return {"status": "created", "id": campaign.id}
        
    except Exception as e:
        logger.error(f"Error creating CRM campaign: {e}")
        raise HTTPException(status_code=500, detail="Failed to create campaign")

@api_router.post("/crm/campaigns/{campaign_id}/launch")
async def launch_crm_campaign(campaign_id: str):
    """Launch marketing campaign"""
    try:
        # Update campaign status
        result = await db.crm_campaigns.update_one(
            {"id": campaign_id},
            {"$set": {"status": "active", "scheduled_at": datetime.now(timezone.utc)}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # In production, this would trigger email/SMS sending
        return {"status": "launched", "message": "Campaign launched successfully"}
        
    except Exception as e:
        logger.error(f"Error launching campaign: {e}")
        raise HTTPException(status_code=500, detail="Failed to launch campaign")

# CRM Payouts & Transactions
@api_router.get("/crm/payouts/{promoter_id}")
async def get_crm_payouts(promoter_id: str, status: Optional[str] = None):
    """Get payouts for promoter"""
    try:
        query = {"promoter_id": promoter_id}
        if status:
            query["status"] = status
            
        payouts = await db.crm_payouts.find(query).sort("created_at", -1).to_list(None)
        return [CRMPayout(**payout) for payout in payouts]
        
    except Exception as e:
        logger.error(f"Error getting CRM payouts: {e}")
        raise HTTPException(status_code=500, detail="Failed to get payouts")

@api_router.post("/crm/payouts/request")
async def request_payout(promoter_id: str, amount: float):
    """Request payout for promoter"""
    try:
        # Validate available balance
        # In production, calculate from transactions minus fees
        
        payout = CRMPayout(
            promoter_id=promoter_id,
            amount=amount,
            status="pending"
        )
        
        payout_dict = prepare_for_mongo(payout.dict())
        await db.crm_payouts.insert_one(payout_dict)
        
        return {"status": "requested", "id": payout.id, "estimated_processing": "2-3 business days"}
        
    except Exception as e:
        logger.error(f"Error requesting payout: {e}")
        raise HTTPException(status_code=500, detail="Failed to request payout")

@api_router.get("/crm/transactions/{promoter_id}")
async def get_crm_transactions(promoter_id: str, limit: int = 50, transaction_type: Optional[str] = None):
    """Get transaction history for promoter"""
    try:
        query = {"promoter_id": promoter_id}
        if transaction_type:
            query["type"] = transaction_type
            
        transactions = await db.crm_transactions.find(query).sort("created_at", -1).limit(limit).to_list(None)
        return [CRMTransaction(**transaction) for transaction in transactions]
        
    except Exception as e:
        logger.error(f"Error getting CRM transactions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get transactions")

# ======================= CRM AS A SERVICE API =======================
# Pay-as-you-go API for external platforms using TicketAI CRM

# API Usage tracking and billing
PAYG_PRICING = {
    "/api/crm/dashboard": 0.10,      # $0.10 per dashboard request
    "/api/crm/events": 0.05,         # $0.05 per events request  
    "/api/crm/contacts": 0.05,       # $0.05 per contacts request
    "/api/crm/campaigns": 0.15,      # $0.15 per campaign request
    "/api/crm/analytics": 0.20,      # $0.20 per analytics request
    "/api/crm/payouts": 0.25,        # $0.25 per payout request
    "default": 0.02                  # $0.02 for other endpoints
}

async def track_api_usage(client_id: str, client_name: str, endpoint: str):
    """Track API usage for billing"""
    try:
        cost = PAYG_PRICING.get(endpoint, PAYG_PRICING["default"])
        
        usage = CRMApiUsage(
            client_id=client_id,
            client_name=client_name,
            endpoint=endpoint,
            billing_amount=cost
        )
        
        usage_dict = prepare_for_mongo(usage.dict())
        await db.api_usage.insert_one(usage_dict)
        
        return cost
        
    except Exception as e:
        logger.error(f"Error tracking API usage: {e}")
        return 0

@api_router.get("/crm-api/pricing")
async def get_crm_api_pricing():
    """Get current CRM API pricing for external platforms"""
    return {
        "pricing_model": "pay_as_you_go",
        "currency": "usd",
        "endpoints": PAYG_PRICING,
        "billing_cycle": "monthly",
        "free_tier": {
            "requests_per_month": 1000,
            "description": "First 1000 requests free each month"
        },
        "enterprise_plans": {
            "starter": {"monthly_fee": 99, "included_requests": 10000, "overage_rate": 0.01},
            "professional": {"monthly_fee": 299, "included_requests": 50000, "overage_rate": 0.008},
            "enterprise": {"monthly_fee": 999, "included_requests": 200000, "overage_rate": 0.005}
        }
    }

@api_router.get("/crm-api/usage/{client_id}")
async def get_api_usage(client_id: str, period: str = "current_month"):
    """Get API usage stats for external client"""
    try:
        # Date range based on period
        now = datetime.now(timezone.utc)
        if period == "current_month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = now - timedelta(days=30)
        
        usage_records = await db.api_usage.find({
            "client_id": client_id,
            "created_at": {"$gte": start_date}
        }).to_list(None)
        
        total_requests = len(usage_records)
        total_cost = sum(record.get("billing_amount", 0) for record in usage_records)
        
        # Breakdown by endpoint
        endpoint_stats = {}
        for record in usage_records:
            endpoint = record.get("endpoint", "unknown")
            if endpoint not in endpoint_stats:
                endpoint_stats[endpoint] = {"requests": 0, "cost": 0}
            endpoint_stats[endpoint]["requests"] += 1
            endpoint_stats[endpoint]["cost"] += record.get("billing_amount", 0)
        
        return {
            "client_id": client_id,
            "period": period,
            "total_requests": total_requests,
            "total_cost": round(total_cost, 2),
            "endpoint_breakdown": endpoint_stats,
            "period_start": start_date,
            "period_end": now
        }
        
    except Exception as e:
        logger.error(f"Error getting API usage: {e}")
        raise HTTPException(status_code=500, detail="Failed to get usage stats")

@api_router.post("/crm-api/clients/register")
async def register_crm_api_client(client_name: str, contact_email: str, plan: str = "pay_as_you_go"):
    """Register new external platform for CRM API access"""
    try:
        client_id = str(uuid.uuid4())
        api_key = f"crm_{uuid.uuid4().hex}"
        
        client_data = {
            "id": client_id,
            "client_name": client_name,
            "contact_email": contact_email,
            "plan": plan,
            "api_key": api_key,
            "status": "active",
            "created_at": datetime.now(timezone.utc),
            "usage_limit": 1000 if plan == "pay_as_you_go" else None
        }
        
        await db.api_clients.insert_one(client_data)
        
        return {
            "client_id": client_id,
            "api_key": api_key,
            "plan": plan,
            "message": "Client registered successfully",
            "docs_url": "https://docs.ticketai.com/crm-api"
        }
        
    except Exception as e:
        logger.error(f"Error registering API client: {e}")
        raise HTTPException(status_code=500, detail="Failed to register client")

# Development/Testing endpoint to seed CRM data
@api_router.post("/crm/seed-data")
async def seed_crm_data():
    """Seed database with mock CRM data for testing"""
    try:
        # Clear existing test data
        await db.crm_events.delete_many({"promoter_id": "test-promoter-1"})
        await db.crm_contacts.delete_many({"promoter_id": "test-promoter-1"})
        await db.crm_campaigns.delete_many({"promoter_id": "test-promoter-1"})
        await db.crm_transactions.delete_many({"promoter_id": "test-promoter-1"})
        
        # Insert mock data
        events_prepared = [prepare_for_mongo(event) for event in MOCK_CRM_EVENTS]
        await db.crm_events.insert_many(events_prepared)
        
        contacts_prepared = [prepare_for_mongo(contact) for contact in MOCK_CRM_CONTACTS]
        await db.crm_contacts.insert_many(contacts_prepared)
        
        campaigns_prepared = [prepare_for_mongo(campaign) for campaign in MOCK_CRM_CAMPAIGNS]
        await db.crm_campaigns.insert_many(campaigns_prepared)
        
        transactions_prepared = [prepare_for_mongo(transaction) for transaction in MOCK_CRM_TRANSACTIONS]
        await db.crm_transactions.insert_many(transactions_prepared)
        
        return {
            "status": "success",
            "message": "CRM test data seeded successfully",
            "data": {
                "events": len(MOCK_CRM_EVENTS),
                "contacts": len(MOCK_CRM_CONTACTS), 
                "campaigns": len(MOCK_CRM_CAMPAIGNS),
                "transactions": len(MOCK_CRM_TRANSACTIONS)
            }
        }
        
    except Exception as e:
        logger.error(f"Error seeding CRM data: {e}")
        raise HTTPException(status_code=500, detail="Failed to seed test data")

# ======================= CONTACT & LEAD MANAGEMENT =======================

@api_router.post("/contact/promoter-inquiry")
async def submit_promoter_inquiry(inquiry: dict):
    """Handle promoter contact form submissions"""
    try:
        # Create contact inquiry record
        contact_inquiry = ContactInquiry(
            name=inquiry.get('name', ''),
            email=inquiry.get('email', ''),
            phone=inquiry.get('phone', ''),
            company=inquiry.get('company'),
            event_type=inquiry.get('eventType'),
            message=inquiry.get('message'),
            source=inquiry.get('source', 'website')
        )
        
        # Store in database
        inquiry_dict = prepare_for_mongo(contact_inquiry.dict())
        await db.contact_inquiries.insert_one(inquiry_dict)
        
        logger.info(f"New promoter inquiry received from {inquiry.get('email')} - {inquiry.get('name')}")
        
        # In production, you would:
        # 1. Send notification email to sales team
        # 2. Add to CRM system (Salesforce, HubSpot, etc.)
        # 3. Send auto-response email to inquirer
        # 4. Trigger marketing automation workflows
        
        return {
            "status": "success",
            "message": "Thank you for your inquiry! We'll be in touch within 24 hours.",
            "inquiry_id": contact_inquiry.id
        }
        
    except Exception as e:
        logger.error(f"Error processing promoter inquiry: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit inquiry")

@api_router.get("/contact/inquiries")
async def get_contact_inquiries(status: Optional[str] = None, limit: int = 50):
    """Get contact inquiries for admin/sales team"""
    try:
        query = {}
        if status:
            query["status"] = status
            
        inquiries = await db.contact_inquiries.find(query).sort("created_at", -1).limit(limit).to_list(None)
        
        # Clean up MongoDB ObjectId and other non-serializable fields
        cleaned_inquiries = []
        for inquiry in inquiries:
            # Remove MongoDB's _id field which contains ObjectId
            if '_id' in inquiry:
                del inquiry['_id']
            cleaned_inquiries.append(inquiry)
        
        return {
            "inquiries": cleaned_inquiries,
            "total": len(cleaned_inquiries)
        }
        
    except Exception as e:
        logger.error(f"Error getting contact inquiries: {e}")
        raise HTTPException(status_code=500, detail="Failed to get inquiries")

@api_router.put("/contact/inquiries/{inquiry_id}/status")
async def update_inquiry_status(inquiry_id: str, status: str, notes: Optional[str] = None):
    """Update inquiry status (for admin/sales team)"""
    try:
        update_data = {
            "status": status,
            "updated_at": datetime.now(timezone.utc)
        }
        
        if notes:
            update_data["notes"] = notes
            
        result = await db.contact_inquiries.update_one(
            {"id": inquiry_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Inquiry not found")
            
        return {"status": "updated"}
        
    except Exception as e:
        logger.error(f"Error updating inquiry status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update inquiry")

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
