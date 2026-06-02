'use client';

import React from 'react';
import {DispatchResult} from '@/lib/types';

interface DispatchSummaryProps {
  result: DispatchResult;
  loading?: boolean;
}

const DispatchSummary: React.FC<DispatchSummaryProps> = ({result, loading = false}) => {
  if (loading) {
    return (
      <div className="rounded-md border border-stone-200 bg-stone-50 p-6 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-950" />
        <p className="mt-4 text-sm font-medium text-stone-600">Calculating dispatch manifest...</p>
      </div>
    );
  }

  const {fleet_assignments = {}, failed_orders = [], rejected_orders = []} = result;
  const assignments = Object.entries(fleet_assignments);
  const assignedOrders = assignments.reduce(
    (sum, [, clusters]) => sum + clusters.reduce((clusterSum, cluster) => clusterSum + cluster.orders.length, 0),
    0
  );
  const totalDistance = assignments.reduce(
    (sum, [, clusters]) => sum + clusters.reduce((clusterSum, cluster) => clusterSum + cluster.total_route_distance, 0),
    0
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-stone-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Assigned orders</p>
          <p className="mt-2 text-2xl font-semibold text-stone-950">{assignedOrders}</p>
        </div>
        <div className="rounded-md border border-stone-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Truck routes</p>
          <p className="mt-2 text-2xl font-semibold text-stone-950">{assignments.length}</p>
        </div>
        <div className="rounded-md border border-stone-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Distance</p>
          <p className="mt-2 text-2xl font-semibold text-stone-950">{totalDistance.toFixed(1)} km</p>
        </div>
      </div>

      <div className="space-y-3">
        {assignments.map(([truckId, clusters]) => {
          const truckOrders = clusters.flatMap((cluster) => cluster.orders);
          const weight = clusters.reduce((sum, cluster) => sum + cluster.total_weight, 0);
          const distance = clusters.reduce((sum, cluster) => sum + cluster.total_route_distance, 0);

          return (
            <div key={truckId} className="rounded-md border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-950">{truckId}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    {clusters.length} route{clusters.length === 1 ? '' : 's'} · {truckOrders.length} order{truckOrders.length === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="text-right text-xs text-stone-500">
                  <p>{weight.toFixed(1)} kg</p>
                  <p>{distance.toFixed(1)} km</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {truckOrders.map((order) => (
                  <span key={order.id} className="rounded border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-medium text-stone-700">
                    {order.id}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {(failed_orders.length > 0 || rejected_orders.length > 0) && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-semibold text-rose-950">
            Exceptions: {failed_orders.length + rejected_orders.length}
          </p>
          <p className="mt-1 text-sm text-rose-800">
            Failed orders exceed available distance; rejected orders exceed fleet capacity.
          </p>
        </div>
      )}
    </div>
  );
};

export default DispatchSummary;
