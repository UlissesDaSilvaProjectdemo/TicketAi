// Mock data for TicketAI app
export const mockEvents = [
  {
    id: 1,
    name: "Drake - One Dance World Tour",
    artist: "Drake",
    date: "2025-11-15",
    time: "20:00",
    location: "Madison Square Garden, NYC",
    venue: "Madison Square Garden",
    city: "New York",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    isHot: true,
    basePrice: 150,
    currentPrice: 180,
    priceChange: 20,
    priceChangePercent: "+13.3%",
    availableTickets: 45,
    totalTickets: 2000,
    aiConfidence: 92,
    tags: ["Hip-Hop", "Trending", "Sold Out Soon"],
    description: "Experience Drake live in his most anticipated world tour. Premium sound and lighting production.",
    ticketTypes: [
      { type: "General Admission", price: 180, available: 20 },
      { type: "VIP", price: 350, available: 8 },
      { type: "Premium", price: 280, available: 17 }
    ]
  },
  {
    id: 2,
    name: "Hamilton - Broadway Musical",
    artist: "Original Broadway Cast",
    date: "2025-12-03",
    time: "19:30",
    location: "Richard Rodgers Theatre, NYC",
    venue: "Richard Rodgers Theatre",
    city: "New York",
    image: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800&h=600&fit=crop",
    isHot: false,
    basePrice: 200,
    currentPrice: 195,
    priceChange: -5,
    priceChangePercent: "-2.5%",
    availableTickets: 120,
    totalTickets: 1400,
    aiConfidence: 78,
    tags: ["Musical", "Broadway", "Classic"],
    description: "The revolutionary musical about Alexander Hamilton and the founding of America.",
    ticketTypes: [
      { type: "Orchestra", price: 195, available: 40 },
      { type: "Mezzanine", price: 145, available: 50 },
      { type: "Balcony", price: 95, available: 30 }
    ]
  },
  {
    id: 3,
    name: "Taylor Swift - Eras Tour",
    artist: "Taylor Swift",
    date: "2025-10-28",
    time: "19:00",
    location: "SoFi Stadium, Los Angeles",
    venue: "SoFi Stadium",
    city: "Los Angeles",
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop",
    isHot: true,
    basePrice: 120,
    currentPrice: 245,
    priceChange: 125,
    priceChangePercent: "+104.2%",
    availableTickets: 12,
    totalTickets: 50000,
    aiConfidence: 98,
    tags: ["Pop", "Stadium", "High Demand"],
    description: "The most anticipated concert of the year. A journey through all of Taylor's musical eras.",
    ticketTypes: [
      { type: "Floor", price: 245, available: 5 },
      { type: "Lower Bowl", price: 180, available: 4 },
      { type: "Upper Bowl", price: 120, available: 3 }
    ]
  },
  {
    id: 4,
    name: "The Weeknd - After Hours Tour",
    artist: "The Weeknd",
    date: "2025-11-22",
    time: "20:30",
    location: "United Center, Chicago",
    venue: "United Center",
    city: "Chicago",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    isHot: false,
    basePrice: 85,
    currentPrice: 92,
    priceChange: 7,
    priceChangePercent: "+8.2%",
    availableTickets: 340,
    totalTickets: 20000,
    aiConfidence: 85,
    tags: ["R&B", "Arena", "Available"],
    description: "The Weeknd brings his haunting melodies and incredible stage production to Chicago.",
    ticketTypes: [
      { type: "General Admission", price: 92, available: 150 },
      { type: "Reserved Seating", price: 125, available: 120 },
      { type: "VIP Package", price: 250, available: 70 }
    ]
  }
];

export const mockUser = {
  id: 1,
  name: "Alex Johnson",
  email: "alex@example.com",
  accountType: "fan", // or "investor"
  joinDate: "2025-01-15",
  totalSpent: 1450,
  eventsAttended: 8,
  portfolio: [
    { eventId: 1, ticketType: "VIP", purchasePrice: 320, currentValue: 350, quantity: 2 },
    { eventId: 3, ticketType: "Floor", purchasePrice: 180, currentValue: 245, quantity: 1 }
  ]
};

export const mockTickets = [
  {
    id: "TKT-001-DRK",
    eventId: 1,
    eventName: "Drake - One Dance World Tour",
    date: "2025-11-15",
    time: "20:00",
    venue: "Madison Square Garden",
    section: "VIP",
    seat: "A12",
    price: 350,
    qrCode: "QR123456789",
    status: "active"
  },
  {
    id: "TKT-002-TS",
    eventId: 3,
    eventName: "Taylor Swift - Eras Tour", 
    date: "2025-10-28",
    time: "19:00",
    venue: "SoFi Stadium",
    section: "Floor",
    seat: "F145",
    price: 245,
    qrCode: "QR987654321",
    status: "active"
  }
];

export const mockNews = [
  {
    id: 1,
    title: "Taylor Swift Eras Tour Tickets Surge 100% Following Surprise Album Announcement",
    summary: "Ticket prices have doubled in the past 24 hours after Taylor Swift announced a surprise acoustic album.",
    timestamp: "2025-09-15T14:30:00Z",
    category: "trending",
    relatedEventId: 3
  },
  {
    id: 2,
    title: "Broadway Shows See Increased Demand as Tourism Returns to NYC",
    summary: "Hamilton and other Broadway shows are experiencing higher demand as international tourism rebounds.",
    timestamp: "2025-09-14T10:15:00Z",
    category: "market",
    relatedEventId: 2
  }
];