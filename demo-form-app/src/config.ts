// API Configuration
// The API URL and Key for connecting to the Affiliate Management System
export const API_CONFIG = {
  // Base URL of the Affiliate Management API (Flask backend)
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  
  // API Key for authentication (pre-configured for local development)
  API_KEY: import.meta.env.VITE_API_KEY || 'aff_live_key_2026_xK9mP2vL8nQ4wR7j',
};
