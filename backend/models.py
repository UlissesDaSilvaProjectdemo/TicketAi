from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid

# Enhanced User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    password_hash: str
    phone: Optional[str] = None
    preferences: Dict[str, Any] = Field(default_factory=dict)
    social_connections: List[str] = Field(default_factory=list)  # Friend IDs
    wishlist: List[str] = Field(default_factory=list)  # Event IDs
    notification_settings: Dict[str, bool] = Field(default_factory=lambda: {
        "email_confirmations": True,
        "email_reminders": True,
        "sms_notifications": False,
        "push_notifications": True
    })
    # Credit System Fields
    credits: int = Field(default=100)  # Start with 100 free trial credits
    free_trial_used: bool = Field(default=False)
    total_credits_purchased: int = Field(default=0)
    total_searches_performed: int = Field(default=0)
    last_credit_purchase: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    phone: Optional[str]
    preferences: Dict[str, Any]
    wishlist: List[str]
    notification_settings: Dict[str, bool]
    # Credit System Fields
    credits: int
    free_trial_used: bool
    total_credits_purchased: int
    total_searches_performed: int
    last_credit_purchase: Optional[datetime]
    created_at: datetime

# Enhanced Event Models
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
    external_id: Optional[str] = None
    external_url: Optional[str] = None
    venue_info: Optional[Dict] = None
    price_ranges: Optional[List[Dict]] = None
    organizer_id: Optional[str] = None
    ratings: List[Dict] = Field(default_factory=list)  # {user_id, rating, comment}
    average_rating: float = 0.0
    is_featured: bool = False
    tags: List[str] = Field(default_factory=list)
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
    tags: List[str] = Field(default_factory=list)

class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    location: Optional[str] = None
    price: Optional[float] = None
    available_tickets: Optional[int] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None

# Enhanced Ticket Models
class Ticket(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    user_email: str
    user_name: str
    ticket_type: str = "Standard"
    qr_code: str
    status: str = "confirmed"  # confirmed, cancelled, transferred
    purchase_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    price: float
    source: str = "local"
    external_order_id: Optional[str] = None
    payment_intent_id: Optional[str] = None
    resale_price: Optional[float] = None
    is_for_resale: bool = False
    transfer_history: List[Dict] = Field(default_factory=list)
    refund_policy: Dict = Field(default_factory=dict)

class TicketCreate(BaseModel):
    event_id: str
    user_email: str
    user_name: str
    ticket_type: str = "Standard"

class TicketTransfer(BaseModel):
    ticket_id: str
    new_owner_email: str
    new_owner_name: str
    transfer_message: Optional[str] = None

# Payment Models
class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_email: Optional[str] = None
    event_id: str
    amount: float
    currency: str = "usd"
    status: str = "pending"  # pending, completed, failed, cancelled
    payment_method: str = "stripe"
    stripe_session_id: Optional[str] = None
    payment_intent_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

class CheckoutRequest(BaseModel):
    event_id: str
    ticket_quantity: int = 1
    ticket_type: str = "Standard"
    success_url: str
    cancel_url: str

# Review and Rating Models
class EventReview(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    user_id: str
    user_name: str
    rating: int = Field(..., ge=1, le=5)  # 1-5 stars
    comment: Optional[str] = None
    helpful_votes: int = 0
    verified_attendee: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    event_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

# Resale Market Models
class ResaleTicket(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ticket_id: str
    seller_email: str
    seller_name: str
    event_id: str
    original_price: float
    asking_price: float
    listing_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "active"  # active, sold, cancelled
    description: Optional[str] = None
    is_verified: bool = False

class ResaleListingCreate(BaseModel):
    ticket_id: str
    asking_price: float
    description: Optional[str] = None

# Social Features Models
class SocialConnection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    friend_id: str
    status: str = "pending"  # pending, accepted, blocked
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventShare(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    user_id: str
    platform: str  # facebook, twitter, email
    shared_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Notification Models
class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # booking_confirmation, event_reminder, price_alert, etc.
    title: str
    message: str
    is_read: bool = False
    data: Optional[Dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# AI and Search Models
class AISearchRequest(BaseModel):
    query: str
    location: Optional[str] = None
    date_range: Optional[str] = None
    category: Optional[str] = None
    price_range: Optional[Dict[str, float]] = None
    max_results: int = 10

class RecommendationRequest(BaseModel):
    user_preferences: str
    location: Optional[str] = None
    user_history: Optional[List[str]] = None  # Previous event IDs

# Admin Dashboard Models
class EventAnalytics(BaseModel):
    event_id: str
    total_views: int = 0
    total_bookings: int = 0
    revenue: float = 0.0
    conversion_rate: float = 0.0
    average_rating: float = 0.0
    peak_booking_times: List[datetime] = Field(default_factory=list)

class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    password_hash: str
    role: str = "organizer"  # organizer, admin, super_admin
    permissions: List[str] = Field(default_factory=list)
    managed_events: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Calendar Integration Models
class CalendarEvent(BaseModel):
    event_id: str
    user_id: str
    calendar_provider: str  # google, apple, outlook
    external_event_id: Optional[str] = None
    sync_status: str = "pending"  # pending, synced, failed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Email Template Models
class EmailTemplate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # booking_confirmation, event_reminder, etc.
    subject: str
    html_content: str
    variables: List[str] = Field(default_factory=list)  # Variables used in template
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Error Response Models
class ErrorResponse(BaseModel):
    error: bool = True
    message: str
    details: Optional[Dict] = None
    error_code: Optional[str] = None