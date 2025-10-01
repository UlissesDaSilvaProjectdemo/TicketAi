"""
Advanced AI Search and Personalization Engine for TicketAI
Implements semantic search, personalized recommendations, and user behavior tracking
"""

import os
import logging
import uuid
import asyncio
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timezone, timedelta
import numpy as np
import json
from dataclasses import dataclass, asdict

from emergentintegrations.llm.chat import LlmChat, UserMessage
from motor.motor_asyncio import AsyncIOMotorClient
from models import Event, User, AISearchRequest, RecommendationRequest
import hashlib
import re

# Configuration
EMBEDDING_CACHE_TTL = 86400  # 24 hours
MAX_EMBEDDING_BATCH_SIZE = 50
SIMILARITY_THRESHOLD = 0.7
MAX_RECOMMENDATIONS = 10

@dataclass
class UserBehavior:
    user_id: str
    action_type: str  # 'search', 'view', 'click', 'purchase', 'like', 'share'
    event_id: Optional[str] = None
    query: Optional[str] = None
    timestamp: datetime = None
    session_id: Optional[str] = None
    context: Optional[Dict] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now(timezone.utc)

@dataclass
class EventEmbedding:
    event_id: str
    embedding: List[float]
    text_content: str
    created_at: datetime
    metadata: Optional[Dict] = None

@dataclass
class SearchContext:
    query: str
    location: Optional[str] = None
    date_range: Optional[str] = None
    category: Optional[str] = None
    price_range: Optional[Tuple[float, float]] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None

class EmbeddingService:
    """Service for generating and managing OpenAI embeddings"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.model = "text-embedding-3-small"
        self.cache = {}
        
    def _generate_cache_key(self, text: str) -> str:
        """Generate cache key for embedding"""
        return hashlib.md5(text.encode()).hexdigest()
    
    async def get_embedding(self, text: str) -> List[float]:
        """Get embedding for single text with caching"""
        cache_key = self._generate_cache_key(text)
        
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        try:
            # Use Emergent LLM for embeddings (simplified approach)
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"embedding-{uuid.uuid4()}",
                system_message="Generate embedding representation"
            ).with_model("openai", "gpt-4o-mini")
            
            # For demonstration, we'll simulate embeddings
            # In production, you'd use the actual OpenAI embeddings API
            embedding = self._simulate_embedding(text)
            
            self.cache[cache_key] = embedding
            return embedding
            
        except Exception as e:
            logging.error(f"Error generating embedding: {str(e)}")
            # Fallback: generate a simple hash-based embedding
            return self._fallback_embedding(text)
    
    def _simulate_embedding(self, text: str) -> List[float]:
        """Simulate embedding generation for demo purposes"""
        # Create a deterministic "embedding" based on text content
        # This is for demo - in production, use actual OpenAI embeddings API
        words = text.lower().split()
        
        # Create a 384-dimensional vector (common embedding size)
        embedding = [0.0] * 384
        
        # Simple word-based feature extraction
        for i, word in enumerate(words[:20]):  # Use first 20 words
            word_hash = hash(word) % 384
            embedding[word_hash] += 1.0
        
        # Add semantic features based on keywords
        semantic_keywords = {
            'music': [0, 50, 100, 150],
            'concert': [1, 51, 101, 151],
            'festival': [2, 52, 102, 152],
            'technology': [10, 60, 110, 160],
            'conference': [11, 61, 111, 161],
            'art': [20, 70, 120, 170],
            'sports': [30, 80, 130, 180],
            'outdoor': [40, 90, 140, 190],
            'indoor': [41, 91, 141, 191],
        }
        
        for keyword, indices in semantic_keywords.items():
            if keyword in text.lower():
                for idx in indices:
                    embedding[idx] += 2.0
        
        # Normalize the embedding
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = [x / norm for x in embedding]
        
        return embedding
    
    def _fallback_embedding(self, text: str) -> List[float]:
        """Fallback embedding generation"""
        # Simple hash-based embedding as fallback
        text_hash = hash(text.lower())
        np.random.seed(abs(text_hash) % (2**32))
        return np.random.normal(0, 1, 384).tolist()
    
    async def get_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Get embeddings for multiple texts"""
        embeddings = []
        for text in texts:
            embedding = await self.get_embedding(text)
            embeddings.append(embedding)
        return embeddings

