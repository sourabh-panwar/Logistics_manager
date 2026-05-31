'use client';

import React from 'react';
import {DispatchResult, RouteCluster} from '@/lib/types';

interface DispatchSummaryProps {
  result: DispatchResult;
  loading?: boolean;
}

const DispatchSummary: React.FC<DispatchSummaryProps> = ({result, loading = false}) => {
  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        <p className="mt-4 text-gray-600">Calculating optimal dispatch plan...</p>
      </div>
    );
  }

  const {fleet_assignments = {}, failed_orders = []} = result;
  const assignments = Object.entries(fleet_assignments);

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-green-800 mb-4">Dispatch Plan Summary</h3>

        {assignments.length === 0 ? (
          <p className="text-gray-600">No valid assignments</p>
        ) : (
          <div className="space-y-4">
            {assignments.map(([truckId, clusters]) => (
              <div key={truckId} className="bg-white rounded-lg p-4 border border-green-100">
                <h4 className="font-bold text-gray-800 mb-3">🚛 {truckId}</h4>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="bg-blue-50 rounded p-3">
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-xl font-bold text-blue-600">
                      {clusters.reduce((sum, c) => sum + c.orders.length, 0)}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded p-3">
                    <p className="text-sm text-gray-600">Total Weight</p>
                    <p className="text-xl font-bold text-purple-600">
                      {clusters.reduce((sum, c) => sum + c.total_weight, 0).toFixed(1)} kg
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded p-3">
                    <p className="text-sm text-gray-600">Total Distance</p>
                    <p className="text-xl font-bold text-orange-600">
                      {clusters.reduce((sum, c) => sum + c.total_route_distance, 0).toFixed(1)} km
                    </p>
                  </div>
                  <div className="bg-green-50 rounded p-3">
                    <p className="text-sm text-gray-600">Routes</p>
                    <p className="text-xl font-bold text-green-600">{clusters.length}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Order IDs:</p>
                  <p className="text-sm text-gray-600">
                    {clusters.flatMap(c => c.orders.map(o => o.id)).join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {failed_orders.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-800 mb-4">
             Failed Orders ({failed_orders.length})
          </h3>
          <div className="space-y-2">
            {failed_orders.map((order) => (
              <div key={order.id} className="bg-white rounded p-3 border border-red-100">
                <p className="font-semibold text-gray-800">{order.id}</p>
                <p className="text-sm text-gray-600">Weight: {order.weight}kg | Priority: {order.priority}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-red-700 mt-3">
            These orders couldn't be assigned due to truck capacity constraints. They will be retried in the next dispatch.
          </p>
        </div>
      )}
    </div>
  );
};

export default DispatchSummary;