import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import GlobalComponents from "./components/GlobalComponents";

// Pages
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
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
import PromoterLogin from "./pages/PromoterLogin";
import PromoterDashboard from "./pages/PromoterDashboard";
import MyTickets from "./pages/MyTickets";
import Merchandise from "./pages/Merchandise";
import DonationSuccess from "./pages/DonationSuccess";
import LiveStreaming from "./pages/LiveStreaming";
import StreamSuccess from "./pages/StreamSuccess";

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
          <Route path="/promoter-login" element={<PromoterLogin />} />
          <Route path="/promoter-dashboard" element={<PromoterDashboard />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/merchandise" element={<Merchandise />} />
          <Route path="/donation/success" element={<DonationSuccess />} />
          <Route path="/live-streaming" element={<LiveStreaming />} />
          <Route path="/stream/success" element={<StreamSuccess />} />
        </Routes>
        <Toaster />
        <GlobalComponents />
      </Router>
    </div>
  );
}

export default App;