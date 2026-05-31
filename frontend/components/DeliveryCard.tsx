'use client';

import React from 'react';
import {DeliveryAssignment} from '@/lib/types';

interface DeliveryCardProps {
  assignment: DeliveryAssignment;
  onMarkComplete?: (truckId: string) => void;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({assignment, onMarkComplete}) => {
  const statusColor = {
    assigned: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    in_transit: 'bg-blue-100 text-blue-800 border-blue-300',
    delivered: 'bg-green-100 text-green-800 border-green-300',
  };

  const currentColor = statusColor[assignment.status as keyof typeof statusColor] || statusColor.assigned;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-blue-500 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">🚛 {assignment.truck_id}</h3>
          <p className={`inline-block text-sm font-semibold px-3 py-1 rounded mt-2 border ${currentColor}`}>
            {assignment.status.replace('_', ' ').toUpperCase()}
          </p>
        </div>
        {assignment.status !== 'delivered' && onMarkComplete && (
          <button
            onClick={() => onMarkComplete(assignment.truck_id)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition"
          >
            Mark Complete
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-purple-50 rounded p-3">
          <p className="text-xs text-gray-600 font-semibold">ORDERS</p>
          <p className="text-2xl font-bold text-purple-600">{assignment.orders.length}</p>
        </div>
        <div className="bg-orange-50 rounded p-3">
          <p className="text-xs text-gray-600 font-semibold">WEIGHT</p>
          <p className="text-2xl font-bold text-orange-600">{assignment.total_weight.toFixed(1)}</p>
          <p className="text-xs text-gray-500">kg</p>
        </div>
        <div className="bg-green-50 rounded p-3">
          <p className="text-xs text-gray-600 font-semibold">DISTANCE</p>
          <p className="text-2xl font-bold text-green-600">{assignment.total_distance.toFixed(1)}</p>
          <p className="text-xs text-gray-500">km</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">ORDER IDS:</p>
        <div className="flex flex-wrap gap-2">
          {assignment.orders.map((order) => (
            <span key={order.order_id} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
              {order.order_id}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeliveryCard;