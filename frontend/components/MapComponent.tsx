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

interface MapComponentProps {
  onWarehouseSet?: (coord: Coordinate) => void;
  onDeliveryAdded?: (coord: Coordinate) => void;
  warehousePin?: Coordinate | null;
  deliveryPins?: MapPin[];
  editable?: boolean;
  mode?: 'warehouse' | 'delivery';
  tempPin?: Coordinate | null;
}

const MapComponent: React.FC<MapComponentProps> = ({
  onWarehouseSet,
  onDeliveryAdded,
  warehousePin,
  deliveryPins = [],
  editable = true,
  mode = 'warehouse',
  tempPin = null,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const warehouseMarker = useRef<L.Marker | null>(null);
  const deliveryMarkers = useRef<Map<string, L.Marker>>(new Map());
  const tempMarker = useRef<L.Marker | null>(null);
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
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        }).addTo(map.current);

        warehouseMarker.current.bindPopup(
          `<div class="font-semibold">Warehouse</div>
           <div class="text-sm">Lat: ${warehousePin.lat.toFixed(4)}</div>
           <div class="text-sm">Lng: ${warehousePin.lng.toFixed(4)}</div>`,
          {closeButton: true}
        );
      }

      map.current.setView([warehousePin.lat, warehousePin.lng], 12);
    }
  }, [warehousePin, mapReady]);

  useEffect(() => {
    if (!map.current || !mapReady) return;

    deliveryMarkers.current.forEach((marker) => {
      map.current!.removeLayer(marker);
    });
    deliveryMarkers.current.clear();

    deliveryPins.forEach((pin) => {
      const marker = L.marker([pin.lat, pin.lng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      }).addTo(map.current!);

      marker.bindPopup(
        `<div class="font-semibold">Delivery ${pin.id}</div>
         <div class="text-sm">Lat: ${pin.lat.toFixed(4)}</div>
         <div class="text-sm">Lng: ${pin.lng.toFixed(4)}</div>
         ${pin.weight ? `<div class="text-sm">Weight: ${pin.weight}kg</div>` : ''}`,
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
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-yellow.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        }).addTo(map.current);

        tempMarker.current.bindPopup(
          `<div class="font-semibold">Pending Location</div>
           <div class="text-sm">Lat: ${tempPin.lat.toFixed(4)}</div>
           <div class="text-sm">Lng: ${tempPin.lng.toFixed(4)}</div>`,
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
    <div className="w-full h-full rounded-lg border border-gray-300 shadow-md overflow-hidden">
      <div ref={mapContainer} className="w-full h-full leaflet-map" />
    </div>
  );
};

export default React.memo(MapComponent);