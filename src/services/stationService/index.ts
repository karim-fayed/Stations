
// This file re-exports all station services for backward compatibility
import { 
  fetchStations, 
  fetchStationsByRegion, 
  fetchStation, 
  fetchCities, 
  fetchStationsByCity,
  addStation,
  updateStation,
  deleteStation
} from './stationManagement';

import {
  checkDuplicateStation,
  checkDuplicateStationsInList,
  deleteDuplicateStations
} from './duplicateDetection';

import {
  fetchNearestStations,
  calculateDistance,
  toRadians
} from './geolocation';

import {
  sendMagicLink,
  adminLogout,
  checkAdminStatus
} from './authentication';

export {
  // Station management
  fetchStations,
  fetchStationsByRegion,
  fetchStation,
  fetchCities,
  fetchStationsByCity,
  addStation,
  updateStation,
  deleteStation,
  
  // Duplicate detection
  checkDuplicateStation,
  checkDuplicateStationsInList,
  deleteDuplicateStations,
  
  // Geolocation
  fetchNearestStations,
  calculateDistance,
  toRadians,
  
  // Authentication
  sendMagicLink,
  adminLogout,
  checkAdminStatus
};
