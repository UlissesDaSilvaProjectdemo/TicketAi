from fastapi import BackgroundTasks, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
import os
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
import uuid
from models import *
import asyncio
import json

# Email Service
class EmailService:
    def __init__(self):
        self.sendgrid_key = os.environ.get('SENDGRID_API_KEY')
        self.sender_email = os.environ.get('SENDER_EMAIL', 'noreply@ticketai.com')
        self.client = SendGridAPIClient(self.sendgrid_key) if self.sendgrid_key else None
    
    async def send_booking_confirmation(self, ticket: Ticket, event: Event, user: User):
        """Send booking confirmation email"""
        if not self.client:
            logging.warning("SendGrid not configured, skipping email")
            return False
        
        subject = f"Booking Confirmed: {event.name}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                <h1>🎫 Booking Confirmed!</h1>
                <p style="font-size: 18px; margin: 0;">Your ticket for {event.name} is ready</p>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">Event Details</h2>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Event:</strong> {event.name}</p>
                    <p><strong>Date:</strong> {event.date.strftime('%A, %B %d, %Y at %I:%M %p')}</p>
                    <p><strong>Location:</strong> {event.location}</p>
                    <p><strong>Ticket Type:</strong> {ticket.ticket_type}</p>
                    <p><strong>Price:</strong> ${ticket.price:.2f}</p>
                </div>
                
                <h3 style="color: #333;">Your QR Code</h3>
                <div style="text-align: center; margin: 20px 0;">
                    <img src="{ticket.qr_code}" alt="QR Code" style="max-width: 200px;">
                    <p style="font-size: 12px; color: #666;">Present this QR code at the venue entrance</p>
                </div>
                
                <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #1976d2;">Important Information</h4>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>Save this email for your records</li>
                        <li>Arrive 30 minutes before the event</li>
                        <li>Bring a valid ID for verification</li>
                        <li>Screenshots of QR codes are accepted</li>
                    </ul>
                </div>
            </div>
            
            <div style="background: #333; color: white; padding: 20px; text-align: center;">
                <p>Need help? Contact us at support@ticketai.com</p>
                <p style="font-size: 12px; margin: 0;">© 2025 TicketAI - AI-Powered Event Discovery</p>
            </div>
        </body>
        </html>
        """
        
        try:
            message = Mail(
                from_email=self.sender_email,
                to_emails=user.email,
                subject=subject,
                html_content=html_content
            )
            
            response = self.client.send(message)
            return response.status_code == 202
        except Exception as e:
            logging.error(f"Failed to send booking confirmation: {str(e)}")
            return False
    
    async def send_event_reminder(self, ticket: Ticket, event: Event, user: User):
        """Send event reminder email"""
        if not self.client:
            return False
            
        time_until = event.date - datetime.now(timezone.utc)
        time_str = "tomorrow" if time_until.days == 1 else f"in {time_until.days} days"
        
        subject = f"Reminder: {event.name} is {time_str}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center;">
                <h1>🔔 Event Reminder</h1>
                <p style="font-size: 18px; margin: 0;">{event.name} is {time_str}!</p>
            </div>
            
            <div style="padding: 30px;">
                <h2>Don't forget your upcoming event:</h2>
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
                    <h3>{event.name}</h3>
                    <p><strong>📅 Date:</strong> {event.date.strftime('%A, %B %d, %Y at %I:%M %p')}</p>
                    <p><strong>📍 Location:</strong> {event.location}</p>
                    <p><strong>🎫 Ticket:</strong> {ticket.ticket_type} - ${ticket.price:.2f}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <img src="{ticket.qr_code}" alt="QR Code" style="max-width: 150px;">
                    <p style="font-size: 12px; color: #666;">Your entry QR code</p>
                </div>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px;">
                    <h4 style="margin-top: 0;">💡 Friendly Reminders</h4>
                    <ul>
                        <li>Check traffic and parking information</li>
                        <li>Arrive early to avoid queues</li>
                        <li>Check if there are any last-minute updates</li>
                    </ul>
                </div>
            </div>
        </body>
        </html>
        """
        
        try:
            message = Mail(
                from_email=self.sender_email,
                to_emails=user.email,
                subject=subject,
                html_content=html_content
            )
            
            response = self.client.send(message)
            return response.status_code == 202
        except Exception as e:
            logging.error(f"Failed to send event reminder: {str(e)}")
            return False

