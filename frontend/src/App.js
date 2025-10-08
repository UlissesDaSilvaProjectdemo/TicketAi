import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";

// Pages
import LandingPage from "./pages/LandingPage";
import NewPricingPage from "./pages/NewPricingPage";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage"; 
import EventFeed from "./pages/EventFeed";
import EventDetails from "./pages/EventDetails";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import DashboardFan from "./pages/DashboardFan";
import DashboardInvestor from "./pages/DashboardInvestor";
import Marketplace from "./pages/Marketplace";
import SellTicket from "./pages/SellTicket";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/events" element={<EventFeed />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/sell-ticket" element={<SellTicket />} />
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