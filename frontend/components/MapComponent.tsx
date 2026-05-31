'use client';

import React, {useEffect, useRef, useState} from 'react';
import L from 'leaflet';
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
  onDeliveryAdded?: (deliveries: MapPin[]) => void;
  warehousePin?: Coordinate | null;
  deliveryPins?: MapPin[];
  editable?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({
  onWarehouseSet,
  onDeliveryAdded,
  warehousePin,
  deliveryPins = [],
  editable = true,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const warehouseMarker = useRef<L.Marker | null>(null);
  const deliveryMarkers = useRef<{[key: string]: L.Marker}>({});
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = L.map(mapContainer.current).setView([28.7041, 77.1025], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    setMapReady(true);

    return () => {
      map.current?.remove();
      map.current = null;
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

    deliveryMarkers.current = {};

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

      deliveryMarkers.current[pin.id] = marker;
    });
  }, [deliveryPins, mapReady]);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!editable || !map.current) return;

    const {lat, lng} = e.latlng;

    if (!warehousePin && onWarehouseSet) {
      onWarehouseSet({lat, lng});
    }
  };

  useEffect(() => {
    if (!map.current || !editable) return;

    map.current.on('click', handleMapClick);

    return () => {
      map.current?.off('click', handleMapClick);
    };
  }, [warehousePin, editable, onWarehouseSet]);

  return (
    <div ref={mapContainer} className="w-full h-96 rounded-lg border border-gray-300 shadow-md" />
  );
};

export default MapComponent;