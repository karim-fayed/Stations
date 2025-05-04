
// This file contains environment variables needed for the application

// Set Mapbox token for maps - using the placeholder token as a starting point if env var is not available
// You should replace this with your actual Mapbox token in the .env file (VITE_MAPBOX_TOKEN)
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Set API URL for backend
export const API_URL = import.meta.env.VITE_API_URL || 'https://api.example.com';

// Add support for development mode
export const IS_DEV = import.meta.env.DEV || false;

// Add timeout settings
export const MAP_TIMEOUT = 30000; // 30 seconds timeout for map operations
