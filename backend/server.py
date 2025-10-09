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

class PlaybackTokenRequest(BaseModel):
    stream_event_id: str
    user_id: str

class StreamPurchaseRequest(BaseModel):
    stream_event_id: str
    user_id: str
    origin_url: str

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
        
        token = jwt.sign(payload, os.environ.get('PLAYBACK_JWT_SECRET', 'change-me'), 
                        algorithm='HS256', expires=timedelta(minutes=10))
        
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
