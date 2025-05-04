
// This file contains environment variables needed for the application

// Set Mapbox token for maps - using a default token that can be overridden by local storage or env var
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || localStorage.getItem('MAPBOX_TOKEN') || '';

// Set API URL for backend
export const API_URL = import.meta.env.VITE_API_URL || 'https://api.example.com';

// Add support for development mode
export const IS_DEV = import.meta.env.DEV || false;

// Add timeout settings
export const MAP_TIMEOUT = 30000; // 30 seconds timeout for map operations
