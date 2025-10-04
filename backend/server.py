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
from ai_engine import (
    EmbeddingService, VectorSearchEngine, UserBehaviorTracker, 
    PersonalizedRecommendationEngine, SmartSearchEngine, SearchContext, UserBehavior
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security - Use pbkdf2_sha256 to avoid bcrypt issues
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"

# Initialize services
email_service = EmailService()
payment_service = PaymentService(db)
social_service = SocialService(db)
resale_service = ResaleService(db)
notification_service = NotificationService(db, email_service)

# Initialize AI services
embedding_service = EmbeddingService(os.environ.get('EMERGENT_LLM_KEY'))
vector_search_engine = VectorSearchEngine(embedding_service)
behavior_tracker = UserBehaviorTracker(db)
recommendation_engine = PersonalizedRecommendationEngine(vector_search_engine, behavior_tracker, db)
smart_search_engine = SmartSearchEngine(vector_search_engine, behavior_tracker, recommendation_engine, os.environ.get('EMERGENT_LLM_KEY'))

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
                system_message="You are an AI assistant that helps users find relevant events. Format your response with clear structure and proper HTML formatting for better readability."
            ).with_model("openai", "gpt-4o-mini")
            
            user_message = UserMessage(
                text=f"User search: '{request.query}'\nLocation: {request.location or 'Any'}\n"
                     f"Events:\n{events_text}\n\n"
                     f"Please analyze and rank the top {min(request.max_results, 5)} most relevant events. "
                     f"Format your response with clear HTML structure using:\n"
                     f"- <h3> for event names\n"
                     f"- <p> for separate paragraphs\n"
                     f"- <strong> for important details like prices and locations\n"
                     f"- <br> for line breaks\n"
                     f"- Organize each event recommendation in a clear, separate section\n"
                     f"Make it easy to read with proper spacing and emphasis on key details."
            )
            
            ai_response = await chat.send_message(user_message)
            
            # Format the AI response for better readability
            formatted_response = self._format_ai_response(ai_response)
            ranked_events = events[:request.max_results]
            
            return {
                "events": [event.dict() for event in ranked_events],
                "ai_analysis": formatted_response,
                "search_interpretation": f"Analyzed '{request.query}' and found {len(ranked_events)} relevant events",
                "total_found": len(ranked_events)
            }
            
        except Exception as e:
            logging.error(f"AI ranking error: {str(e)}")
            return await self._simple_search(request, events)
    
    def _format_ai_response(self, response: str) -> str:
        """Format AI response for better readability"""
        try:
            # If the response doesn't already contain HTML, add basic formatting
            if "<h3>" not in response and "<p>" not in response:
                # Split by numbered items (1., 2., etc.)
                import re
                parts = re.split(r'(\d+\.\s*)', response)
                
                formatted_parts = []
                for i, part in enumerate(parts):
                    if re.match(r'\d+\.\s*', part):
                        continue  # Skip the number part
                    elif i > 0 and part.strip():
                        # This is an event description
                        lines = part.strip().split('\n')
                        if lines:
                            # Extract event name (usually the first strong element)
                            event_text = lines[0].strip()
                            if '**' in event_text:
                                event_text = event_text.replace('**', '')
                                event_name = event_text.split(' - ')[0].strip()
                                formatted_parts.append(f"<h3 style='color: #1976d2; margin: 20px 0 10px 0;'>{event_name}</h3>")
                            
                            # Format the rest of the content
                            remaining = '\n'.join(lines[1:]) if len(lines) > 1 else lines[0]
                            
                            # Replace **text** with <strong>text</strong>
                            remaining = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', remaining)
                            
                            # Add paragraphs
                            paragraphs = remaining.split('\n\n')
                            for paragraph in paragraphs:
                                if paragraph.strip():
                                    formatted_parts.append(f"<p style='margin: 10px 0; line-height: 1.6;'>{paragraph.strip()}</p>")
                
                if formatted_parts:
                    return '<div style="font-family: Arial, sans-serif;">' + '\n'.join(formatted_parts) + '</div>'
            
            # If already formatted or formatting failed, clean up basic markdown
            response = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', response)
            response = response.replace('\n\n', '</p><p style="margin: 15px 0; line-height: 1.6;">')
            response = f'<div style="font-family: Arial, sans-serif;"><p style="margin: 15px 0; line-height: 1.6;">{response}</p></div>'
            
            return response
            
        except Exception as e:
            logging.error(f"Error formatting AI response: {str(e)}")
            # Fallback: just replace **text** with <strong>text</strong> and add line breaks
            response = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', response)
            return f'<div style="font-family: Arial, sans-serif; line-height: 1.6;">{response}</div>'
    
    async def _simple_search(self, request: AISearchRequest, events: List[Event]) -> Dict:
        query_lower = request.query.lower()
        scored_events = []
        
        for event in events:
            score = 0
            if query_lower in event.name.lower():
                score += 10
            if query_lower in event.description.lower():
                score += 5
            if request.category and request.category.lower() in event.category.lower():
                score += 8
            if request.location and request.location.lower() in event.location.lower():
                score += 6
            
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
    # Truncate password to 72 bytes to match hashing behavior
    if len(plain_password.encode('utf-8')) > 72:
        plain_password = plain_password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    # Truncate password to 72 bytes to avoid bcrypt limitation
    if len(password.encode('utf-8')) > 72:
        password = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
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

