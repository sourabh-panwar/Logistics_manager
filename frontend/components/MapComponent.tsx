'use client';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {Coordinate} from '@/lib/types';

interface MapPin {
  id: string;
  lat: number;
  lng: number;
  type: 'warehouse' | 'delivery';
  weight?: number;
}

interface RouteLine {
  id: string;
  truckId: string;
  color: string;
  coordinates: Coordinate[];
}

interface MapComponentProps {
  onWarehouseSet?: (coord: Coordinate) => void;
  onDeliveryAdded?: (coord: Coordinate) => void;
  warehousePin?: Coordinate | null;
  deliveryPins?: MapPin[];
  routeLines?: RouteLine[];
  editable?: boolean;
  mode?: 'warehouse' | 'delivery';
  tempPin?: Coordinate | null;
}

const createMarkerIcon = (type: 'warehouse' | 'delivery' | 'temp', label: string) =>
  L.divIcon({
    className: '',
    html: `<div class="map-marker map-marker--${type}">${label}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });

const MapComponent: React.FC<MapComponentProps> = ({
  onWarehouseSet,
  onDeliveryAdded,
  warehousePin,
  deliveryPins = [],
  routeLines = [],
  editable = true,
  mode = 'warehouse',
  tempPin = null,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const warehouseMarker = useRef<L.Marker | null>(null);
  const deliveryMarkers = useRef<Map<string, L.Marker>>(new Map());
  const tempMarker = useRef<L.Marker | null>(null);
  const routeLayers = useRef<L.Polyline[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const clickDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    map.current = L.map(mapContainer.current, {
      preferCanvas: true,
    }).setView([28.7041, 77.1025], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxNativeZoom: 18,
      maxZoom: 19,
    }).addTo(map.current);

    setTimeout(() => {
      map.current?.invalidateSize();
    }, 100);

    setMapReady(true);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (clickDebounceRef.current) {
        clearTimeout(clickDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapReady) return;

    if (warehousePin) {
      if (warehouseMarker.current) {
        warehouseMarker.current.setLatLng([warehousePin.lat, warehousePin.lng]);
      } else {
        warehouseMarker.current = L.marker([warehousePin.lat, warehousePin.lng], {
          icon: createMarkerIcon('warehouse', 'W'),
        }).addTo(map.current);

        warehouseMarker.current.bindPopup(
          `<div class="map-popup-title">Warehouse</div>
           <div class="map-popup-muted">Lat ${warehousePin.lat.toFixed(4)}</div>
           <div class="map-popup-muted">Lng ${warehousePin.lng.toFixed(4)}</div>`,
          {closeButton: true}
        );
      }
    }
  }, [warehousePin, mapReady]);

  useEffect(() => {
    if (!map.current || !mapReady) return;

    deliveryMarkers.current.forEach((marker) => {
      map.current!.removeLayer(marker);
    });
    deliveryMarkers.current.clear();

    deliveryPins.forEach((pin) => {
      const shortLabel = pin.id.replace(/[^0-9]/g, '').slice(-2) || String(deliveryMarkers.current.size + 1);
      const marker = L.marker([pin.lat, pin.lng], {
        icon: createMarkerIcon('delivery', shortLabel),
      }).addTo(map.current!);

      marker.bindPopup(
        `<div class="map-popup-title">${pin.id}</div>
         <div class="map-popup-muted">Lat ${pin.lat.toFixed(4)}</div>
         <div class="map-popup-muted">Lng ${pin.lng.toFixed(4)}</div>
         ${pin.weight ? `<div class="map-popup-muted">Weight ${pin.weight} kg</div>` : ''}`,
        {closeButton: true}
      );

      deliveryMarkers.current.set(pin.id, marker);
    });
  }, [deliveryPins, mapReady]);

  useEffect(() => {
    if (!map.current || !mapReady) return;

    if (tempPin) {
      if (tempMarker.current) {
        tempMarker.current.setLatLng([tempPin.lat, tempPin.lng]);
      } else {
        tempMarker.current = L.marker([tempPin.lat, tempPin.lng], {
          icon: createMarkerIcon('temp', '+'),
        }).addTo(map.current);

        tempMarker.current.bindPopup(
          `<div class="map-popup-title">Pending location</div>
           <div class="map-popup-muted">Lat ${tempPin.lat.toFixed(4)}</div>
           <div class="map-popup-muted">Lng ${tempPin.lng.toFixed(4)}</div>`,
          {closeButton: true}
        );
      }
    } else {
      if (tempMarker.current && map.current.hasLayer(tempMarker.current)) {
        map.current.removeLayer(tempMarker.current);
      }
      tempMarker.current = null;
    }
  }, [tempPin, mapReady]);

  useEffect(() => {
    if (!map.current || !mapReady) return;

    routeLayers.current.forEach((layer) => map.current?.removeLayer(layer));
    routeLayers.current = [];

    routeLines.forEach((route) => {
      if (route.coordinates.length < 2) return;

      const polyline = L.polyline(
        route.coordinates.map((coord) => [coord.lat, coord.lng]),
        {
          color: route.color,
          weight: 4,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }
      ).addTo(map.current!);

      polyline.bindPopup(
        `<div class="map-popup-title">${route.truckId}</div>
         <div class="map-popup-muted">${route.coordinates.length - 1} route legs</div>`,
        {closeButton: true}
      );

      routeLayers.current.push(polyline);
    });
  }, [routeLines, mapReady]);

  useEffect(() => {
    if (!map.current || !mapReady) return;

    const points: Array<[number, number]> = [];
    if (warehousePin) points.push([warehousePin.lat, warehousePin.lng]);
    deliveryPins.forEach((pin) => points.push([pin.lat, pin.lng]));
    if (tempPin) points.push([tempPin.lat, tempPin.lng]);
    routeLines.forEach((route) =>
      route.coordinates.forEach((coord) => points.push([coord.lat, coord.lng]))
    );

    if (points.length === 1) {
      map.current.setView(points[0], 12);
    } else if (points.length > 1) {
      map.current.fitBounds(L.latLngBounds(points), {padding: [36, 36], maxZoom: 13});
    }
  }, [warehousePin, deliveryPins, tempPin, routeLines, mapReady]);

  const handleMapClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (!editable || !map.current) return;

      if (clickDebounceRef.current) {
        clearTimeout(clickDebounceRef.current);
      }

      clickDebounceRef.current = setTimeout(() => {
        const {lat, lng} = e.latlng;
        const coord = {lat, lng};

        if (mode === 'warehouse' && onWarehouseSet) {
          onWarehouseSet(coord);
        } else if (mode === 'delivery' && onDeliveryAdded) {
          onDeliveryAdded(coord);
        }
      }, 100);
    },
    [editable, onWarehouseSet, onDeliveryAdded, mode]
  );

  useEffect(() => {
    if (!map.current || !editable) return;

    map.current.on('click', handleMapClick);

    return () => {
      map.current?.off('click', handleMapClick);
    };
  }, [editable, handleMapClick]);

  return (
    <div className="h-full w-full overflow-hidden rounded-md border border-stone-200 bg-stone-100 shadow-sm">
      <div ref={mapContainer} className="w-full h-full leaflet-map" />
    </div>
  );
};

export default React.memo(MapComponent);
