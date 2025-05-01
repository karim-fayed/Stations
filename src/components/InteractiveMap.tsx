
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GasStation } from "@/types/station";
import { Button } from "@/components/ui/button";
import { fetchNearestStations } from "@/services/stationService";
import { useToast } from "@/hooks/use-toast";
import { GOOGLE_MAPS_API_KEY } from "@/utils/environment";

// Google Maps integration
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface InteractiveMapProps {
  selectedStation: GasStation | null;
  onSelectStation: (station: GasStation) => void;
  language: 'ar' | 'en';
  stations: GasStation[];
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  selectedStation,
  onSelectStation,
  language,
  stations
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyStations, setNearbyStations] = useState<GasStation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadGoogleMapsScript = () => {
    if (!document.querySelector('#google-maps-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap&libraries=places&language=${language === 'ar' ? 'ar' : 'en'}`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        setMapLoaded(true);
      };
      
      document.head.appendChild(script);
    }
  };

  // Load Google Maps script
  useEffect(() => {
    loadGoogleMapsScript();
    return () => {
      window.initMap = () => {};
    };
  }, [language]);

  // Initialize map when script is loaded
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      // Default location (Saudi Arabia center)
      const defaultLocation = { lat: 23.885942, lng: 45.079162 };
      
      // Create the map
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 6,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
          { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
          {
            featureType: "administrative.land_parcel",
            elementType: "labels.text.fill",
            stylers: [{ color: "#bdbdbd" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }],
          },
          {
            featureType: "road.arterial",
            elementType: "labels.text.fill",
            stylers: [{ color: "#757575" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#dadada" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#616161" }],
          },
          {
            featureType: "road.local",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9e9e9e" }],
          },
          {
            featureType: "transit.line",
            elementType: "geometry",
            stylers: [{ color: "#e5e5e5" }],
          },
          {
            featureType: "transit.station",
            elementType: "geometry",
            stylers: [{ color: "#eeeeee" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#c9c9c9" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9e9e9e" }],
          },
        ],
      });

      // Try to get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLoc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(userLoc);
            
            // Center the map on user location
            googleMapRef.current.setCenter(userLoc);
            googleMapRef.current.setZoom(10);
            
            // Add user marker
            new window.google.maps.Marker({
              position: userLoc,
              map: googleMapRef.current,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#4285F4",
                fillOpacity: 0.8,
                strokeWeight: 2,
                strokeColor: "#FFFFFF",
              },
              title: language === 'ar' ? "موقعك الحالي" : "Your location",
            });
            
            // Get nearby stations
            loadNearbyStations(userLoc.lat, userLoc.lng);
          },
          (error) => {
            console.error("Error getting location:", error);
            // If we can't get user location, use the stations we already have
            addStationsToMap(stations);
          }
        );
      } else {
        // If geolocation is not supported, use the stations we already have
        addStationsToMap(stations);
      }
    }
  }, [mapLoaded]);

  // Focus on selected station when it changes
  useEffect(() => {
    if (mapLoaded && googleMapRef.current && selectedStation) {
      const stationLocation = {
        lat: selectedStation.latitude,
        lng: selectedStation.longitude,
      };
      
      googleMapRef.current.panTo(stationLocation);
      googleMapRef.current.setZoom(14);
      
      // Find the marker for this station and animate it
      const marker = markersRef.current.find(
        (m) => m.stationId === selectedStation.id
      );
      
      if (marker) {
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        
        // Stop the animation after a short time
        setTimeout(() => {
          marker.setAnimation(null);
        }, 2000);
      }
    }
  }, [selectedStation]);

  // Load nearby stations when user location changes
  const loadNearbyStations = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const nearby = await fetchNearestStations(lat, lng, 20);
      setNearbyStations(nearby);
      addStationsToMap(nearby);
    } catch (error) {
      console.error("Error fetching nearby stations:", error);
      toast({
        title: language === 'ar' ? "خطأ في تحميل المحطات القريبة" : "Error loading nearby stations",
        description: language === 'ar' ? "تعذر الحصول على المحطات القريبة" : "Could not get nearby stations",
        variant: "destructive",
      });
      // Fallback to using all stations
      addStationsToMap(stations);
    } finally {
      setIsLoading(false);
    }
  };

  // Add stations to map
  const addStationsToMap = (stationsToAdd: GasStation[]) => {
    if (!mapLoaded || !googleMapRef.current) return;
    
    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    
    stationsToAdd.forEach((station) => {
      const marker = new window.google.maps.Marker({
        position: { lat: station.latitude, lng: station.longitude },
        map: googleMapRef.current,
        title: station.name,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/gas.png",
          scaledSize: new window.google.maps.Size(32, 32),
        },
        animation: window.google.maps.Animation.DROP,
        stationId: station.id,
      });
      
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2 text-center" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
            <h3 class="font-bold text-noor-purple">${station.name}</h3>
            <p>${station.region} - ${station.sub_region}</p>
            ${station.fuel_types ? `<p>${language === 'ar' ? 'أنواع الوقود' : 'Fuel types'}: ${station.fuel_types}</p>` : ''}
            ${station.distance_meters ? 
              `<p>${language === 'ar' ? 'المسافة' : 'Distance'}: ${
                station.distance_meters > 1000 
                  ? `${(station.distance_meters/1000).toFixed(2)} ${language === 'ar' ? 'كم' : 'km'}`
                  : `${Math.round(station.distance_meters)} ${language === 'ar' ? 'متر' : 'm'}`
              }</p>` 
              : ''}
            <button 
              id="view-station-${station.id}"
              class="mt-2 px-3 py-1 bg-noor-purple text-white rounded"
            >
              ${language === 'ar' ? 'اختيار المحطة' : 'Select station'}
            </button>
          </div>
        `,
      });
      
      marker.addListener("click", () => {
        // Close any open info windows
        window.google.maps.event.trigger(googleMapRef.current, 'closeInfoWindows');
        
        // Open this info window
        infoWindow.open({
          anchor: marker,
          map: googleMapRef.current,
          shouldFocus: false,
        });
        
        // Select this station
        onSelectStation(station);
      });
      
      // Add listener for the "View station" button in info window
      window.google.maps.event.addListener(infoWindow, 'domready', () => {
        document.getElementById(`view-station-${station.id}`)?.addEventListener('click', () => {
          onSelectStation(station);
          infoWindow.close();
        });
      });
      
      // Custom event to close all info windows
      window.google.maps.event.addListener(googleMapRef.current, 'closeInfoWindows', () => {
        infoWindow.close();
      });
      
      markersRef.current.push(marker);
    });
    
    // If we have stations but no selected one, zoom to fit all stations
    if (stationsToAdd.length > 0 && !selectedStation && googleMapRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      stationsToAdd.forEach((station) => {
        bounds.extend({ lat: station.latitude, lng: station.longitude });
      });
      googleMapRef.current.fitBounds(bounds);
      
      // Don't zoom in too far
      if (googleMapRef.current.getZoom() > 12) {
        googleMapRef.current.setZoom(12);
      }
    }
  };

  // Find user's location
  const handleFindMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userLoc);
          
          if (googleMapRef.current) {
            googleMapRef.current.setCenter(userLoc);
            googleMapRef.current.setZoom(12);
            loadNearbyStations(userLoc.lat, userLoc.lng);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: language === 'ar' ? "خطأ في تحديد الموقع" : "Location error",
            description: language === 'ar' ? "تعذر الوصول إلى موقعك. يرجى التأكد من تفعيل خدمات الموقع" : "Could not access your location. Please make sure location services are enabled",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: language === 'ar' ? "خدمة غير مدعومة" : "Service not supported",
        description: language === 'ar' ? "متصفحك لا يدعم خدمات تحديد الموقع" : "Your browser does not support geolocation services",
        variant: "destructive",
      });
    }
  };

  const handleSearchClick = () => {
    if (googleMapRef.current && window.google?.maps) {
      const searchBox = new window.google.maps.places.SearchBox(
        document.getElementById("map-search-input") as HTMLInputElement
      );
      
      searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;
        
        const place = places[0];
        if (!place.geometry || !place.geometry.location) return;
        
        // Center map on search result
        googleMapRef.current.setCenter(place.geometry.location);
        googleMapRef.current.setZoom(13);
        
        // Load nearby stations for this location
        const loc = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        loadNearbyStations(loc.lat, loc.lng);
        
        // Add a marker for the search result
        new window.google.maps.Marker({
          position: place.geometry.location,
          map: googleMapRef.current,
          title: place.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#FF5722",
            fillOpacity: 0.8,
            strokeWeight: 2,
            strokeColor: "#FFFFFF",
          },
        });
      });
    }
  };

  return (
    <div className={`w-full h-[600px] relative rounded-lg shadow-lg overflow-hidden ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="absolute top-2 left-2 right-2 z-10 flex gap-2 bg-white p-2 rounded-md shadow-md">
        <input
          id="map-search-input"
          type="text"
          placeholder={language === 'ar' ? "ابحث عن موقع..." : "Search for a location..."}
          className="flex-grow p-2 border rounded-md"
        />
        <Button 
          onClick={handleSearchClick}
          className="bg-noor-purple hover:bg-noor-purple/90"
        >
          {language === 'ar' ? 'بحث' : 'Search'}
        </Button>
        <Button 
          variant="outline"
          onClick={handleFindMyLocation}
          className="whitespace-nowrap"
        >
          {language === 'ar' ? 'موقعي الحالي' : 'My Location'}
        </Button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-noor-purple mx-auto"></div>
            <p className="mt-2 text-center">
              {language === 'ar' ? 'جاري تحميل المحطات القريبة...' : 'Loading nearby stations...'}
            </p>
          </div>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-4 left-4 right-4 flex justify-center"
      >
        <div className="bg-white rounded-full px-4 py-2 shadow-lg text-sm text-center">
          {selectedStation ? (
            <span>
              {language === 'ar' ? 'المحطة المختارة:' : 'Selected station:'} <strong className="text-noor-purple">{selectedStation.name}</strong>
            </span>
          ) : (
            <span>
              {language === 'ar' 
                ? 'انقر على محطة لاختيارها أو اكتشف المحطات القريبة' 
                : 'Click on a station to select it or discover nearby stations'}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default InteractiveMap;