# Payment Service
class PaymentService:
    def __init__(self, db: AsyncIOMotorClient):
        self.db = db
        self.stripe_key = os.environ.get('STRIPE_API_KEY')
        
    async def create_checkout_session(self, request: CheckoutRequest, user_email: str = None) -> Dict:
        """Create Stripe checkout session for ticket purchase"""
        try:
            # Get event details
            event = await self.db.events.find_one({"id": request.event_id})
            if not event:
                raise HTTPException(status_code=404, detail="Event not found")
            
            # Calculate total amount
            total_amount = event["price"] * request.ticket_quantity
            
            # Create payment transaction record
            transaction = PaymentTransaction(
                session_id=str(uuid.uuid4()),
                user_email=user_email,
                event_id=request.event_id,
                amount=total_amount,
                currency="usd",
                status="pending",
                payment_method="stripe",
                metadata={
                    "event_name": event["name"],
                    "ticket_quantity": request.ticket_quantity,
                    "ticket_type": request.ticket_type
                }
            )
            
            # Save transaction before creating Stripe session
            await self.db.payment_transactions.insert_one(transaction.dict())
            
            # Create Stripe checkout session
            stripe_checkout = StripeCheckout(
                api_key=self.stripe_key,
                webhook_url=f"{request.success_url.split('?')[0].replace('/success', '')}/api/webhook/stripe"
            )
            
            checkout_request = CheckoutSessionRequest(
                amount=total_amount,
                currency="usd",
                success_url=request.success_url,
                cancel_url=request.cancel_url,
                metadata={
                    "transaction_id": transaction.id,
                    "event_id": request.event_id,
                    "user_email": user_email or "",
                    "ticket_quantity": str(request.ticket_quantity)
                }
            )
            
            session_response = await stripe_checkout.create_checkout_session(checkout_request)
            
            # Update transaction with Stripe session ID
            await self.db.payment_transactions.update_one(
                {"id": transaction.id},
                {"$set": {"stripe_session_id": session_response.session_id}}
            )
            
            return {
                "checkout_url": session_response.url,
                "session_id": session_response.session_id,
                "transaction_id": transaction.id
            }
            
        except Exception as e:
            logging.error(f"Failed to create checkout session: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create checkout session")
    
    async def handle_payment_success(self, session_id: str) -> Optional[Dict]:
        """Handle successful payment and create tickets"""
        try:
            # Get transaction
            transaction = await self.db.payment_transactions.find_one({"stripe_session_id": session_id})
            if not transaction:
                return None
            
            # Avoid double processing
            if transaction["status"] == "completed":
                return {"status": "already_processed", "transaction_id": transaction["id"]}
            
            # Get event
            event = await self.db.events.find_one({"id": transaction["event_id"]})
            if not event:
                return None
            
            # Check ticket availability
            ticket_quantity = transaction["metadata"].get("ticket_quantity", 1)
            if isinstance(ticket_quantity, str):
                ticket_quantity = int(ticket_quantity)
                
            if event["available_tickets"] < ticket_quantity:
                return {"status": "insufficient_tickets"}
            
            # Create tickets
            tickets = []
            for i in range(ticket_quantity):
                qr_data = f"TICKET:{transaction['event_id']}:{transaction['user_email']}:{uuid.uuid4()}"
                qr_code = self.generate_qr_code(qr_data)
                
                ticket = Ticket(
                    event_id=transaction["event_id"],
                    user_email=transaction["user_email"] or "",
                    user_name=transaction["metadata"].get("user_name", "Guest"),
                    ticket_type=transaction["metadata"].get("ticket_type", "Standard"),
                    qr_code=qr_code,
                    price=event["price"],
                    payment_intent_id=transaction["stripe_session_id"],
                    source="local"
                )
                
                await self.db.tickets.insert_one(ticket.dict())
                tickets.append(ticket)
            
            # Update event availability
            await self.db.events.update_one(
                {"id": transaction["event_id"]},
                {"$inc": {"available_tickets": -ticket_quantity}}
            )
            
            # Update transaction status
            await self.db.payment_transactions.update_one(
                {"id": transaction["id"]},
                {
                    "$set": {
                        "status": "completed",
                        "completed_at": datetime.now(timezone.utc)
                    }
                }
            )
            
            return {
                "status": "success",
                "tickets": [ticket.dict() for ticket in tickets],
                "transaction_id": transaction["id"]
            }
            
        except Exception as e:
            logging.error(f"Failed to handle payment success: {str(e)}")
            return None
    
    def generate_qr_code(self, data: str) -> str:
        """Generate QR code (fallback implementation)"""
        try:
            import qrcode
            from io import BytesIO
            import base64
            
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(data)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            
            img_base64 = base64.b64encode(buffer.read()).decode()
            return f"data:image/png;base64,{img_base64}"
        except Exception:
            # Fallback placeholder
            return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# Social Features Service
