'use client';

import React from 'react';
import {DeliveryAssignment} from '@/lib/types';

interface DeliveryCardProps {
  assignment: DeliveryAssignment;
  onMarkComplete?: (dispatchId: string, truckId: string) => void;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({assignment, onMarkComplete}) => {
  const statusColor = {
    assigned: 'border-amber-200 bg-amber-50 text-amber-900',
    in_transit: 'border-teal-200 bg-teal-50 text-teal-900',
    delivered: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  };

  const currentColor = statusColor[assignment.status as keyof typeof statusColor] || statusColor.assigned;

  return (
    <div className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Truck</p>
          <h3 className="mt-2 text-xl font-semibold text-stone-950">{assignment.truck_id}</h3>
          <p className={`mt-3 inline-flex rounded border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${currentColor}`}>
            {assignment.status.replace('_', ' ')}
          </p>
        </div>
        {assignment.status !== 'delivered' && onMarkComplete && assignment.dispatch_id && (
          <button
            onClick={() => onMarkComplete(assignment.dispatch_id!, assignment.truck_id)}
            className="rounded-md bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Mark complete
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Orders</p>
          <p className="mt-2 text-2xl font-semibold text-stone-950">{assignment.orders.length}</p>
        </div>
        <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Weight</p>
          <p className="mt-2 text-2xl font-semibold text-stone-950">{assignment.total_weight.toFixed(1)}</p>
          <p className="text-xs text-stone-500">kg</p>
        </div>
        <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Distance</p>
          <p className="mt-2 text-2xl font-semibold text-stone-950">{assignment.total_distance.toFixed(1)}</p>
          <p className="text-xs text-stone-500">km</p>
        </div>
      </div>

      <div className="mt-5 rounded-md border border-stone-200 bg-stone-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Order IDs</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {assignment.orders.map((order) => (
            <span key={order.order_id} className="rounded border border-stone-200 bg-white px-2 py-1 text-xs font-medium text-stone-700">
              {order.order_id}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeliveryCard;
