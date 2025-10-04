#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class TicketAITester:
    def __init__(self, base_url="https://ticketai-saas.preview.emergentagent.com"):
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

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}: {response.text}")
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
            "password": "TestPass123"
        }
        
        success, response = self.run_test("User Registration", "POST", "auth/register", 200, user_data)
        return success, response

    def test_user_login(self):
        """Test user login"""
        login_data = {
            "email": self.user_email,
            "password": "TestPass123"
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

    # ===== CREDIT SYSTEM TESTS =====
    
    def test_credit_balance_unauthenticated(self):
        """Test credit balance endpoint without authentication"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        success, response = self.run_test("Credit Balance (Unauthenticated)", "GET", "credits/balance", 403)
        
        # Restore token
        self.token = temp_token
        return success, response

    def test_credit_balance_authenticated(self):
        """Test credit balance endpoint with authentication"""
        if not self.token:
            return False, "No authentication token available"
            
        success, response = self.run_test("Credit Balance (Authenticated)", "GET", "credits/balance", 200)
        
        if success:
            print(f"💰 User credits: {response.get('credits', 'N/A')}")
            print(f"🎁 Free trial used: {response.get('free_trial_used', 'N/A')}")
            print(f"📊 Total searches: {response.get('total_searches_performed', 'N/A')}")
        
        return success, response

    def test_free_trial_activation_unauthenticated(self):
        """Test free trial activation without authentication"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        success, response = self.run_test("Free Trial (Unauthenticated)", "POST", "credits/free-trial", 403)
        
        # Restore token
        self.token = temp_token
        return success, response

    def test_free_trial_activation_authenticated(self):
        """Test free trial activation with authentication"""
        if not self.token:
            return False, "No authentication token available"
            
        success, response = self.run_test("Free Trial Activation", "POST", "credits/free-trial", 200)
        
        if success:
            print(f"🎁 Free trial result: {response.get('message', 'N/A')}")
            print(f"💰 Credits added: {response.get('credits_added', 'N/A')}")
        
        return success, response

    def test_get_credit_packs(self):
        """Test getting available credit packs - verify all 7 packs with correct pricing"""
        success, response = self.run_test("Get Credit Packs", "GET", "credits/packs", 200)
        
        if success and 'packs' in response:
            packs = response['packs']
            print(f"📦 Found {len(packs)} credit packs")
            
            # Expected packs with correct pricing
            expected_packs = {
                "starter": {"price": 9.99, "credits": 100},
                "quick_topup": {"price": 1.0, "credits": 5},
                "basic_pack": {"price": 20.0, "credits": 100},
                "value_pack": {"price": 50.0, "credits": 250},
                "premium_pack": {"price": 100.0, "credits": 500},
                "business_bundle": {"price": 500.0, "credits": 3000},
                "enterprise_bundle": {"price": 1000.0, "credits": 6000}
            }
            
            # Verify all 7 packs are present
            if len(packs) != 7:
                print(f"❌ Expected 7 credit packs, found {len(packs)}")
                success = False
            else:
                print(f"✅ All 7 credit packs found")
            
            # Verify each pack has correct pricing and credits
            pack_ids = [pack.get('id') for pack in packs]
            for pack in packs:
                pack_id = pack.get('id')
                price = pack.get('price')
                credits = pack.get('credits')
                
                print(f"   - {pack.get('name', 'N/A')} ({pack_id}): ${price} for {credits} credits")
                
                if pack_id in expected_packs:
                    expected = expected_packs[pack_id]
                    if price != expected['price']:
                        print(f"     ❌ Wrong price: expected ${expected['price']}, got ${price}")
                        success = False
                    if credits != expected['credits']:
                        print(f"     ❌ Wrong credits: expected {expected['credits']}, got {credits}")
                        success = False
                else:
                    print(f"     ❌ Unexpected pack ID: {pack_id}")
                    success = False
            
            # Check for missing packs
            for expected_id in expected_packs:
                if expected_id not in pack_ids:
                    print(f"     ❌ Missing pack: {expected_id}")
                    success = False
        
        return success, response

    def test_credit_purchase_unauthenticated(self):
        """Test credit purchase without authentication"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        purchase_data = {
            "pack_id": "starter",
            "success_url": "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
            "cancel_url": "https://example.com/cancel",
            "payment_method": "stripe"
        }
        
        success, response = self.run_test("Credit Purchase (Unauthenticated)", "POST", "credits/purchase", 403, purchase_data)
        
        # Restore token
        self.token = temp_token
        return success, response

    def test_credit_purchase_authenticated(self):
        """Test credit purchase with authentication - starter pack"""
        if not self.token:
            return False, "No authentication token available"
            
        purchase_data = {
            "pack_id": "starter",
            "success_url": "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
            "cancel_url": "https://example.com/cancel",
            "payment_method": "stripe"
        }
        
        success, response = self.run_test("Credit Purchase - Starter Pack ($9.99/100)", "POST", "credits/purchase", 200, purchase_data)
        
        if success:
            print(f"🛒 Checkout URL: {response.get('checkout_url', 'N/A')[:50]}...")
            print(f"🔑 Session ID: {response.get('session_id', 'N/A')}")
        
        return success, response

    def test_credit_purchase_quick_topup(self):
        """Test credit purchase - quick topup pack ($1/5 credits)"""
        if not self.token:
            return False, "No authentication token available"
            
        purchase_data = {
            "pack_id": "quick_topup",
            "success_url": "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
            "cancel_url": "https://example.com/cancel",
            "payment_method": "stripe"
        }
        
        success, response = self.run_test("Credit Purchase - Quick Top-up ($1/5)", "POST", "credits/purchase", 200, purchase_data)
        
        if success:
            print(f"🛒 Quick top-up checkout created successfully")
            print(f"🔑 Session ID: {response.get('session_id', 'N/A')}")
        
        return success, response

    def test_credit_purchase_business_bundle(self):
        """Test credit purchase - business bundle ($500/3000 credits)"""
        if not self.token:
            return False, "No authentication token available"
            
        purchase_data = {
            "pack_id": "business_bundle",
            "success_url": "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
            "cancel_url": "https://example.com/cancel",
            "payment_method": "stripe"
        }
        
        success, response = self.run_test("Credit Purchase - Business Bundle ($500/3000)", "POST", "credits/purchase", 200, purchase_data)
        
        if success:
            print(f"🛒 Business bundle checkout created successfully")
            print(f"🔑 Session ID: {response.get('session_id', 'N/A')}")
        
        return success, response

    def test_credit_purchase_enterprise_bundle(self):
        """Test credit purchase - enterprise bundle ($1000/6000 credits)"""
        if not self.token:
            return False, "No authentication token available"
            
        purchase_data = {
            "pack_id": "enterprise_bundle",
            "success_url": "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
            "cancel_url": "https://example.com/cancel",
            "payment_method": "stripe"
        }
        
        success, response = self.run_test("Credit Purchase - Enterprise Bundle ($1000/6000)", "POST", "credits/purchase", 200, purchase_data)
        
        if success:
            print(f"🛒 Enterprise bundle checkout created successfully")
            print(f"🔑 Session ID: {response.get('session_id', 'N/A')}")
        
        return success, response

    def test_all_credit_pack_purchases(self):
        """Test purchasing all 7 credit packs"""
        if not self.token:
            return False, "No authentication token available"
        
        print("\n💳 Testing All Credit Pack Purchases")
        print("-" * 40)
        
        all_packs = [
            {"id": "starter", "name": "Starter Pack", "price": 9.99, "credits": 100},
            {"id": "quick_topup", "name": "Quick Top-up", "price": 1.0, "credits": 5},
            {"id": "basic_pack", "name": "Basic Pack", "price": 20.0, "credits": 100},
            {"id": "value_pack", "name": "Value Pack", "price": 50.0, "credits": 250},
            {"id": "premium_pack", "name": "Premium Pack", "price": 100.0, "credits": 500},
            {"id": "business_bundle", "name": "Business Bundle", "price": 500.0, "credits": 3000},
            {"id": "enterprise_bundle", "name": "Enterprise Bundle", "price": 1000.0, "credits": 6000}
        ]
        
        all_success = True
        
        for pack in all_packs:
            purchase_data = {
                "pack_id": pack["id"],
                "success_url": "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
                "cancel_url": "https://example.com/cancel",
                "payment_method": "stripe"
            }
            
            success, response = self.run_test(
                f"Purchase {pack['name']} (${pack['price']}/{pack['credits']} credits)", 
                "POST", 
                "credits/purchase", 
                200, 
                purchase_data
            )
            
            if success:
                print(f"   ✅ {pack['name']}: Checkout session created")
            else:
                print(f"   ❌ {pack['name']}: Failed to create checkout session")
                all_success = False
        
        return all_success, {"tested_packs": len(all_packs)}

    def test_credit_purchase_invalid_pack(self):
        """Test credit purchase with invalid pack ID"""
        if not self.token:
            return False, "No authentication token available"
            
        purchase_data = {
            "pack_id": "invalid_pack",
            "success_url": "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
            "cancel_url": "https://example.com/cancel",
            "payment_method": "stripe"
        }
        
        success, response = self.run_test("Credit Purchase (Invalid Pack)", "POST", "credits/purchase", 400, purchase_data)
        return success, response

    def test_credit_status_unauthenticated(self):
        """Test credit purchase status without authentication"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        mock_session_id = "cs_test_mock_session_id_12345"
        success, response = self.run_test("Credit Status (Unauthenticated)", "GET", f"credits/status/{mock_session_id}", 403)
        
        # Restore token
        self.token = temp_token
        return success, response

    def test_credit_status_authenticated(self):
        """Test credit purchase status with authentication"""
        if not self.token:
            return False, "No authentication token available"
            
        mock_session_id = "cs_test_mock_session_id_12345"
        success, response = self.run_test("Credit Status (Authenticated)", "GET", f"credits/status/{mock_session_id}", 404)
        
        # 404 is expected for non-existent session
        if response.get('detail') == 'Transaction not found':
            print(f"✅ Credit status check working (session not found as expected)")
            return True, response
        
        return success, response

    def test_stripe_webhook_endpoint(self):
        """Test Stripe webhook endpoint exists"""
        # Test that the webhook endpoint exists (should return 200 with error status for invalid webhook)
        success, response = self.run_test("Stripe Webhook Endpoint", "POST", "webhook/stripe", 200, {})
        
        # 200 with error status is expected for invalid webhook data
        if success and response.get('status') == 'error':
            print(f"✅ Stripe webhook endpoint exists and handles invalid data correctly")
            return True, response
        
        return success, response

    def test_smart_search_with_credits(self):
        """Test smart search with credit deduction"""
        if not self.token:
            return False, "No authentication token available"
            
        search_data = {
            "query": "music concerts in London",
            "location": "London, UK",
            "max_results": 5
        }
        
        success, response = self.run_test("Smart Search (With Credits)", "POST", "search/smart", 200, search_data)
        
        if success:
            print(f"🔍 Search results: {len(response.get('events', []))} events found")
            print(f"💰 Credits remaining: {response.get('credits_remaining', 'N/A')}")
            if response.get('credit_warning'):
                print(f"⚠️ Low credit warning displayed")
        
        return success, response

    def test_recommendations_with_credits(self):
        """Test recommendations with credit deduction"""
        if not self.token:
            return False, "No authentication token available"
            
        recommendation_data = {
            "user_preferences": "I love jazz music and art exhibitions in London",
            "location": "London, UK"
        }
        
        success, response = self.run_test("Recommendations (With Credits)", "POST", "recommendations", 200, recommendation_data)
        
        if success:
            print(f"🎯 Recommendations: {len(response.get('recommendations', []))} events")
            print(f"💰 Credits remaining: {response.get('credits_remaining', 'N/A')}")
            if response.get('credit_warning'):
                print(f"⚠️ Low credit warning displayed")
        
        return success, response

    def test_user_registration_with_credits(self):
        """Test that new users get 100 free credits"""
        timestamp = int(time.time())
        test_email = f"credituser_{timestamp}@example.com"
        
        user_data = {
            "name": f"Credit Test User {timestamp}",
            "email": test_email,
            "password": "TestPass123"
        }
        
        success, response = self.run_test("User Registration (Credit Check)", "POST", "auth/register", 200, user_data)
        
        if success:
            # Check if user has credits field
            credits = response.get('credits', 0)
            free_trial_used = response.get('free_trial_used', False)
            print(f"💰 New user credits: {credits}")
            print(f"🎁 Free trial status: {free_trial_used}")
            
            if credits == 100:
                print(f"✅ New user correctly received 100 free credits")
            else:
                print(f"❌ New user should have 100 credits, got {credits}")
        
        return success, response

    def run_credit_system_tests(self):
        """Run comprehensive credit system tests"""
        print("\n🏦 Starting Credit System Tests")
        print("=" * 50)
        
        # Test credit balance endpoints
        self.test_credit_balance_unauthenticated()
        if self.token:
            self.test_credit_balance_authenticated()
        
        # Test free trial activation
        self.test_free_trial_activation_unauthenticated()
        if self.token:
            # Note: This might fail if free trial already used
            trial_success, trial_response = self.test_free_trial_activation_authenticated()
            if not trial_success and "already used" in str(trial_response).lower():
                print("ℹ️ Free trial already used (expected for existing user)")
        
        # Test credit packs
        self.test_get_credit_packs()
        
        # Test credit purchase
        self.test_credit_purchase_unauthenticated()
        if self.token:
            self.test_credit_purchase_authenticated()
            self.test_credit_purchase_quick_topup()
            self.test_credit_purchase_business_bundle()
            self.test_credit_purchase_enterprise_bundle()
            self.test_all_credit_pack_purchases()
            self.test_credit_purchase_invalid_pack()
        
        # Test credit status
        self.test_credit_status_unauthenticated()
        if self.token:
            self.test_credit_status_authenticated()
        
        # Test webhook endpoint
        self.test_stripe_webhook_endpoint()
        
        # Test AI features with credit deduction
        if self.token:
            self.test_smart_search_with_credits()
            self.test_recommendations_with_credits()
        
        # Test new user registration with credits
        self.test_user_registration_with_credits()
        
        print("🏦 Credit System Tests Complete")
        print("=" * 50)

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
        
        # Run Credit System Tests (main focus)
        self.run_credit_system_tests()
        
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
        
        # Test AI recommendations (already tested in credit system)
        # self.test_ai_recommendations()
        
        # Test mock payment
        self.test_mock_payment()
        
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