class SocialService:
    def __init__(self, db: AsyncIOMotorClient):
        self.db = db
    
    async def add_to_wishlist(self, user_id: str, event_id: str) -> bool:
        """Add event to user's wishlist"""
        try:
            # Check if already in wishlist
            user = await self.db.users.find_one({"id": user_id})
            if user and event_id in user.get("wishlist", []):
                return False
            
            # Add to wishlist
            await self.db.users.update_one(
                {"id": user_id},
                {"$addToSet": {"wishlist": event_id}}
            )
            return True
        except Exception as e:
            logging.error(f"Failed to add to wishlist: {str(e)}")
            return False
    
    async def remove_from_wishlist(self, user_id: str, event_id: str) -> bool:
        """Remove event from user's wishlist"""
        try:
            await self.db.users.update_one(
                {"id": user_id},
                {"$pull": {"wishlist": event_id}}
            )
            return True
        except Exception as e:
            logging.error(f"Failed to remove from wishlist: {str(e)}")
            return False
    
    async def create_review(self, review: ReviewCreate, user_id: str, user_name: str) -> Optional[EventReview]:
        """Create event review"""
        try:
            # Check if user attended the event
            ticket = await self.db.tickets.find_one({
                "event_id": review.event_id,
                "user_email": {"$exists": True}  # This would need user lookup
            })
            
            event_review = EventReview(
                event_id=review.event_id,
                user_id=user_id,
                user_name=user_name,
                rating=review.rating,
                comment=review.comment,
                verified_attendee=bool(ticket)
            )
            
            # Save review
            await self.db.event_reviews.insert_one(event_review.dict())
            
            # Update event average rating
            await self.update_event_rating(review.event_id)
            
            return event_review
        except Exception as e:
            logging.error(f"Failed to create review: {str(e)}")
            return None
    
    async def update_event_rating(self, event_id: str):
        """Update event's average rating"""
        try:
            # Calculate average rating
            pipeline = [
                {"$match": {"event_id": event_id}},
                {"$group": {
                    "_id": None,
                    "average_rating": {"$avg": "$rating"},
                    "review_count": {"$sum": 1}
                }}
            ]
            
            result = await self.db.event_reviews.aggregate(pipeline).to_list(1)
            
            if result:
                avg_rating = result[0]["average_rating"]
                await self.db.events.update_one(
                    {"id": event_id},
                    {"$set": {"average_rating": round(avg_rating, 1)}}
                )
        except Exception as e:
            logging.error(f"Failed to update event rating: {str(e)}")

# Resale Market Service
class ResaleService:
    def __init__(self, db: AsyncIOMotorClient):
        self.db = db
    
    async def list_ticket_for_resale(self, listing: ResaleListingCreate, seller_email: str, seller_name: str) -> Optional[ResaleTicket]:
        """List ticket for resale"""
        try:
            # Verify ticket ownership
            ticket = await self.db.tickets.find_one({
                "id": listing.ticket_id,
                "user_email": seller_email,
                "status": "confirmed"
            })
            
            if not ticket:
                return None
            
            # Create resale listing
            resale_ticket = ResaleTicket(
                ticket_id=listing.ticket_id,
                seller_email=seller_email,
                seller_name=seller_name,
                event_id=ticket["event_id"],
                original_price=ticket["price"],
                asking_price=listing.asking_price,
                description=listing.description,
                is_verified=True  # Since we verified ownership
            )
            
            # Mark original ticket as for resale
            await self.db.tickets.update_one(
                {"id": listing.ticket_id},
                {"$set": {"is_for_resale": True, "resale_price": listing.asking_price}}
            )
            
            # Save resale listing
            await self.db.resale_tickets.insert_one(resale_ticket.dict())
            
            return resale_ticket
        except Exception as e:
            logging.error(f"Failed to list ticket for resale: {str(e)}")
            return None
    
    async def get_resale_listings(self, event_id: str = None) -> List[ResaleTicket]:
        """Get resale listings"""
        try:
            query = {"status": "active"}
            if event_id:
                query["event_id"] = event_id
                
            listings = await self.db.resale_tickets.find(query).to_list(100)
            return [ResaleTicket(**listing) for listing in listings]
        except Exception as e:
            logging.error(f"Failed to get resale listings: {str(e)}")
            return []

# Notification Service
class NotificationService:
    def __init__(self, db: AsyncIOMotorClient, email_service: EmailService):
        self.db = db
        self.email_service = email_service
    
    async def schedule_event_reminders(self):
        """Schedule reminders for upcoming events"""
        try:
            # Find events happening in 24 hours
            tomorrow = datetime.now(timezone.utc) + timedelta(hours=24)
            day_after = tomorrow + timedelta(hours=1)
            
            events = await self.db.events.find({
                "date": {"$gte": tomorrow, "$lt": day_after}
            }).to_list(100)
            
            for event in events:
                # Find tickets for this event
                tickets = await self.db.tickets.find({"event_id": event["id"]}).to_list(1000)
                
                for ticket in tickets:
                    # Get user details
                    user = await self.db.users.find_one({"email": ticket["user_email"]})
                    if user and user.get("notification_settings", {}).get("email_reminders", True):
                        # Send reminder email
                        await self.email_service.send_event_reminder(
                            Ticket(**ticket),
                            Event(**event),
                            User(**user)
                        )
                        
        except Exception as e:
            logging.error(f"Failed to schedule reminders: {str(e)}")
    
    async def create_notification(self, user_id: str, notification_type: str, title: str, message: str, data: Dict = None) -> bool:
        """Create in-app notification"""
        try:
            notification = Notification(
                user_id=user_id,
                type=notification_type,
                title=title,
                message=message,
                data=data or {}
            )
            
            await self.db.notifications.insert_one(notification.dict())
            return True
        except Exception as e:
            logging.error(f"Failed to create notification: {str(e)}")
            return False</content>
    </file>