class VectorSearchEngine:
    """Vector-based semantic search engine"""
    
    def __init__(self, embedding_service: EmbeddingService):
        self.embedding_service = embedding_service
        self.event_embeddings: Dict[str, EventEmbedding] = {}
        
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        try:
            dot_product = np.dot(vec1, vec2)
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
                
            return dot_product / (norm1 * norm2)
        except Exception as e:
            logging.error(f"Error calculating cosine similarity: {str(e)}")
            return 0.0
    
    async def index_event(self, event: Event) -> bool:
        """Index an event by generating and storing its embedding"""
        try:
            # Create text content for embedding
            content_parts = [
                event.name,
                event.description,
                event.category,
                event.location,
                ' '.join(event.tags) if hasattr(event, 'tags') and event.tags else ''
            ]
            text_content = ' '.join(filter(None, content_parts))
            
            # Generate embedding
            embedding = await self.embedding_service.get_embedding(text_content)
            
            # Store embedding
            event_embedding = EventEmbedding(
                event_id=event.id,
                embedding=embedding,
                text_content=text_content,
                created_at=datetime.now(timezone.utc),
                metadata={
                    'category': event.category,
                    'price': event.price,
                    'location': event.location,
                    'rating': getattr(event, 'average_rating', 0.0)
                }
            )
            
            self.event_embeddings[event.id] = event_embedding
            return True
            
        except Exception as e:
            logging.error(f"Error indexing event {event.id}: {str(e)}")
            return False
    
    async def search(self, query: str, limit: int = 10, min_similarity: float = 0.3) -> List[Dict]:
        """Perform semantic search"""
        try:
            # Generate query embedding
            query_embedding = await self.embedding_service.get_embedding(query)
            
            # Calculate similarities
            similarities = []
            for event_id, event_emb in self.event_embeddings.items():
                similarity = self._cosine_similarity(query_embedding, event_emb.embedding)
                if similarity >= min_similarity:
                    similarities.append({
                        'event_id': event_id,
                        'similarity_score': similarity,
                        'metadata': event_emb.metadata
                    })
            
            # Sort by similarity and return top results
            similarities.sort(key=lambda x: x['similarity_score'], reverse=True)
            return similarities[:limit]
            
        except Exception as e:
            logging.error(f"Error performing semantic search: {str(e)}")
            return []

