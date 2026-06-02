'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {Coordinate, DispatchResult} from '@/lib/types';
import DispatchSummary from './DispatchSummary';

const MapComponent = dynamic(() => import('./MapComponent'), {ssr: false});

interface DispatchConfirmModalProps {
  result: DispatchResult;
  warehouse: Coordinate;
  loading: boolean;
  onSave: () => void;
  onRecalculate: () => void;
  onCancel: () => void;
}

const routeColors = ['#0f766e', '#9a3412', '#4338ca', '#be123c', '#4d7c0f', '#7c2d12'];

const DispatchConfirmModal: React.FC<DispatchConfirmModalProps> = ({
  result,
  warehouse,
  loading,
  onSave,
  onRecalculate,
  onCancel,
}) => {
  const deliveryPins = Object.values(result.fleet_assignments || {})
    .flatMap((clusters) => clusters.flatMap((cluster) => cluster.orders))
    .filter((order, index, orders) => orders.findIndex((candidate) => candidate.id === order.id) === index)
    .map((order) => ({
      id: order.id,
      lat: order.lat,
      lng: order.lng,
      weight: order.weight,
      type: 'delivery' as const,
    }));

  const routeLines = Object.entries(result.fleet_assignments || {}).flatMap(([truckId, clusters], truckIndex) =>
    clusters.map((cluster, clusterIndex) => ({
      id: `${truckId}-${cluster.cluster_id}`,
      truckId,
      color: routeColors[(truckIndex + clusterIndex) % routeColors.length],
      coordinates: [
        warehouse,
        ...cluster.orders.map((order) => ({lat: order.lat, lng: order.lng})),
        warehouse,
      ],
    }))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="grid max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-md border border-stone-200 bg-white shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="min-h-[420px] border-b border-stone-200 bg-stone-100 lg:border-b-0 lg:border-r">
          <MapComponent
            warehousePin={warehouse}
            deliveryPins={deliveryPins}
            routeLines={routeLines}
            editable={false}
          />
        </div>

        <div className="overflow-y-auto p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Manifest review</p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-950">Dispatch plan ready</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Review the colored truck routes before activating the dispatch.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="rounded border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-600 transition hover:border-stone-400 hover:text-stone-950"
            >
              Close
            </button>
          </div>

          <DispatchSummary result={result} />

          <div className="mt-6 flex flex-wrap gap-3 border-t border-stone-200 pt-5">
            <button
              onClick={onRecalculate}
              disabled={loading}
              className="rounded-md border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Recalculate
            </button>
            <button
              onClick={onSave}
              disabled={loading}
              className="ml-auto rounded-md bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              {loading ? 'Activating...' : 'Save and activate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispatchConfirmModal;
