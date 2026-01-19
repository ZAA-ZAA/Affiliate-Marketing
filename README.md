# OJT - Affiliate Marketing System

A full-stack affiliate marketing management system with a separate demo form application. Built with React + Vite (frontend), Python Flask (backend), and MySQL database.

## Projects in This Repository

| Project | Description | Port |
|---------|-------------|------|
| `affiliate-management-main/` | Admin dashboard & affiliate management system | 8080 |
| `demo-form-app/` | Customer-facing demo request form (separate app) | 3001 |

## Features

### Affiliate Management System
- **Admin Dashboard**: Manage affiliate partners, generate links, track performance
- **Partner Management**: Approve/reject affiliate signups, set commission rates
- **Link Generation**: Create trackable affiliate links with unique codes
- **Click Tracking**: Automatically track clicks with referrer source (Facebook, TikTok, YouTube, etc.)
- **Conversion Tracking**: Track form submissions and capture all form data
- **Detailed Analytics**: View click sources and conversion details in dashboard

### Demo Form App
- **Lead Capture Form**: Customer-facing form for demo requests
- **Affiliate Tracking**: Automatically captures affiliate ID from URL
- **Referrer Tracking**: Records where user came from (Facebook, TikTok, etc.)
- **API Integration**: Sends data to affiliate management system via secure API

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS
- **Backend**: Python Flask + MySQL
- **Database**: MySQL 8.0
- **Containerization**: Docker & Docker Compose

## Quick Start with Docker

Run everything from this folder:

```bash
docker-compose up --build
```

This starts:
| Service | URL | Description |
|---------|-----|-------------|
| MySQL Database | localhost:3307 | Database server |
| Flask Backend | http://localhost:5000 | API server |
| React Frontend | http://localhost:8080 | Admin dashboard |
| Demo Form App | http://localhost:3001 | Customer form |

### Initial Setup

1. Visit http://localhost:8080/setup
2. Create your admin account
3. Login at http://localhost:8080/login
4. Start managing affiliates!

### Testing the Flow

1. **Create an affiliate link** in the admin dashboard
2. **Copy the generated link** (includes `?affiliate-id=XXXXX`)
3. **Open the link** - it goes to http://localhost:3001 (demo form)
4. **Fill out and submit** the form
5. **Check the dashboard** - click count and conversion should increase!

## Project Structure

```
OJT/
├── docker-compose.yml              # Master Docker config (run from here)
├── .gitignore
├── README.md                       # This file
│
├── affiliate-management-main/      # Affiliate Management System
│   ├── backend/                    # Python Flask API
│   │   ├── app.py                 # Main Flask application
│   │   ├── config.py              # Database configuration
│   │   ├── database.py            # Database utilities
│   │   └── routes/                # API route handlers
│   │       ├── auth.py            # Authentication (login, signup)
│   │       ├── partners.py        # Partner management
│   │       ├── links.py           # Link generation
│   │       ├── tracking.py        # Click tracking
│   │       ├── demo.py            # Demo form submission
│   │       └── external.py        # External API (for demo-form-app)
│   │
│   ├── client/                     # React Frontend
│   │   ├── pages/                 # Page components
│   │   │   ├── Dashboard.tsx      # Admin dashboard
│   │   │   ├── PartnerDetail.tsx  # Partner details & link generation
│   │   │   ├── AffiliateSignup.tsx # Affiliate registration
│   │   │   └── ...
│   │   ├── components/ui/         # UI components (shadcn/ui)
│   │   └── types/api.ts           # TypeScript types
│   │
│   ├── docker-init.sql            # Database schema
│   ├── Dockerfile.backend         # Backend Docker image
│   ├── Dockerfile.frontend        # Frontend Docker image
│   └── requirements.txt           # Python dependencies
│
└── demo-form-app/                  # Demo Form App (separate project)
    ├── src/
    │   ├── App.tsx                # Main form component
    │   └── config.ts              # API configuration & key
    ├── Dockerfile.dev             # Docker image
    └── package.json
```

## How the Two Projects Communicate

### API Key Authentication

1. **API Key Location**: `affiliate-management-main/docker-init.sql` (stored in database)
2. **Default Key**: `aff_live_key_2026_xK9mP2vL8nQ4wR7j`
3. **Used in**: `demo-form-app/src/config.ts`

### Communication Flow

```
User clicks affiliate link
         ↓
Demo Form App (port 3001)
         ↓
Extracts affiliate-id from URL
         ↓
Sends click data to API ──→ POST /api/external/track-click
         ↓                   (with X-API-Key header)
User submits form
         ↓
Sends form data to API ──→ POST /api/external/addlead
         ↓                   (with X-API-Key header)
Affiliate Management Backend
         ↓
Saves to MySQL database
         ↓
Dashboard shows updated stats
```

## API Endpoints

### Authentication
- `POST /api/auth/setup-admin` - Create admin account (first time only)
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/affiliate-signup` - Affiliate signup
- `POST /api/auth/affiliate-login` - Affiliate login

### Partners
- `GET /api/partners` - Get all partners
- `POST /api/partners` - Add/approve partner
- `PUT /api/partners/:id/status` - Update partner status

### Links
- `POST /api/links` - Create affiliate link
- `GET /api/links/:partnerId` - Get partner's links

### Analytics
- `GET /api/clicks/details` - Get click details by source
- `GET /api/conversions/details` - Get conversion details with form data

### External API (used by demo-form-app)
- `POST /api/external/track-click` - Track click (requires API key)
- `POST /api/external/addlead` - Submit lead/conversion (requires API key)

## Database Schema

| Table | Description |
|-------|-------------|
| `users` | Admin and affiliate user accounts |
| `partners` | Affiliate partner records with status |
| `affiliate_links` | Generated affiliate links |
| `link_clicks` | Click tracking with referrer domain |
| `demo_requests` | Form submissions with full form data |
| `api_keys` | API keys for external integrations |

## Docker Commands

```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up -d --build

# Stop all services
docker-compose down

# Stop and delete database data
docker-compose down -v

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
```

## Git Commands

```bash
# Check status
git status

# Add and commit changes
git add -A
git commit -m "Your message"

# Add GitHub remote (first time)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## License

Internal use only.
