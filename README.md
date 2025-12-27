# Marmaid.com — On-Demand Escort Experience (ODE)

A Progressive Web App (PWA) for on-demand escort booking, modelled 1:1 on Uber's mobile web experience. This platform connects clients with escorts in real-time using a subscription-controlled visibility system.

## 🎯 Core Concept

Uber-like escort hailing with a focus on discretion, real-time availability, and subscription-driven economics. Clients browse instantly without login; escorts control their visibility and client reach through tiered subscriptions.

## 🧱 Project Structure

mermaid.com/
├── frontend/ # PWA (Section A) - Uber-style mobile web
├── backend/ # API server (Section B) - RESTful, stateless
├── README.md
└── .gitignore


## 📱 Frontend (Section A)

**Technology:** Pure PWA (HTML, CSS, JS) • OpenStreetMap (Leaflet) • Service Workers

**Key Pages:**
- **Home (`/`)** – Location capture & service intent (Uber's `go/home`)
- **Escort Selection (`/selection`)** – Live map + escort cards (Uber's `go/product-selection`)
- **Category Pages** – Straight, Shemale, Gay/Lesbian, Massage Parlours
- **Dashboards** – Client (no login), Escort, Admin

**Critical Frontend Logic:**
- Real-time escort map pins (photo-based)
- Subscription-tiered visibility (Basic → Gold → Premium → Full)
- No client authentication required
- Monthly subscription expiry (28th of each month)
- Uber-style ranking & filter system

## 🔧 Backend (Section B)

**Technology:** Node.js • JWT • PostgreSQL-ready • REST API

**Core Modules:**
- **API Server** – Routing, authentication, rate limiting
- **Domain Logic** – Escort visibility, booking, subscription policies
- **Data Models** – Escort, Client, Booking, Subscription, Review
- **Background Jobs** – Subscription expiry, visibility resets

**Key Backend Rules:**
- Escort visibility controlled by active subscription tier
- All subscriptions expire on the 28th of each month
- Minimum service price enforcement (KES 250)
- Distance-based escort ranking
- Client request board (Gold+ tiers only)

## 🗺️ Mapping & Location

- **Primary Map:** OpenStreetMap (Leaflet.js)
- **Geolocation:** Browser Geolocation API
- **Backend:** Stores coordinates, performs distance calculations, returns sorted results

## 🔐 Security & Privacy

- HTTPS only
- JWT for escort authentication
- Client anonymity (no login required)
- Secure in-app messaging
- End-to-end encrypted data where applicable
- Rate limiting per IP

## 📊 Subscription Tiers

| Tier | Price/Month | Visibility | Client Board | Map Priority |
|------|-------------|------------|--------------|--------------|
| Basic | KES 150 | Basic category only | ❌ | Low |
| Gold | KES 250 | Gold category | ✅ | Medium |
| Premium | KES 450 | Premium category + homepage | ✅ | High |
| Full Visibility | KES 750 | All categories | ✅ | Maximum |

## 🚀 Deployment

**Frontend:**
- Static hosting (GitHub Pages, Netlify, Vercel)
- PWA-ready with service worker
- OpenStreetMap tile compatibility

**Backend:**
- Node.js environment (Railway, Render, Fly.io, VPS)
- PostgreSQL database
- Environment variables for configuration

## 🔌 API Contract

Frontend consumes REST endpoints at `/api/v1/`:
- `GET /api/v1/escorts/nearby` – Returns escorts by location & tier
- `POST /api/v1/bookings` – Create booking
- `GET /api/v1/subscriptions/tiers` – Subscription info
- `POST /api/v1/auth/escort` – Escort login

## 📈 Business Logic Highlights

1. **Uber-Style Ranking:** Escorts sorted by subscription tier, then distance
2. **Monthly Reset:** All subscriptions expire on the 28th
3. **Client Empowerment:** No login required, direct contact via call/message
4. **Escort Control:** Visibility directly tied to subscription investment
5. **Platform Safety:** Verified escorts only, admin moderation

## 🛠 Development Setup

1. **Frontend:** Serve `frontend/` via any static server
2. **Backend:** Configure environment variables, run `node server.js`
3. **Database:** Set up PostgreSQL with provided schema
4. **Map Tiles:** Uses OpenStreetMap (no API key required)

## ⚠️ Important Notes

- This is a commercial escort hailing platform
- Legal compliance is required in your jurisdiction
- Age verification must be implemented
- Data protection regulations apply
- Use responsibly and ethically

---

**Built with:** OpenStreetMap • PWA • Node.js • Subscription Economics
**Model:** Uber-style on-demand service with tiered visibility
**Goal:** Discreet, efficient, and professional escort-client connections