class UserBehaviorTracker:
    """Track and analyze user behavior for personalization"""
    
    def __init__(self, db: AsyncIOMotorClient):
        self.db = db
        
    async def track_behavior(self, behavior: UserBehavior) -> bool:
        """Track user behavior event"""
        try:
            behavior_doc = asdict(behavior)
            behavior_doc['timestamp'] = behavior.timestamp
            
            await self.db.user_behaviors.insert_one(behavior_doc)
            return True
            
        except Exception as e:
            logging.error(f"Error tracking behavior: {str(e)}")
            return False
    
    async def get_user_preferences(self, user_id: str, days: int = 30) -> Dict[str, float]:
        """Extract user preferences from behavior"""
        try:
            # Get recent behaviors
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
            
            behaviors = await self.db.user_behaviors.find({
                'user_id': user_id,
                'timestamp': {'$gte': cutoff_date}
            }).to_list(1000)
            
            # Analyze preferences
            category_weights = {}
            location_weights = {}
            price_preferences = []
            
            for behavior in behaviors:
                if behavior.get('event_id'):
                    # Get event details to extract preferences
                    event = await self.db.events.find_one({'id': behavior['event_id']})
                    if event:
                        # Weight different actions differently
                        action_weight = {
                            'view': 1.0,
                            'click': 2.0,
                            'search': 1.5,
                            'purchase': 5.0,
                            'like': 3.0,
                            'share': 2.5
                        }.get(behavior['action_type'], 1.0)
                        
                        # Category preferences
                        category = event.get('category', 'General')
                        category_weights[category] = category_weights.get(category, 0) + action_weight
                        
                        # Location preferences
                        location = event.get('location', '')
                        if location:
                            location_weights[location] = location_weights.get(location, 0) + action_weight
                        
                        # Price preferences
                        price = event.get('price', 0)
                        if price > 0:
                            price_preferences.append(price)
            
            # Calculate average price preference
            avg_price = np.mean(price_preferences) if price_preferences else 100.0
            
            return {
                'categories': category_weights,
                'locations': location_weights,
                'average_price_preference': avg_price,
                'total_interactions': len(behaviors)
            }
            
        except Exception as e:
            logging.error(f"Error getting user preferences: {str(e)}")
            return {}
    
    async def get_similar_users(self, user_id: str, limit: int = 10) -> List[str]:
        """Find users with similar behavior patterns"""
        try:
            user_prefs = await self.get_user_preferences(user_id)
            if not user_prefs.get('categories'):
                return []
            
            # Get all users
            all_users = await self.db.users.find({}, {'id': 1}).to_list(1000)
            
            similar_users = []
            for user in all_users:
                if user['id'] == user_id:
                    continue
                    
                other_prefs = await self.get_user_preferences(user['id'])
                similarity = self._calculate_user_similarity(user_prefs, other_prefs)
                
                if similarity > 0.3:  # Minimum similarity threshold
                    similar_users.append((user['id'], similarity))
            
            # Sort by similarity and return top users
            similar_users.sort(key=lambda x: x[1], reverse=True)
            return [user_id for user_id, _ in similar_users[:limit]]
            
        except Exception as e:
            logging.error(f"Error finding similar users: {str(e)}")
            return []
    
    def _calculate_user_similarity(self, prefs1: Dict, prefs2: Dict) -> float:
        """Calculate similarity between two user preference profiles"""
        try:
            categories1 = prefs1.get('categories', {})
            categories2 = prefs2.get('categories', {})
            
            if not categories1 or not categories2:
                return 0.0
            
            # Get common categories
            common_categories = set(categories1.keys()) & set(categories2.keys())
            if not common_categories:
                return 0.0
            
            # Calculate cosine similarity for categories
            vec1 = [categories1.get(cat, 0) for cat in common_categories]
            vec2 = [categories2.get(cat, 0) for cat in common_categories]
            
            return self._cosine_similarity(vec1, vec2)
            
        except Exception as e:
            logging.error(f"Error calculating user similarity: {str(e)}")
            return 0.0
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity"""
        try:
            dot_product = np.dot(vec1, vec2)
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
                
            return dot_product / (norm1 * norm2)
        except:
            return 0.0

class PersonalizedRecommendationEngine:
    """Generate personalized event recommendations"""
    
    def __init__(self, vector_search: VectorSearchEngine, behavior_tracker: UserBehaviorTracker, db: AsyncIOMotorClient):
        self.vector_search = vector_search
        self.behavior_tracker = behavior_tracker
        self.db = db
        
    async def get_recommendations(self, user_id: str, limit: int = 10, context: Optional[Dict] = None) -> List[Dict]:
        """Generate personalized recommendations for a user"""
        try:
            recommendations = []
            
            # Get user preferences
            user_prefs = await self.behavior_tracker.get_user_preferences(user_id)
            
            # Content-based recommendations
            content_recs = await self._get_content_based_recommendations(user_id, user_prefs, limit // 2)
            recommendations.extend(content_recs)
            
            # Collaborative filtering recommendations
            collab_recs = await self._get_collaborative_recommendations(user_id, limit // 2)
            recommendations.extend(collab_recs)
            
            # Trending events
            trending_recs = await self._get_trending_recommendations(limit // 4)
            recommendations.extend(trending_recs)
            
            # Remove duplicates and sort by score
            unique_recs = {}
            for rec in recommendations:
                event_id = rec['event_id']
                if event_id not in unique_recs or rec['score'] > unique_recs[event_id]['score']:
                    unique_recs[event_id] = rec
            
            # Sort by score and return top results
            final_recs = list(unique_recs.values())
            final_recs.sort(key=lambda x: x['score'], reverse=True)
            
            return final_recs[:limit]
            
        except Exception as e:
            logging.error(f"Error generating recommendations for user {user_id}: {str(e)}")
            return []
    
    async def _get_content_based_recommendations(self, user_id: str, user_prefs: Dict, limit: int) -> List[Dict]:
        """Get content-based recommendations"""
        try:
            recommendations = []
            
            # Get user's favorite categories
            categories = user_prefs.get('categories', {})
            if not categories:
                return []
            
            # Find events in preferred categories
            preferred_categories = sorted(categories.keys(), key=categories.get, reverse=True)[:3]
            
            for category in preferred_categories:
                events = await self.db.events.find({
                    'category': category,
                    'date': {'$gte': datetime.now(timezone.utc)}
                }).to_list(20)
                
                for event in events:
                    # Calculate score based on user preferences
                    score = self._calculate_content_score(event, user_prefs)
                    
                    recommendations.append({
                        'event_id': event['id'],
                        'score': score,
                        'reason': f"Popular in {category}",
                        'type': 'content_based'
                    })
            
            return sorted(recommendations, key=lambda x: x['score'], reverse=True)[:limit]
            
        except Exception as e:
            logging.error(f"Error getting content-based recommendations: {str(e)}")
            return []
    
    async def _get_collaborative_recommendations(self, user_id: str, limit: int) -> List[Dict]:
        """Get collaborative filtering recommendations"""
        try:
            recommendations = []
            
            # Find similar users
            similar_users = await self.behavior_tracker.get_similar_users(user_id, 5)
            
            if not similar_users:
                return []
            
            # Get events liked by similar users
            event_scores = {}
            
            for similar_user_id in similar_users:
                # Get events this similar user interacted with positively
                behaviors = await self.db.user_behaviors.find({
                    'user_id': similar_user_id,
                    'action_type': {'$in': ['purchase', 'like', 'share']},
                    'event_id': {'$exists': True}
                }).to_list(50)
                
                for behavior in behaviors:
                    event_id = behavior['event_id']
                    if event_id not in event_scores:
                        event_scores[event_id] = 0
                    
                    # Weight by action type
                    weight = {
                        'purchase': 3.0,
                        'like': 2.0,
                        'share': 1.5
                    }.get(behavior['action_type'], 1.0)
                    
                    event_scores[event_id] += weight
            
            # Convert to recommendations
            for event_id, score in event_scores.items():
                recommendations.append({
                    'event_id': event_id,
                    'score': score,
                    'reason': "Users like you also liked this",
                    'type': 'collaborative'
                })
            
            return sorted(recommendations, key=lambda x: x['score'], reverse=True)[:limit]
            
        except Exception as e:
            logging.error(f"Error getting collaborative recommendations: {str(e)}")
            return []
    
    async def _get_trending_recommendations(self, limit: int) -> List[Dict]:
        """Get trending event recommendations"""
        try:
            # Calculate trending events based on recent activity
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=7)
            
            pipeline = [
                {
                    '$match': {
                        'timestamp': {'$gte': cutoff_date},
                        'event_id': {'$exists': True}
                    }
                },
                {
                    '$group': {
                        '_id': '$event_id',
                        'interaction_count': {'$sum': 1},
                        'unique_users': {'$addToSet': '$user_id'}
                    }
                },
                {
                    '$project': {
                        'event_id': '$_id',
                        'interaction_count': 1,
                        'unique_user_count': {'$size': '$unique_users'},
                        'trend_score': {
                            '$multiply': ['$interaction_count', {'$size': '$unique_users'}]
                        }
                    }
                },
                {'$sort': {'trend_score': -1}},
                {'$limit': limit}
            ]
            
            trending = await self.db.user_behaviors.aggregate(pipeline).to_list(limit)
            
            recommendations = []
            for item in trending:
                recommendations.append({
                    'event_id': item['event_id'],
                    'score': item['trend_score'],
                    'reason': f"Trending - {item['unique_user_count']} users interested",
                    'type': 'trending'
                })
            
            return recommendations
            
        except Exception as e:
            logging.error(f"Error getting trending recommendations: {str(e)}")
            return []
    
    def _calculate_content_score(self, event: Dict, user_prefs: Dict) -> float:
        """Calculate content-based score for an event"""
        try:
            score = 0.0
            
            # Category preference
            category = event.get('category', 'General')
            category_prefs = user_prefs.get('categories', {})
            if category in category_prefs:
                score += category_prefs[category] * 0.4
            
            # Price preference
            event_price = event.get('price', 0)
            preferred_price = user_prefs.get('average_price_preference', 100)
            price_diff = abs(event_price - preferred_price) / max(preferred_price, 1)
            price_score = max(0, 1 - price_diff) * 0.2
            score += price_score
            
            # Rating score
            rating = event.get('average_rating', 0)
            score += (rating / 5.0) * 0.2
            
            # Availability score
            available_tickets = event.get('available_tickets', 0)
            total_tickets = event.get('total_tickets', 1)
            availability = available_tickets / max(total_tickets, 1)
            score += availability * 0.1
            
            # Recent events get slight boost
            event_date = event.get('created_at')
            if event_date and isinstance(event_date, datetime):
                days_old = (datetime.now(timezone.utc) - event_date).days
                freshness_score = max(0, 1 - (days_old / 30)) * 0.1
                score += freshness_score
            
            return score
            
        except Exception as e:
            logging.error(f"Error calculating content score: {str(e)}")
            return 0.0

class SmartSearchEngine:
    """Advanced search engine combining semantic search with personalization"""
    
    def __init__(self, vector_search: VectorSearchEngine, behavior_tracker: UserBehaviorTracker, 
                 recommendation_engine: PersonalizedRecommendationEngine, llm_key: str):
        self.vector_search = vector_search
        self.behavior_tracker = behavior_tracker
        self.recommendation_engine = recommendation_engine
        self.llm_key = llm_key
        
    async def smart_search(self, search_context: SearchContext, events: List[Event]) -> Dict[str, Any]:
        """Perform intelligent search with personalization and context understanding"""
        try:
            # Parse query intent
            intent = await self._parse_query_intent(search_context.query)
            
            # Semantic search
            semantic_results = await self.vector_search.search(
                search_context.query, 
                limit=20, 
                min_similarity=0.2
            )
            
            # Apply filters based on search context
            filtered_results = self._apply_contextual_filters(semantic_results, search_context, events)
            
            # Personalize results if user is provided
            if search_context.user_id:
                personalized_results = await self._personalize_search_results(
                    filtered_results, 
                    search_context.user_id
                )
            else:
                personalized_results = filtered_results
            
            # Generate AI explanation
            explanation = await self._generate_search_explanation(
                search_context.query, 
                personalized_results[:5], 
                intent
            )
            
            return {
                'results': personalized_results[:10],
                'intent': intent,
                'ai_explanation': explanation,
                'total_found': len(personalized_results),
                'search_query': search_context.query
            }
            
        except Exception as e:
            logging.error(f"Error in smart search: {str(e)}")
            return {
                'results': [],
                'intent': {},
                'ai_explanation': "Search temporarily unavailable. Please try again.",
                'total_found': 0,
                'search_query': search_context.query
            }
    
    async def _parse_query_intent(self, query: str) -> Dict[str, Any]:
        """Parse user query to understand intent"""
        intent = {
            'type': 'general',
            'location': None,
            'date': None,
            'category': None,
            'price_range': None,
            'keywords': []
        }
        
        query_lower = query.lower()
        
        # Extract location intent
        location_patterns = [
            r'in (\w+(?:\s+\w+)*)',
            r'near (\w+(?:\s+\w+)*)',
            r'at (\w+(?:\s+\w+)*)'
        ]
        
        for pattern in location_patterns:
            match = re.search(pattern, query_lower)
            if match:
                intent['location'] = match.group(1)
                break
        
        # Extract date intent
        date_patterns = [
            r'(today|tomorrow|tonight)',
            r'this (week|weekend|month)',
            r'next (week|weekend|month)',
            r'(monday|tuesday|wednesday|thursday|friday|saturday|sunday)'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, query_lower)
            if match:
                intent['date'] = match.group(0)
                break
        
        # Extract category intent
        category_keywords = {
            'music': ['music', 'concert', 'festival', 'band', 'singer', 'gig'],
            'sports': ['sports', 'game', 'match', 'football', 'basketball', 'soccer'],
            'technology': ['tech', 'technology', 'conference', 'startup', 'ai', 'software'],
            'arts': ['art', 'gallery', 'exhibition', 'theater', 'theatre', 'show'],
            'business': ['business', 'networking', 'professional', 'workshop', 'seminar']
        }
        
        for category, keywords in category_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                intent['category'] = category
                break
        
        # Extract price intent
        if 'free' in query_lower:
            intent['price_range'] = (0, 0)
        elif 'cheap' in query_lower or 'under' in query_lower:
            intent['price_range'] = (0, 50)
        elif 'expensive' in query_lower or 'premium' in query_lower:
            intent['price_range'] = (200, float('inf'))
        
        # Extract keywords
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'}
        words = query_lower.split()
        intent['keywords'] = [word for word in words if word not in stop_words and len(word) > 2]
        
        return intent
    
    def _apply_contextual_filters(self, search_results: List[Dict], context: SearchContext, events: List[Event]) -> List[Dict]:
        """Apply contextual filters to search results"""
        if not search_results:
            return []
        
        # Create event lookup
        event_lookup = {event.id: event for event in events}
        
        filtered_results = []
        
        for result in search_results:
            event_id = result['event_id']
            event = event_lookup.get(event_id)
            
            if not event:
                continue
            
            # Apply location filter
            if context.location and context.location.lower() not in event.location.lower():
                continue
            
            # Apply category filter
            if context.category and context.category.lower() != event.category.lower():
                continue
            
            # Apply price range filter
            if context.price_range:
                min_price, max_price = context.price_range
                if not (min_price <= event.price <= max_price):
                    continue
            
            # Apply date range filter (simplified)
            if context.date_range:
                # This would need more sophisticated date parsing
                # For now, just check if event is in the future
                if event.date < datetime.now(timezone.utc):
                    continue
            
            # Add event details to result
            result['event'] = event
            filtered_results.append(result)
        
        return filtered_results
    
    async def _personalize_search_results(self, search_results: List[Dict], user_id: str) -> List[Dict]:
        """Personalize search results based on user preferences"""
        try:
            user_prefs = await self.behavior_tracker.get_user_preferences(user_id)
            
            if not user_prefs:
                return search_results
            
            # Re-score results based on user preferences
            for result in search_results:
                event = result.get('event')
                if event:
                    # Calculate personalization boost
                    personalization_score = self._calculate_personalization_score(event, user_prefs)
                    
                    # Combine with semantic similarity
                    original_score = result.get('similarity_score', 0.5)
                    result['final_score'] = original_score * 0.7 + personalization_score * 0.3
                    result['personalization_score'] = personalization_score
            
            # Sort by final score
            search_results.sort(key=lambda x: x.get('final_score', 0), reverse=True)
            
            return search_results
            
        except Exception as e:
            logging.error(f"Error personalizing search results: {str(e)}")
            return search_results
    
    def _calculate_personalization_score(self, event: Event, user_prefs: Dict) -> float:
        """Calculate personalization score for an event"""
        try:
            score = 0.0
            
            # Category preference
            categories = user_prefs.get('categories', {})
            if event.category in categories:
                total_category_weight = sum(categories.values())
                category_weight = categories[event.category] / max(total_category_weight, 1)
                score += category_weight * 0.5
            
            # Price preference
            avg_price_pref = user_prefs.get('average_price_preference', 100)
            price_diff = abs(event.price - avg_price_pref) / max(avg_price_pref, 1)
            price_score = max(0, 1 - price_diff) * 0.3
            score += price_score
            
            # Location preference
            locations = user_prefs.get('locations', {})
            if any(loc in event.location for loc in locations.keys()):
                score += 0.2
            
            return min(score, 1.0)  # Cap at 1.0
            
        except Exception as e:
            logging.error(f"Error calculating personalization score: {str(e)}")
            return 0.0
    
    async def _generate_search_explanation(self, query: str, results: List[Dict], intent: Dict) -> str:
        """Generate AI explanation for search results"""
        try:
            if not self.llm_key or not results:
                return f"Found {len(results)} events matching your search for '{query}'"
            
            # Prepare results summary
            result_summary = []
            for i, result in enumerate(results[:3], 1):
                event = result.get('event')
                if event:
                    result_summary.append(f"{i}. **{event.name}** - {event.category} event in {event.location} for ${event.price}")
            
            results_text = '\n'.join(result_summary)
            intent_text = f"Intent: {intent.get('type', 'general')}"
            if intent.get('location'):
                intent_text += f", Location: {intent['location']}"
            if intent.get('category'):
                intent_text += f", Category: {intent['category']}"
            
            chat = LlmChat(
                api_key=self.llm_key,
                session_id=f"search-explanation-{uuid.uuid4()}",
                system_message="You are an AI assistant that explains search results in a friendly, helpful way. Use HTML formatting for better readability."
            ).with_model("openai", "gpt-4o-mini")
            
            user_message = UserMessage(
                text=f"User searched for: '{query}'\n"
                     f"{intent_text}\n\n"
                     f"Top results found:\n{results_text}\n\n"
                     f"Please explain these search results in a friendly way, highlighting why these events match the user's search. "
                     f"Use HTML formatting with <h3> for event names, <p> for descriptions, and <strong> for important details like prices and locations. "
                     f"Keep it concise but informative."
            )
            
            response = await chat.send_message(user_message)
            return response
            
        except Exception as e:
            logging.error(f"Error generating search explanation: {str(e)}")
            return f"Found {len(results)} events matching your search for '{query}'. Results are ranked by relevance and personalized based on your preferences."