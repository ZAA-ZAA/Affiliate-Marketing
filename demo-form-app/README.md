# Demo Form App

A separate React application for the demo request form that communicates with the Affiliate Management System via API.

## Overview

This project is a standalone demo form that:
- Captures affiliate ID from URL parameters (`?affiliate-id=XXX`)
- Tracks where users came from (referrer URL/domain)
- Sends form submissions to the Affiliate Management System
- Uses API key authentication for secure communication

## Tech Stack

- **React** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Setup

### Development

```bash
# Install dependencies
npm install

# Run development server (port 3001)
npm run dev
```

### Environment Variables

Create a `.env` file or set these environment variables:

```env
VITE_API_URL=http://localhost:5000
VITE_API_KEY=aff_live_key_2026_xK9mP2vL8nQ4wR7j
```

The API key is pre-configured for local development in `src/config.ts`.

## API Integration

This app communicates with the Affiliate Management System using two endpoints:

### 1. Track Click
```
POST /api/external/track-click
Headers: X-API-Key: <api_key>
Body: {
  affiliate_id: string,
  referrer: string,
  user_agent: string,
  page_url: string
}
```

### 2. Add Lead (Conversion)
```
POST /api/external/addlead
Headers: X-API-Key: <api_key>
Body: {
  name: string,
  email: string,
  company?: string,
  phone?: string,
  message?: string,
  affiliate_id?: string,
  referrer?: string,
  source_url?: string
}
```

## Testing

1. Start the Affiliate Management backend on port 5000
2. Start this app on port 3001
3. Visit: `http://localhost:3001/?affiliate-id=YOUR_AFFILIATE_CODE`

The form will:
- Track the click when the page loads
- Capture the referrer (where the user came from)
- Submit form data as a conversion when the form is submitted

## Docker

### Build and Run
```bash
docker build -t demo-form-app .
docker run -p 3001:3001 demo-form-app
```

### With Docker Compose (from parent OJT folder)
```bash
cd ..
docker-compose up
```

This will start:
- MySQL database
- Affiliate Management Backend (port 5000)
- Affiliate Management Frontend (port 5173)
- Demo Form App (port 3001)

## Project Structure

```
demo-form-app/
├── src/
│   ├── App.tsx          # Main form component
│   ├── config.ts        # API configuration
│   ├── index.css        # Tailwind styles
│   └── main.tsx         # React entry point
├── Dockerfile           # Production build
├── Dockerfile.dev       # Development build
├── nginx.conf           # Nginx config for production
├── docker-compose.yml   # Standalone docker compose
└── vite.config.ts       # Vite configuration
```

## How It Works

1. **URL Parameter Detection**: When a user visits with `?affiliate-id=XXX`, the app extracts this ID
2. **Click Tracking**: Automatically sends a click event with referrer info to the API
3. **Form Submission**: When submitted, sends all form data + affiliate ID + referrer to create a conversion
4. **Referrer Tracking**: Captures `document.referrer` to know where users came from (Facebook, TikTok, etc.)

## Referrer Sources

The app tracks where users came from before clicking the affiliate link:
- Facebook
- TikTok
- YouTube
- Instagram
- Twitter/X
- LinkedIn
- Direct (no referrer)
- Other websites

This data is visible in the Affiliate Management dashboard under "Total Clicks" and "Conversions" details.
