from fastapi import FastAPI, APIRouter, HTTPException
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
import json
import asyncio


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
