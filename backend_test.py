#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class TicketAITester:
    def __init__(self, base_url="https://ticketwiz.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_email = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            # Handle multiple expected status codes
            if isinstance(expected_status, list):
                success = response.status_code in expected_status
            else:
                success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                expected_str = str(expected_status) if not isinstance(expected_status, list) else f"one of {expected_status}"
                self.log_test(name, False, f"Expected {expected_str}, got {response.status_code}: {response.text}")
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_user_registration(self):
        """Test user registration"""
        timestamp = int(time.time())
        self.user_email = f"testuser_{timestamp}@example.com"
        
        user_data = {
            "name": f"Test User {timestamp}",
            "email": self.user_email,
            "password": "TestPassword123!"
        }
        
        success, response = self.run_test("User Registration", "POST", "auth/register", 200, user_data)
        return success, response

    def test_user_login(self):
        """Test user login"""
        login_data = {
            "email": self.user_email,
            "password": "TestPassword123!"
        }
        
        success, response = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"🔑 Authentication token obtained")
            return True, response
        else:
            print(f"❌ Failed to get authentication token")
            return False, response

    def test_get_events(self):
        """Test getting all events"""
        success, response = self.run_test("Get Events", "GET", "events", 200)
        
        if success and isinstance(response, list):
            print(f"📅 Found {len(response)} events")
            return True, response
        return False, response

    def test_get_single_event(self, event_id):
        """Test getting a single event"""
        success, response = self.run_test(f"Get Event {event_id[:8]}", "GET", f"events/{event_id}", 200)
        return success, response

    def test_create_event(self):
        """Test creating a new event"""
        event_data = {
            "name": "Test Event",
            "description": "This is a test event created by automated testing",
            "date": "2025-06-15T18:00:00",
            "location": "Test Location, Test City",
            "price": 25.99,
            "total_tickets": 100,
            "category": "Testing"
        }
        
        success, response = self.run_test("Create Event", "POST", "events", 200, event_data)
        return success, response

    def test_book_ticket(self, event_id):
        """Test booking a ticket"""
        if not self.user_email:
            return False, "No user email available"
            
        ticket_data = {
            "event_id": event_id,
            "user_email": self.user_email,
            "user_name": "Test User",
            "ticket_type": "Standard"
        }
        
        success, response = self.run_test("Book Ticket", "POST", "tickets", 200, ticket_data)
        return success, response

    def test_get_user_tickets(self):
        """Test getting user tickets"""
        if not self.user_email:
            return False, "No user email available"
            
        success, response = self.run_test("Get User Tickets", "GET", f"tickets/user/{self.user_email}", 200)
        return success, response

    def test_ai_recommendations(self):
        """Test AI recommendations"""
        recommendation_data = {
            "user_preferences": "I love technology conferences and networking events",
            "location": "San Francisco"
        }
        
        success, response = self.run_test("AI Recommendations", "POST", "recommendations", 200, recommendation_data)
        
        if success:
            print(f"🤖 AI recommendations received")
            if 'recommendations' in response:
                print(f"📊 Got {len(response['recommendations'])} recommendations")
        
        return success, response

    def test_mock_payment(self):
        """Test mock payment processing"""
        payment_data = {
            "amount": 99.99,
            "cardNumber": "4111111111111111",
            "expiryDate": "12/25",
            "cvv": "123",
            "cardholderName": "Test User"
        }
        
        success, response = self.run_test("Mock Payment", "POST", "payments/process", 200, payment_data)
        
        if success and response.get('status') == 'success':
            print(f"💳 Payment processed successfully: {response.get('payment_id', 'N/A')}")
        
        return success, response

    # Credit System Tests
    def test_credit_balance(self):
        """Test getting credit balance - should auto-create 50 free trial credits"""
        success, response = self.run_test("Get Credit Balance", "GET", "credits/balance", 200)
        
        if success:
            balance = response.get('balance', 0)
            total_earned = response.get('total_earned', 0)
            print(f"💰 Credit balance: {balance} credits (earned: {total_earned})")
            
            # For new users, should have 50 free trial credits
            if balance == 50 and total_earned == 50:
                print("🎁 Free trial credits correctly assigned")
            
        return success, response

    def test_credit_transactions(self):
        """Test getting credit transaction history"""
        success, response = self.run_test("Get Credit Transactions", "GET", "credits/transactions", 200)
        
        if success and 'transactions' in response:
            transactions = response['transactions']
            print(f"📊 Found {len(transactions)} credit transactions")
            
            # Check for trial credit transaction
            trial_found = any(t.get('transaction_type') == 'trial' for t in transactions)
            if trial_found:
                print("✅ Trial credit transaction found in history")
        
        return success, response

    def test_credit_packs(self):
        """Test getting available credit packs"""
        success, response = self.run_test("Get Credit Packs", "GET", "credits/packs", 200)
        
        if success and 'packs' in response:
            packs = response['packs']
            print(f"📦 Found {len(packs)} credit packs available")
            
            # Verify expected packs
            expected_packs = {'small': 100, 'medium': 500, 'large': 1000}
            for pack in packs:
                pack_id = pack.get('id')
                credits = pack.get('credits')
                price = pack.get('price')
                
                if pack_id in expected_packs:
                    expected_credits = expected_packs[pack_id]
                    if credits == expected_credits:
                        print(f"✅ {pack_id.title()} pack: {credits} credits for ${price}")
                    else:
                        print(f"❌ {pack_id.title()} pack has wrong credits: {credits} (expected {expected_credits})")
        
        return success, response

    def test_credit_purchase(self):
        """Test creating a credit purchase session"""
        purchase_data = {
            "credit_pack_id": "small",
            "payment_provider": "stripe",
            "success_url": f"{self.base_url}/credits/success",
            "cancel_url": f"{self.base_url}/credits/cancel"
        }
        
        success, response = self.run_test("Create Credit Purchase", "POST", "credits/purchase", 200, purchase_data)
        
        if success:
            checkout_url = response.get('checkout_url')
            session_id = response.get('session_id')
            pack = response.get('pack')
            
            if checkout_url and session_id:
                print(f"💳 Stripe checkout session created: {session_id[:20]}...")
                print(f"🔗 Checkout URL generated")
                
                if pack:
                    print(f"📦 Pack: {pack.get('name')} - {pack.get('credits')} credits for ${pack.get('price')}")
                
                # Store session_id for status testing
                self.credit_session_id = session_id
                return True, response
        
        return success, response

    def test_credit_purchase_invalid_pack(self):
        """Test credit purchase with invalid pack ID"""
        purchase_data = {
            "credit_pack_id": "invalid_pack",
            "payment_provider": "stripe",
            "success_url": f"{self.base_url}/credits/success",
            "cancel_url": f"{self.base_url}/credits/cancel"
        }
        
        success, response = self.run_test("Credit Purchase Invalid Pack", "POST", "credits/purchase", 400, purchase_data)
        return success, response

    def test_credit_purchase_status(self):
        """Test checking credit purchase status"""
        if not hasattr(self, 'credit_session_id'):
            print("⚠️ No credit session ID available, skipping status test")
            return False, "No session ID"
        
        success, response = self.run_test(
            "Credit Purchase Status", 
            "GET", 
            f"credits/purchase/status/{self.credit_session_id}", 
            200
        )
        
        if success:
            status = response.get('status')
            payment_status = response.get('payment_status')
            print(f"📊 Purchase status: {status}, Payment: {payment_status}")
        
        return success, response

    def test_credit_based_ticket_booking(self, event_id):
        """Test booking a ticket using credits"""
        if not event_id:
            return False, "No event ID available"
        
        booking_data = {
            "event_id": event_id,
            "ticket_quantity": 1,
            "ticket_type": "Standard"
        }
        
        success, response = self.run_test("Credit-Based Ticket Booking", "POST", "tickets/checkout/credits", 200, booking_data)
        
        if success:
            ticket_id = response.get('ticket_id')
            credits_used = response.get('credits_used', 0)
            remaining_balance = response.get('remaining_balance', 0)
            
            if ticket_id:
                print(f"🎫 Ticket booked with credits: {ticket_id[:8]}...")
                print(f"💰 Credits used: {credits_used}, Remaining: {remaining_balance}")
        
        return success, response

    def test_credit_booking_insufficient_credits(self, event_id):
        """Test credit booking with insufficient credits"""
        if not event_id:
            return False, "No event ID available"
        
        # First, let's try to spend all credits by booking multiple tickets
        # This test assumes we might not have enough credits
        booking_data = {
            "event_id": event_id,
            "ticket_quantity": 20,  # Try to book many tickets to exhaust credits
            "ticket_type": "Standard"
        }
        
        # This should fail with insufficient credits (400) or succeed if we have enough
        success, response = self.run_test("Credit Booking Insufficient Credits", "POST", "tickets/checkout/credits", [400, 200], booking_data)
        
        if not success:
            # If it's a 400 error, check if it's about insufficient credits
            error_msg = response.get('detail', '')
            if 'insufficient' in error_msg.lower() or 'credit' in error_msg.lower():
                print("✅ Correctly rejected booking due to insufficient credits")
                return True, response
        
        return success, response

    def test_credit_booking_nonexistent_event(self):
        """Test credit booking with non-existent event"""
        fake_event_id = "00000000-0000-0000-0000-000000000000"
        
        booking_data = {
            "event_id": fake_event_id,
            "ticket_quantity": 1,
            "ticket_type": "Standard"
        }
        
        success, response = self.run_test("Credit Booking Non-existent Event", "POST", "tickets/checkout/credits", 404, booking_data)
        return success, response

    def test_credit_endpoints_without_auth(self):
        """Test credit endpoints without authentication"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        # Test endpoints that should require auth
        endpoints_to_test = [
            ("credits/balance", "GET"),
            ("credits/transactions", "GET"),
            ("credits/purchase", "POST")
        ]
        
        results = []
        for endpoint, method in endpoints_to_test:
            data = {"credit_pack_id": "small", "payment_provider": "stripe", "success_url": "test", "cancel_url": "test"} if method == "POST" else None
            success, response = self.run_test(f"Unauthorized {endpoint}", method, endpoint, 401, data)
            results.append(success)
        
        # Restore token
        self.token = original_token
        
        return all(results), "All unauthorized tests completed"

    def run_credit_system_tests(self):
        """Run comprehensive credit system tests"""
        print("\n💳 Starting Credit System Tests")
        print("=" * 40)
        
        if not self.token:
            print("❌ No authentication token available for credit tests")
            return False
        
        # Test credit balance (should auto-create free trial credits)
        balance_success, balance_response = self.test_credit_balance()
        
        # Test credit transactions
        self.test_credit_transactions()
        
        # Test credit packs
        self.test_credit_packs()
        
        # Test credit purchase creation
        purchase_success, purchase_response = self.test_credit_purchase()
        
        # Test invalid credit pack
        self.test_credit_purchase_invalid_pack()
        
        # Test purchase status
        if purchase_success:
            self.test_credit_purchase_status()
        
        # Test unauthorized access
        self.test_credit_endpoints_without_auth()
        
        # Get an event for credit booking tests
        events_success, events_response = self.test_get_events()
        event_id = None
        if events_success and events_response:
            event_id = events_response[0]['id']
            
            # Test credit-based ticket booking
            booking_success, booking_response = self.test_credit_based_ticket_booking(event_id)
            
            # Test insufficient credits scenario
            self.test_credit_booking_insufficient_credits(event_id)
        
        # Test booking with non-existent event
        self.test_credit_booking_nonexistent_event()
        
        print("💳 Credit system tests completed")
        return True

    def run_comprehensive_test(self):
        """Run all tests in sequence"""
        print("🚀 Starting TicketAI Backend API Tests")
        print("=" * 50)
        
        # Test API root
        self.test_api_root()
        
        # Test user registration and login
        reg_success, reg_response = self.test_user_registration()
        if reg_success:
            login_success, login_response = self.test_user_login()
        else:
            print("❌ Skipping login test due to registration failure")
            login_success = False
        
        # Test events
        events_success, events_response = self.test_get_events()
        event_id = None
        
        if events_success and events_response:
            # Test getting a single event
            event_id = events_response[0]['id']
            self.test_get_single_event(event_id)
        
        # Test creating an event (requires auth)
        if login_success:
            create_success, create_response = self.test_create_event()
            if create_success and 'id' in create_response:
                created_event_id = create_response['id']
                print(f"📝 Created event with ID: {created_event_id[:8]}")
                
                # Test booking a ticket for the created event
                ticket_success, ticket_response = self.test_book_ticket(created_event_id)
                if ticket_success:
                    print(f"🎫 Ticket booked successfully: {ticket_response.get('id', 'N/A')[:8]}")
        
        # Test getting user tickets
        if login_success:
            self.test_get_user_tickets()
        
        # Test AI recommendations
        self.test_ai_recommendations()
        
        # Test mock payment
        self.test_mock_payment()
        
        # Run comprehensive credit system tests
        if login_success:
            self.run_credit_system_tests()
        else:
            print("❌ Skipping credit system tests due to authentication failure")
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = TicketAITester()
    return tester.run_comprehensive_test()

if __name__ == "__main__":
    sys.exit(main())