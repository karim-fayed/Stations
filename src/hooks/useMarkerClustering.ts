import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Supercluster from 'supercluster';
import { GasStation } from '@/types/station';
import { createMarkerElement } from '@/components/map/utils/markerUtils';

interface ClusterMarker {
  marker: mapboxgl.Marker;
  id: number;
  isCluster: boolean;
  count?: number;
  stationId?: string;
}

interface UseMarkerClusteringProps {
  map: mapboxgl.Map | null;
  stations: GasStation[];
  selectedStation: GasStation | null;
  onSelectStation: (station: GasStation | null) => void;
  language: 'ar' | 'en';
}

export const useMarkerClustering = ({
  map,
  stations,
  selectedStation,
  onSelectStation,
  language
}: UseMarkerClusteringProps) => {
  const [visibleMarkers, setVisibleMarkers] = useState<ClusterMarker[]>([]);
  const superclusterRef = useRef<Supercluster | null>(null);
  const markersRef = useRef<ClusterMarker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize supercluster
  useEffect(() => {
    if (!stations.length) return;

    // Create a new supercluster instance
    superclusterRef.current = new Supercluster({
      radius: 60, // Clustering radius in pixels
      maxZoom: 16, // Maximum zoom level to cluster points
      minPoints: 3, // Minimum points to form a cluster
    });

    // Add points to the cluster
    const points = stations.map(station => ({
      type: 'Feature' as const,
      properties: {
        id: station.id,
        name: station.name,
        cluster: false,
        stationId: station.id,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [station.longitude, station.latitude]
      }
    }));

    // Load points into supercluster
    superclusterRef.current.load(points);
  }, [stations]);

  // Check if map is loaded
  useEffect(() => {
    if (!map) return;

    if (map.loaded()) {
      setMapLoaded(true);
    } else {
      const onLoadHandler = () => {
        console.log("Map loaded in MarkerClustering");
        setMapLoaded(true);
      };

      map.on('load', onLoadHandler);
      return () => {
        map.off('load', onLoadHandler);
      };
    }
  }, [map]);

  // Update markers when map moves or zoom changes
  useEffect(() => {
    if (!map || !mapLoaded || !superclusterRef.current) return;

    const updateMarkers = () => {
      if (!map || !superclusterRef.current) return;

      // Get current map bounds
      const bounds = map.getBounds();
      const bbox: [number, number, number, number] = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth()
      ];

      // Get current zoom level
      const zoom = Math.floor(map.getZoom());

      // Get clusters for current view
      const clusters = superclusterRef.current.getClusters(bbox, zoom);

      // Remove existing markers
      markersRef.current.forEach(marker => {
        marker.marker.remove();
      });
      markersRef.current = [];

      // Create new markers
      clusters.forEach(cluster => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const { cluster: isCluster, point_count: count, stationId } = cluster.properties;

        // Create marker element
        let el;
        if (isCluster) {
          // Create cluster marker
          el = document.createElement('div');
          el.className = 'cluster-marker';
          el.style.width = `${Math.min(count! * 5 + 30, 60)}px`;
          el.style.height = `${Math.min(count! * 5 + 30, 60)}px`;
          el.style.borderRadius = '50%';
          el.style.backgroundColor = '#7c3aed'; // Purple color
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.color = 'white';
          el.style.fontWeight = 'bold';
          el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
          el.textContent = count!.toString();

          // Add click event to zoom in on cluster
          el.addEventListener('click', () => {
            const expansionZoom = Math.min(
              superclusterRef.current!.getClusterExpansionZoom(cluster.id as number),
              20
            );
            map.flyTo({
              center: [longitude, latitude],
              zoom: expansionZoom,
              speed: 1.5,
              essential: true
            });
          });
        } else {
          // Find the station for this marker
          const station = stations.find(s => s.id === stationId);
          if (!station) return;

          // Create regular marker
          el = createMarkerElement(station, selectedStation?.id || null);

          // Add click event to select station
          el.addEventListener('click', () => {
            onSelectStation(station);
          });
        }

        // Create and add marker to map
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(map);

        // Store marker reference
        markersRef.current.push({
          marker,
          id: cluster.id as number,
          isCluster: !!isCluster,
          count: count,
          stationId: stationId as string
        });
      });

      // Update visible markers state
      setVisibleMarkers(markersRef.current);
    };

    // Update markers initially
    updateMarkers();

    // Update markers when map moves
    map.on('moveend', updateMarkers);
    map.on('zoomend', updateMarkers);

    return () => {
      map.off('moveend', updateMarkers);
      map.off('zoomend', updateMarkers);
    };
  }, [map, mapLoaded, stations, selectedStation, onSelectStation, language]);

  // Highlight selected station marker
  useEffect(() => {
    if (!selectedStation || !markersRef.current.length) return;

    // Find the marker for the selected station
    const selectedMarker = markersRef.current.find(
      marker => !marker.isCluster && marker.stationId === selectedStation.id
    );

    if (selectedMarker) {
      // Fly to the selected marker
      map?.flyTo({
        center: selectedMarker.marker.getLngLat(),
        zoom: 14,
        essential: true
      });

      // Update marker appearance
      const markerElement = selectedMarker.marker.getElement();
      markerElement.className = 'marker-pin selected';
      markerElement.style.animation = 'bounce 1s infinite alternate';
      markerElement.style.zIndex = '2';
    }
  }, [selectedStation, map]);

  return { visibleMarkers };
};