# Credit Management Routes
@api_router.get("/credits/balance")
async def get_credit_balance(current_user: User = Depends(get_current_user)):
    """Get user's current credit balance and usage stats"""
    user = await db.users.find_one({"id": current_user.id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "credits": user.get("credits", 0),
        "free_trial_used": user.get("free_trial_used", False),
        "total_credits_purchased": user.get("total_credits_purchased", 0),
        "total_searches_performed": user.get("total_searches_performed", 0),
        "last_credit_purchase": user.get("last_credit_purchase")
    }

@api_router.post("/credits/free-trial")
async def activate_free_trial(current_user: User = Depends(get_current_user)):
    """Activate free trial credits (100 credits)"""
    user = await db.users.find_one({"id": current_user.id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.get("free_trial_used", False):
        raise HTTPException(status_code=400, detail="Free trial already used")
    
    # Update user with free trial credits
    await db.users.update_one(
        {"id": current_user.id},
        {
            "$set": {
                "credits": 100,
                "free_trial_used": True
            }
        }
    )
    
    return {"message": "Free trial activated", "credits_added": 100, "total_credits": 100}

@api_router.get("/credits/packs")
async def get_credit_packs():
    """Get available credit packs"""
    # Define credit packs according to user requirements
    packs = [
        {
            "id": "starter",
            "name": "Starter Pack",
            "price": 9.99,
            "credits": 100,
            "searches": 100,
            "popular": True,
            "features": [
                "100 AI-powered searches",
                "Advanced event filtering",
                "Email support",
                "12-month credit validity",
                "API access"
            ]
        }
    ]
    
    return {"packs": packs}

@api_router.post("/credits/purchase")
async def purchase_credits(
    request: CreditPurchaseRequest,
    current_user: User = Depends(get_current_user),
    http_request: Request = None
):
    """Create checkout session for credit purchase"""
    try:
        # Get pack details
        packs = {
            "starter": {"price": 9.99, "credits": 100}
        }
        
        if request.pack_id not in packs:
            raise HTTPException(status_code=400, detail="Invalid pack ID")
        
        pack = packs[request.pack_id]
        
        # Create credit transaction record
        transaction = CreditTransaction(
            user_id=current_user.id,
            user_email=current_user.email,
            pack_id=request.pack_id,
            amount=pack["price"],
            credits=pack["credits"],
            payment_method=request.payment_method,
            status="pending",
            payment_status="pending"
        )
        
        # Save transaction
        await db.credit_transactions.insert_one(transaction.dict())
        
        # Initialize Stripe checkout
        from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
        
        stripe_checkout = StripeCheckout(
            api_key=os.environ.get('STRIPE_API_KEY'),
            webhook_url=f"{str(http_request.base_url)}/api/webhook/stripe"
        )
        
        # Create checkout session
        checkout_request = CheckoutSessionRequest(
            amount=pack["price"],
            currency="usd",
            success_url=request.success_url.replace("{CHECKOUT_SESSION_ID}", "{CHECKOUT_SESSION_ID}"),
            cancel_url=request.cancel_url,
            metadata={
                "transaction_id": transaction.id,
                "user_id": current_user.id,
                "user_email": current_user.email,
                "pack_id": request.pack_id,
                "credits": str(pack["credits"])
            }
        )
        
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Update transaction with session ID
        await db.credit_transactions.update_one(
            {"id": transaction.id},
            {"$set": {"stripe_session_id": session.session_id}}
        )
        
        return {"checkout_url": session.url, "session_id": session.session_id}
        
    except Exception as e:
        logging.error(f"Error creating credit purchase session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create payment session")

@api_router.get("/credits/status/{session_id}")
async def get_credit_purchase_status(session_id: str, current_user: User = Depends(get_current_user)):
    """Check credit purchase payment status"""
    try:
        # Find transaction by session ID
        transaction = await db.credit_transactions.find_one({"stripe_session_id": session_id})
        if not transaction or transaction["user_id"] != current_user.id:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # Get checkout status from Stripe
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        
        stripe_checkout = StripeCheckout(
            api_key=os.environ.get('STRIPE_API_KEY'),
            webhook_url=""  # Not needed for status check
        )
        
        status_response = await stripe_checkout.get_checkout_status(session_id)
        
        # Update transaction status
        await db.credit_transactions.update_one(
            {"id": transaction["id"]},
            {
                "$set": {
                    "status": status_response.status,
                    "payment_status": status_response.payment_status
                }
            }
        )
        
        # If payment successful and not already processed, add credits
        if status_response.payment_status == "paid" and transaction["status"] != "completed":
            # Add credits to user
            await db.users.update_one(
                {"id": current_user.id},
                {
                    "$inc": {
                        "credits": transaction["credits"],
                        "total_credits_purchased": transaction["credits"]
                    },
                    "$set": {
                        "last_credit_purchase": datetime.now(timezone.utc)
                    }
                }
            )
            
            # Mark transaction as completed
            await db.credit_transactions.update_one(
                {"id": transaction["id"]},
                {
                    "$set": {
                        "status": "completed",
                        "completed_at": datetime.now(timezone.utc)
                    }
                }
            )
            
            return {
                "status": "completed",
                "payment_status": "paid",
                "credits_added": transaction["credits"],
                "message": "Credits added successfully"
            }
        
        return {
            "status": status_response.status,
            "payment_status": status_response.payment_status
        }
        
    except Exception as e:
        logging.error(f"Error checking credit purchase status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to check payment status")

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        
        stripe_checkout = StripeCheckout(
            api_key=os.environ.get('STRIPE_API_KEY'),
            webhook_url=""
        )
        
        webhook_body = await request.body()
        stripe_signature = request.headers.get("Stripe-Signature")
        
        webhook_response = await stripe_checkout.handle_webhook(webhook_body, stripe_signature)
        
        if webhook_response.payment_status == "paid":
            # Find transaction by session ID
            transaction = await db.credit_transactions.find_one({"stripe_session_id": webhook_response.session_id})
            if transaction and transaction["status"] != "completed":
                # Add credits to user
                await db.users.update_one(
                    {"id": transaction["user_id"]},
                    {
                        "$inc": {
                            "credits": transaction["credits"],
                            "total_credits_purchased": transaction["credits"]
                        },
                        "$set": {
                            "last_credit_purchase": datetime.now(timezone.utc)
                        }
                    }
                )
                
                # Mark transaction as completed
                await db.credit_transactions.update_one(
                    {"id": transaction["id"]},
                    {
                        "$set": {
                            "status": "completed",
                            "payment_status": "paid",
                            "completed_at": datetime.now(timezone.utc)
                        }
                    }
                )
        
        return {"status": "processed"}
        
    except Exception as e:
        logging.error(f"Error processing Stripe webhook: {str(e)}")
        return {"status": "error"}

# Enhanced AI Search Routes
@api_router.post("/search/smart")
async def smart_search(
    request: AISearchRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Advanced semantic search with personalization and context understanding"""
    try:
        # Check credit balance for authenticated users
        if current_user:
            user = await db.users.find_one({"id": current_user.id})
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            user_credits = user.get("credits", 0)
            if user_credits <= 0:
                return {
                    'events': [],
                    'ai_analysis': "❌ **Insufficient Credits**\n\nYou have run out of search credits! 💳\n\n**Purchase Credits:**\n- Starter Pack: $9.99 for 100 searches\n- Visit our pricing page to get more credits and continue discovering amazing events! 🎉",
                    'search_interpretation': request.query,
                    'total_found': 0,
                    'intent_analysis': {},
                    'credits_remaining': 0,
                    'credit_warning': True
                }
        
        # Create search context
        search_context = SearchContext(
            query=request.query,
            location=request.location,
            date_range=request.date_range,
            category=request.category,
            price_range=None,
            user_id=current_user.id if current_user else None,
            session_id=str(uuid.uuid4())
        )
        
        # Track search behavior
        if current_user:
            behavior = UserBehavior(
                user_id=current_user.id,
                action_type='search',
                query=request.query,
                session_id=search_context.session_id,
                context={'location': request.location, 'category': request.category}
            )
            background_tasks.add_task(behavior_tracker.track_behavior, behavior)
        
        # Get all events for context
        local_events = await db.events.find().to_list(100)
        tm_events = await ticketmaster_client.search_events({"keyword": request.query, "size": 20})
        all_events = [Event(**event_data) for event_data in local_events] + tm_events
        
        # Perform smart search
        search_results = await smart_search_engine.smart_search(search_context, all_events)
        
        # Convert results to include full event data
        enriched_results = []
        for result in search_results['results']:
            if 'event' in result:
                enriched_results.append(result['event'].dict())
            else:
                # Find event in our data
                event_id = result['event_id']
                for event in all_events:
                    if event.id == event_id:
                        enriched_results.append(event.dict())
                        break
        
        # Deduct credit for authenticated users and log usage
        credits_remaining = None
        if current_user:
            # Deduct 1 credit
            result = await db.users.update_one(
                {"id": current_user.id},
                {
                    "$inc": {
                        "credits": -1,
                        "total_searches_performed": 1
                    }
                }
            )
            
            # Get updated credit count
            updated_user = await db.users.find_one({"id": current_user.id})
            credits_remaining = updated_user.get("credits", 0)
            
            # Log credit usage
            credit_log = CreditUsageLog(
                user_id=current_user.id,
                user_email=current_user.email,
                action="search",
                credits_deducted=1,
                remaining_credits=credits_remaining,
                query=request.query,
                session_id=search_context.session_id
            )
            
            await db.credit_usage_logs.insert_one(credit_log.dict())
        
        # Prepare response
        response = {
            'events': enriched_results,
            'ai_analysis': search_results['ai_explanation'],
            'search_interpretation': search_results['search_query'],
            'total_found': search_results['total_found'],
            'intent_analysis': search_results['intent']
        }
        
        # Add credit info for authenticated users
        if current_user:
            response['credits_remaining'] = credits_remaining
            if credits_remaining <= 5:  # Low credit warning
                response['credit_warning'] = True
                if credits_remaining > 0:
                    response['ai_analysis'] += f"\n\n⚠️ **Low Credits Warning:** You have {credits_remaining} searches remaining."
        
        return response
        
    except Exception as e:
        logging.error(f"Error in smart search: {str(e)}")
        return {
            'events': [],
            'ai_analysis': "Smart search temporarily unavailable. Please try again.",
            'search_interpretation': request.query,
            'total_found': 0,
            'intent_analysis': {}
        }

@api_router.post("/search/autocomplete")
async def search_autocomplete(
    query: str,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Intelligent search autocomplete with personalized suggestions"""
    try:
        suggestions = []
        
        # Get recent searches
        if current_user:
            recent_searches = await db.user_behaviors.find({
                'user_id': current_user.id,
                'action_type': 'search',
                'query': {'$regex': f'^{query}', '$options': 'i'}
            }).sort('timestamp', -1).limit(3).to_list(3)
            
            for search in recent_searches:
                suggestions.append({
                    'text': search['query'],
                    'type': 'recent_search',
                    'icon': 'clock'
                })
        
        # Get popular searches that match query
        popular_queries = [
            "music concerts this weekend",
            "tech conferences next month",
            "art exhibitions near me",
            "sports events tonight",
            "free events this week",
            "comedy shows downtown",
            "outdoor festivals summer"
        ]
        
        matching_popular = [q for q in popular_queries if query.lower() in q.lower()]
        for q in matching_popular[:3]:
            suggestions.append({
                'text': q,
                'type': 'popular_search',
                'icon': 'trending'
            })
        
        # Get event name suggestions
        events = await db.events.find({
            'name': {'$regex': query, '$options': 'i'}
        }).limit(3).to_list(3)
        
        for event in events:
            suggestions.append({
                'text': event['name'],
                'type': 'event_name',
                'icon': 'event',
                'event_id': event['id']
            })
        
        return {'suggestions': suggestions[:8]}
        
    except Exception as e:
        logging.error(f"Error in autocomplete: {str(e)}")
        return {'suggestions': []}

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
async def get_event(
    event_id: str, 
    current_user: Optional[User] = Depends(get_optional_current_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Track event view
    if current_user:
        behavior = UserBehavior(
            user_id=current_user.id,
            action_type='view',
            event_id=event_id,
            session_id=str(uuid.uuid4())
        )
        background_tasks.add_task(behavior_tracker.track_behavior, behavior)
    
    return Event(**event)

# Enhanced Recommendations Route
@api_router.post("/recommendations/personalized")
async def get_personalized_recommendations(
    request: RecommendationRequest, 
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Get AI-powered personalized recommendations"""
    try:
        if current_user:
            # Get personalized recommendations
            recommendations = await recommendation_engine.get_recommendations(
                current_user.id, 
                limit=10,
                context={'preferences': request.user_preferences, 'location': request.location}
            )
            
            # Get full event data for recommendations
            recommended_events = []
            for rec in recommendations:
                event = await db.events.find_one({"id": rec['event_id']})
                if event:
                    event_obj = Event(**event)
                    event_dict = event_obj.dict()
                    event_dict['recommendation_score'] = rec['score']
                    event_dict['recommendation_reason'] = rec['reason']
                    event_dict['recommendation_type'] = rec['type']
                    recommended_events.append(event_dict)
            
            return {
                'recommendations': recommended_events,
                'personalized': True,
                'user_id': current_user.id,
                'total_found': len(recommended_events)
            }
        else:
            # Fallback to general recommendations for anonymous users
            return await get_recommendations(request, current_user)
            
    except Exception as e:
        logging.error(f"Error getting personalized recommendations: {str(e)}")
        # Fallback to general recommendations
        return await get_recommendations(request, current_user)

@api_router.get("/recommendations/trending")
async def get_trending_recommendations(limit: int = 10):
    """Get trending events based on user interactions"""
    try:
        # Get trending events from the recommendation engine
        recommendations = await recommendation_engine._get_trending_recommendations(limit)
        
        # Get full event data
        trending_events = []
        for rec in recommendations:
            event = await db.events.find_one({"id": rec['event_id']})
            if event:
                event_obj = Event(**event)
                event_dict = event_obj.dict()
                event_dict['trend_score'] = rec['score']
                event_dict['trend_reason'] = rec['reason']
                trending_events.append(event_dict)
        
        return {
            'trending_events': trending_events,
            'total_found': len(trending_events),
            'period': '7 days'
        }
        
    except Exception as e:
        logging.error(f"Error getting trending recommendations: {str(e)}")
        return {'trending_events': [], 'total_found': 0, 'period': '7 days'}

# User Behavior Analytics
@api_router.get("/analytics/user-behavior")
async def get_user_behavior_analytics(current_user: User = Depends(get_current_user)):
    """Get user behavior analytics and insights"""
    try:
        preferences = await behavior_tracker.get_user_preferences(current_user.id)
        similar_users = await behavior_tracker.get_similar_users(current_user.id, 5)
        
        # Get recent behavior summary
        recent_behaviors = await db.user_behaviors.find({
            'user_id': current_user.id
        }).sort('timestamp', -1).limit(20).to_list(20)
        
        behavior_summary = {}
        for behavior in recent_behaviors:
            action_type = behavior['action_type']
            behavior_summary[action_type] = behavior_summary.get(action_type, 0) + 1
        
        return {
            'user_preferences': preferences,
            'similar_users_count': len(similar_users),
            'recent_behavior_summary': behavior_summary,
            'total_interactions': preferences.get('total_interactions', 0)
        }
        
    except Exception as e:
        logging.error(f"Error getting user behavior analytics: {str(e)}")
        return {
            'user_preferences': {},
            'similar_users_count': 0,
            'recent_behavior_summary': {},
            'total_interactions': 0
        }

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
        # Check credit balance for authenticated users
        if current_user:
            user = await db.users.find_one({"id": current_user.id})
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            user_credits = user.get("credits", 0)
            if user_credits <= 0:
                return {
                    "recommendations": [],
                    "ai_explanation": "❌ **Insufficient Credits**\n\nYou have run out of search credits! 💳\n\n**Purchase Credits:**\n- Starter Pack: $9.99 for 100 searches\n- Visit our pricing page to get more credits and continue discovering amazing events! 🎉",
                    "message": "Credits required for AI recommendations",
                    "total_events_considered": 0,
                    "credits_remaining": 0,
                    "credit_warning": True
                }
        
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
                 f"Based on the user's preferences and history, recommend the top 5 events with detailed explanations. "
                 f"Please format your response with clear HTML structure for better readability:\n"
                 f"- Use <h3> tags for event names with styling\n"
                 f"- Use <p> tags for separate paragraphs\n"
                 f"- Use <strong> for important details like prices, locations, and dates\n"
                 f"- Create clear sections for each recommendation\n"
                 f"- Make it easy to read with proper spacing and emphasis on key information"
        )
        
        response = await chat.send_message(user_message)
        recommended_events = all_events[:5]
        
        # Deduct credit for authenticated users and log usage
        credits_remaining = None
        if current_user:
            # Deduct 1 credit
            await db.users.update_one(
                {"id": current_user.id},
                {
                    "$inc": {
                        "credits": -1,
                        "total_searches_performed": 1
                    }
                }
            )
            
            # Get updated credit count
            updated_user = await db.users.find_one({"id": current_user.id})
            credits_remaining = updated_user.get("credits", 0)
            
            # Log credit usage
            credit_log = CreditUsageLog(
                user_id=current_user.id,
                user_email=current_user.email,
                action="recommendation",
                credits_deducted=1,
                remaining_credits=credits_remaining,
                query=request.user_preferences,
                session_id=str(uuid.uuid4())
            )
            
            await db.credit_usage_logs.insert_one(credit_log.dict())
        
        # Prepare response
        response_data = {
            "recommendations": [event.dict() for event in recommended_events],
            "ai_explanation": response,
            "message": "AI-powered personalized recommendations",
            "total_events_considered": len(all_events)
        }
        
        # Add credit info for authenticated users
        if current_user:
            response_data["credits_remaining"] = credits_remaining
            if credits_remaining <= 5:  # Low credit warning
                response_data["credit_warning"] = True
                if credits_remaining > 0:
                    response_data["ai_explanation"] += f"\n\n⚠️ **Low Credits Warning:** You have {credits_remaining} searches remaining."
        
        return response_data
        
    except Exception as e:
        logging.error(f"Error in recommendations: {str(e)}")
        events = await db.events.find().sort("average_rating", -1).to_list(3)
        return {
            "recommendations": [Event(**event).dict() for event in events],
            "message": "Showing highly-rated events"
        }

# Background Tasks and Startup
@app.on_event("startup")
async def startup_event():
    """Initialize the application and AI components"""
    # Create sample events including UK festivals
    existing_events = await db.events.find().to_list(1)
    if not existing_events:
        uk_festivals_2025 = [
            # Music Festivals October 2025
            EventCreate(
                name="Country Club Festival",
                description="A celebration of country music featuring performances from top country artists and emerging talent. Experience the best of country music in Birmingham.",
                date=datetime(2025, 10, 4, 19, 0, 0),
                location="Birmingham, UK",
                price=89.99,
                total_tickets=5000,
                category="Music",
                image_url="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
                tags=["country", "music", "festival", "uk", "birmingham"]
            ),
            EventCreate(
                name="K-Music Festival",
                description="A festival showcasing contemporary Korean music and culture across various London venues. Discover the vibrant world of K-pop, indie Korean music, and cultural performances.",
                date=datetime(2025, 10, 15, 18, 0, 0),
                location="Various venues, London, UK",
                price=65.00,
                total_tickets=3000,
                category="Music",
                image_url="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
                tags=["korean", "k-pop", "culture", "london", "contemporary"]
            ),
            EventCreate(
                name="Swanage Blues Festival",
                description="A long-standing blues festival in the beautiful seaside town of Swanage, featuring a stellar lineup of renowned blues artists from the UK and beyond.",
                date=datetime(2025, 10, 3, 19, 30, 0),
                location="Swanage, Dorset, UK",
                price=125.00,
                total_tickets=2500,
                category="Music",
                image_url="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
                tags=["blues", "festival", "dorset", "seaside", "traditional"]
            ),
            EventCreate(
                name="Twisterella Festival",
                description="A dynamic one-day festival featuring emerging indie and alternative bands. Discover the next generation of British music talent in Middlesbrough.",
                date=datetime(2025, 10, 11, 14, 0, 0),
                location="Middlesbrough, UK",
                price=45.00,
                total_tickets=1500,
                category="Music",
                image_url="https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800",
                tags=["indie", "alternative", "emerging", "bands", "middlesbrough"]
            ),
            EventCreate(
                name="Keep It Country Festival (North)",
                description="A celebration of country music featuring top artists like Morgan Wallen and Chapel Hart. Experience authentic country music in Newcastle's premier venue.",
                date=datetime(2025, 10, 26, 19, 0, 0),
                location="O2 City Hall, Newcastle Upon Tyne, UK",
                price=95.00,
                total_tickets=2000,
                category="Music",
                image_url="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
                tags=["country", "morgan wallen", "chapel hart", "newcastle", "o2"]
            ),
            EventCreate(
                name="London Piano Festival",
                description="A prestigious festival celebrating the piano with performances from world-renowned pianists. Experience classical excellence in the heart of London.",
                date=datetime(2025, 10, 10, 19, 30, 0),
                location="London, UK",
                price=75.00,
                total_tickets=800,
                category="Music",
                image_url="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800",
                tags=["piano", "classical", "london", "prestigious", "concert"]
            ),
            # Music Festivals November 2025
            EventCreate(
                name="London Festival of Baroque Music",
                description="A week-long celebration of Baroque music featuring performances by Arcangelo and Iestyn Davies at the beautiful Smith Square Hall.",
                date=datetime(2025, 11, 4, 19, 30, 0),
                location="Smith Square Hall, London, UK",
                price=55.00,
                total_tickets=600,
                category="Music",
                image_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
                tags=["baroque", "classical", "arcangelo", "iestyn davies", "historical"]
            ),
            EventCreate(
                name="Wimbledon International Music Festival",
                description="A comprehensive festival offering concerts, talks, and workshops across various genres. Three weeks of musical excellence in Wimbledon.",
                date=datetime(2025, 11, 8, 19, 0, 0),
                location="Wimbledon, London, UK",
                price=40.00,
                total_tickets=1200,
                category="Music",
                image_url="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
                tags=["international", "workshops", "talks", "wimbledon", "diverse"]
            ),
            # Art Festivals October 2025
            EventCreate(
                name="BFI London Film Festival",
                description="Celebrates world cinema with premieres, filmmaker Q&As, and screenings across London. The UK's premier film festival showcasing international talent.",
                date=datetime(2025, 10, 10, 18, 0, 0),
                location="Various venues, London, UK",
                price=25.00,
                total_tickets=50000,
                category="Arts",
                image_url="https://images.unsplash.com/photo-1489599019892-ee891ac64c07?w=800",
                tags=["film", "cinema", "premieres", "international", "screenings"]
            ),
            EventCreate(
                name="The Other Art Fair London",
                description="A vibrant fair showcasing over 175 independent artists with immersive installations and performances. Discover emerging talent in contemporary art.",
                date=datetime(2025, 10, 10, 10, 0, 0),
                location="London, UK",
                price=15.00,
                total_tickets=8000,
                category="Arts",
                image_url="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
                tags=["contemporary", "independent", "installations", "emerging", "galleries"]
            ),
            EventCreate(
                name="Frieze London & Frieze Masters",
                description="Leading contemporary art fairs featuring works from renowned international artists and prestigious galleries. The pinnacle of the art world calendar.",
                date=datetime(2025, 10, 16, 11, 0, 0),
                location="London, UK",
                price=35.00,
                total_tickets=12000,
                category="Arts",
                image_url="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
                tags=["contemporary", "prestigious", "galleries", "international", "masters"]
            ),
            EventCreate(
                name="Cheltenham Literature Festival",
                description="Features renowned authors, poets, and emerging voices with ticketed events and free family activities. A celebration of literature and storytelling.",
                date=datetime(2025, 10, 12, 14, 0, 0),
                location="Cheltenham, South West, UK",
                price=20.00,
                total_tickets=5000,
                category="Arts",
                image_url="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
                tags=["literature", "authors", "poets", "family", "storytelling"]
            ),
            EventCreate(
                name="1-54 Contemporary African Art Fair",
                description="A fair dedicated to contemporary African art, featuring leading and emerging artists from across the African continent and diaspora.",
                date=datetime(2025, 10, 17, 10, 0, 0),
                location="London, UK",
                price=18.00,
                total_tickets=3000,
                category="Arts",
                image_url="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
                tags=["african", "contemporary", "diaspora", "cultural", "emerging"]
            ),
            EventCreate(
                name="Brighton Early Music Festival - LOVE",
                description="A festival celebrating early music with the romantic theme of 'LOVE'. Experience historical music performed with authentic period instruments.",
                date=datetime(2025, 10, 18, 19, 0, 0),
                location="Brighton, UK",
                price=30.00,
                total_tickets=1000,
                category="Arts",
                image_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
                tags=["early music", "historical", "period instruments", "brighton", "romantic"]
            ),
            EventCreate(
                name="Canterbury Festival",
                description="A two-week celebration of the arts featuring classical concerts, theatre performances, and cultural events in the historic city of Canterbury.",
                date=datetime(2025, 10, 24, 19, 30, 0),
                location="Canterbury, UK",
                price=28.00,
                total_tickets=2000,
                category="Arts",
                image_url="https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800",
                tags=["classical", "theatre", "historic", "cultural", "canterbury"]
            ),
            EventCreate(
                name="Lumiere Festival Durham",
                description="The UK's leading light art festival featuring spectacular glowing installations and illuminated trails throughout the historic city of Durham.",
                date=datetime(2025, 11, 14, 18, 0, 0),
                location="Durham, UK",
                price=12.00,
                total_tickets=15000,
                category="Arts",
                image_url="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
                tags=["light art", "installations", "illuminated", "durham", "spectacular"]
            ),
            # 2026 Highlights
            EventCreate(
                name="Isle of Wight Festival 2026",
                description="A legendary festival featuring Lewis Capaldi (Friday), Calvin Harris (Saturday), and The Cure (Sunday). A diverse mix of pop, rock, indie, and electronic music.",
                date=datetime(2026, 6, 19, 17, 0, 0),
                location="Seaclose Park, Isle of Wight, UK",
                price=299.99,
                total_tickets=90000,
                category="Music",
                image_url="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
                tags=["lewis capaldi", "calvin harris", "the cure", "legendary", "diverse"]
            ),
            EventCreate(
                name="Edinburgh Summer Sessions 2026",
                description="An intimate concert featuring The Cure with supporting acts Mogwai, Slowdive, and Just Mustard at the scenic Royal Highland Showgrounds.",
                date=datetime(2026, 8, 23, 18, 0, 0),
                location="Royal Highland Showgrounds, Edinburgh, UK",
                price=149.99,
                total_tickets=25000,
                category="Music",
                image_url="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
                tags=["the cure", "mogwai", "slowdive", "just mustard", "edinburgh"]
            ),
            # Original US Events
            EventCreate(
                name="Tech Conference 2025",
                description="Annual technology conference featuring the latest innovations in AI, blockchain, and software development. Network with industry leaders and discover cutting-edge solutions.",
                date=datetime(2025, 3, 15, 9, 0, 0),
                location="San Francisco, CA, USA",
                price=299.99,
                total_tickets=500,
                category="Technology",
                image_url="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
                tags=["ai", "blockchain", "networking", "innovation", "silicon valley"]
            ),
            EventCreate(
                name="Summer Music Festival",
                description="Three-day outdoor music festival featuring emerging artists and established performers. Enjoy live music, food trucks, and an unforgettable atmosphere under the Texas stars.",
                date=datetime(2025, 7, 20, 18, 0, 0),
                location="Austin, TX, USA",
                price=199.99,
                total_tickets=2000,
                category="Music",
                image_url="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
                tags=["music", "outdoor", "festival", "live", "texas"]
            )
        ]
        
        for event_data in uk_festivals_2025:
            event = Event(
                **event_data.dict(),
                available_tickets=event_data.total_tickets,
                source="local",
                is_featured=True,
                average_rating=4.0 + (len(event_data.tags) * 0.1)  # Vary ratings based on tags
            )
            
            # Save to database
            await db.events.insert_one(event.dict())
            
            # Index in vector search engine
            await vector_search_engine.index_event(event)
        
        logging.info(f"Created and indexed {len(uk_festivals_2025)} UK festivals and events")
    else:
        # Index existing events
        existing_events = await db.events.find().to_list(100)
        for event_data in existing_events:
            event = Event(**event_data)
            await vector_search_engine.index_event(event)
        
        logging.info(f"Indexed {len(existing_events)} existing events")
    
    # Index TicketMaster events
    tm_events = await ticketmaster_client.search_events({"size": 10})
    for tm_event in tm_events:
        await vector_search_engine.index_event(tm_event)
    
    logging.info(f"Indexed {len(tm_events)} TicketMaster events")
    logging.info("AI-powered search and personalization system initialized successfully")

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