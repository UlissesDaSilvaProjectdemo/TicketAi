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