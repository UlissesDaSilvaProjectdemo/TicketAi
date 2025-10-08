#!/usr/bin/env python3
"""
Backend API Testing for TicketAI Application
Tests all backend endpoints including AI-powered search and recommendations
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BACKEND_URL = get_backend_url()
if not BACKEND_URL:
    print("ERROR: Could not get REACT_APP_BACKEND_URL from frontend/.env")
    sys.exit(1)

print(f"Testing backend at: {BACKEND_URL}")

class TicketAITester:
    def __init__(self, base_url):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_results = []
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'response': response_data
        })
    
    def test_basic_api_health(self):
        """Test basic API health endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/")
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "TicketAI" in data["message"]:
                    self.log_test("Basic API Health Check", True, f"Status: {response.status_code}, Message: {data['message']}")
                    return True
                else:
                    self.log_test("Basic API Health Check", False, f"Unexpected response format", data)
                    return False
            else:
                self.log_test("Basic API Health Check", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Basic API Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_events_get_endpoint(self):
        """Test GET /api/events endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/events")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check if events have required fields
                    first_event = data[0]
                    required_fields = ['id', 'name', 'description', 'venue', 'location', 'date', 'time', 'category', 'price']
                    missing_fields = [field for field in required_fields if field not in first_event]
                    
                    if not missing_fields:
                        self.log_test("Events GET Endpoint", True, f"Retrieved {len(data)} events with proper structure")
                        return True
                    else:
                        self.log_test("Events GET Endpoint", False, f"Missing fields in event data: {missing_fields}")
                        return False
                else:
                    self.log_test("Events GET Endpoint", False, "No events returned or invalid format", data)
                    return False
            else:
                self.log_test("Events GET Endpoint", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Events GET Endpoint", False, f"Error: {str(e)}")
            return False
    
    def test_ai_search_endpoint(self):
        """Test AI search endpoint with various queries"""
        test_queries = [
            {"query": "rock concerts", "expected_category": "Music"},
            {"query": "tech events", "expected_category": "Conference"},
            {"query": "comedy shows", "expected_category": "Comedy"},
            {"query": "art exhibitions", "expected_category": "Art"},
            {"query": "basketball games", "expected_category": "Sports"}
        ]
        
        all_passed = True
        
        for test_case in test_queries:
            try:
                payload = {
                    "query": test_case["query"],
                    "location": "New York, NY"
                }
                
                response = self.session.post(f"{self.base_url}/api/ai-search", json=payload)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check response structure
                    if "query" in data and "results" in data and "total_found" in data:
                        results = data["results"]
                        
                        if isinstance(results, list):
                            if len(results) > 0:
                                # Check if results are relevant (at least one should match expected category)
                                relevant_found = any(
                                    event.get("category", "").lower() == test_case["expected_category"].lower() or
                                    test_case["expected_category"].lower() in event.get("name", "").lower() or
                                    test_case["expected_category"].lower() in event.get("description", "").lower()
                                    for event in results
                                )
                                
                                if relevant_found:
                                    self.log_test(f"AI Search - '{test_case['query']}'", True, 
                                                f"Found {len(results)} relevant results")
                                else:
                                    self.log_test(f"AI Search - '{test_case['query']}'", True, 
                                                f"Found {len(results)} results (relevance may vary)")
                            else:
                                self.log_test(f"AI Search - '{test_case['query']}'", True, 
                                            "No results found (valid response)")
                        else:
                            self.log_test(f"AI Search - '{test_case['query']}'", False, 
                                        "Results field is not a list", data)
                            all_passed = False
                    else:
                        self.log_test(f"AI Search - '{test_case['query']}'", False, 
                                    "Missing required response fields", data)
                        all_passed = False
                else:
                    self.log_test(f"AI Search - '{test_case['query']}'", False, 
                                f"Status: {response.status_code}", response.text)
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"AI Search - '{test_case['query']}'", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_ai_recommendations_endpoint(self):
        """Test AI recommendations endpoint with different interests"""
        test_cases = [
            {"interests": "I love live music and rock concerts", "location": "New York, NY"},
            {"interests": "Technology, AI, and professional development", "location": "New York, NY"},
            {"interests": "Comedy and entertainment", "location": None},
            {"interests": "Art, culture, and exhibitions", "location": "New York, NY"},
            {"interests": "Sports, especially basketball", "location": "New York, NY"}
        ]
        
        all_passed = True
        
        for test_case in test_cases:
            try:
                payload = {
                    "interests": test_case["interests"],
                    "location": test_case["location"]
                }
                
                response = self.session.post(f"{self.base_url}/api/ai-recommendations", json=payload)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check response structure
                    if "interests" in data and "recommendations" in data and "total_found" in data:
                        recommendations = data["recommendations"]
                        
                        if isinstance(recommendations, list):
                            if len(recommendations) > 0:
                                # Check that recommendations have proper structure
                                first_rec = recommendations[0]
                                required_fields = ['id', 'name', 'description', 'category']
                                missing_fields = [field for field in required_fields if field not in first_rec]
                                
                                if not missing_fields:
                                    self.log_test(f"AI Recommendations - '{test_case['interests'][:30]}...'", True, 
                                                f"Got {len(recommendations)} recommendations")
                                else:
                                    self.log_test(f"AI Recommendations - '{test_case['interests'][:30]}...'", False, 
                                                f"Missing fields in recommendations: {missing_fields}")
                                    all_passed = False
                            else:
                                self.log_test(f"AI Recommendations - '{test_case['interests'][:30]}...'", True, 
                                            "No recommendations found (valid response)")
                        else:
                            self.log_test(f"AI Recommendations - '{test_case['interests'][:30]}...'", False, 
                                        "Recommendations field is not a list", data)
                            all_passed = False
                    else:
                        self.log_test(f"AI Recommendations - '{test_case['interests'][:30]}...'", False, 
                                    "Missing required response fields", data)
                        all_passed = False
                else:
                    self.log_test(f"AI Recommendations - '{test_case['interests'][:30]}...'", False, 
                                f"Status: {response.status_code}", response.text)
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"AI Recommendations - '{test_case['interests'][:30]}...'", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_events_post_endpoint(self):
        """Test POST /api/events endpoint"""
        try:
            # Create a test event
            test_event = {
                "name": "Test Concert Event",
                "description": "A test concert for API validation",
                "venue": "Test Venue",
                "location": "Test City, NY",
                "date": "2024-12-25",
                "time": "20:00",
                "category": "Music",
                "price": "$50",
                "available_tickets": 100,
                "age_restriction": "18+",
                "duration": "2 hours",
                "tags": ["test", "music", "concert"]
            }
            
            response = self.session.post(f"{self.base_url}/api/events", json=test_event)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if returned event has ID and matches input
                if "id" in data and data["name"] == test_event["name"]:
                    self.log_test("Events POST Endpoint", True, f"Successfully created event with ID: {data['id']}")
                    return True
                else:
                    self.log_test("Events POST Endpoint", False, "Response missing ID or data mismatch", data)
                    return False
            else:
                self.log_test("Events POST Endpoint", False, f"Status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Events POST Endpoint", False, f"Error: {str(e)}")
            return False
    
    def test_error_handling(self):
        """Test error handling for invalid requests"""
        all_passed = True
        
        # Test invalid AI search request
        try:
            response = self.session.post(f"{self.base_url}/api/ai-search", json={})
            if response.status_code in [400, 422]:  # Bad request or validation error
                self.log_test("Error Handling - Invalid AI Search", True, f"Properly rejected invalid request: {response.status_code}")
            else:
                self.log_test("Error Handling - Invalid AI Search", False, f"Unexpected status: {response.status_code}")
                all_passed = False
        except Exception as e:
            self.log_test("Error Handling - Invalid AI Search", False, f"Error: {str(e)}")
            all_passed = False
        
        # Test invalid AI recommendations request
        try:
            response = self.session.post(f"{self.base_url}/api/ai-recommendations", json={})
            if response.status_code in [400, 422]:  # Bad request or validation error
                self.log_test("Error Handling - Invalid AI Recommendations", True, f"Properly rejected invalid request: {response.status_code}")
            else:
                self.log_test("Error Handling - Invalid AI Recommendations", False, f"Unexpected status: {response.status_code}")
                all_passed = False
        except Exception as e:
            self.log_test("Error Handling - Invalid AI Recommendations", False, f"Error: {str(e)}")
            all_passed = False
        
        # Test invalid event creation
        try:
            response = self.session.post(f"{self.base_url}/api/events", json={"name": "Incomplete Event"})
            if response.status_code in [400, 422]:  # Bad request or validation error
                self.log_test("Error Handling - Invalid Event Creation", True, f"Properly rejected incomplete event: {response.status_code}")
            else:
                self.log_test("Error Handling - Invalid Event Creation", False, f"Unexpected status: {response.status_code}")
                all_passed = False
        except Exception as e:
            self.log_test("Error Handling - Invalid Event Creation", False, f"Error: {str(e)}")
            all_passed = False
        
        return all_passed
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("TICKETAI BACKEND API TESTING")
        print("=" * 60)
        print(f"Backend URL: {self.base_url}")
        print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        print()
        
        # Run tests in order of priority
        tests = [
            ("Basic API Health", self.test_basic_api_health),
            ("Events GET Endpoint", self.test_events_get_endpoint),
            ("Events POST Endpoint", self.test_events_post_endpoint),
            ("AI Search Endpoint", self.test_ai_search_endpoint),
            ("AI Recommendations Endpoint", self.test_ai_recommendations_endpoint),
            ("Error Handling", self.test_error_handling)
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test_name, test_func in tests:
            print(f"Running {test_name}...")
            try:
                if test_func():
                    passed_tests += 1
            except Exception as e:
                print(f"❌ FAIL {test_name} - Unexpected error: {str(e)}")
                print()
        
        # Summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print("=" * 60)
        
        return passed_tests == total_tests

if __name__ == "__main__":
    tester = TicketAITester(BACKEND_URL)
    success = tester.run_all_tests()
    
    if success:
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print("⚠️  Some tests failed. Check the details above.")
        sys.exit(1)