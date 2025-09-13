import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";

// Pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage"; 
import EventFeed from "./pages/EventFeed";
import EventDetails from "./pages/EventDetails";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import DashboardFan from "./pages/DashboardFan";
import DashboardInvestor from "./pages/DashboardInvestor";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/events" element={<EventFeed />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<Success />} />
          <Route path="/dashboard/fan" element={<DashboardFan />} />
          <Route path="/dashboard/investor" element={<DashboardInvestor />} />
        </Routes>
        <Toaster />
      </Router>
    </div>
  );
}

export default App;