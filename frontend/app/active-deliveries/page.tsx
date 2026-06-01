'use client';

import React, {useEffect, useState} from 'react';
import Navigation from '@/components/Navigation';
import DeliveryCard from '@/components/DeliveryCard';
import {DeliveryAssignment} from '@/lib/types';
import {dispatchAPI} from '@/lib/api';
import Link from 'next/link';

export default function ActiveDeliveriesPage() {
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveDeliveries();
  }, []);

  const fetchActiveDeliveries = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await dispatchAPI.getActive();
      setAssignments(response.data);
    } catch (err) {
      setError('Failed to load active deliveries. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Now calls the backend API and requires both IDs
  const handleMarkComplete = async (dispatchId: string, truckId: string) => {
    setError(null);

    try {
      await dispatchAPI.completeDispatchTruck(dispatchId, truckId);
      // Remove the completed assignment from the list
      setAssignments((prev) =>
        prev.filter((assignment) => !(assignment.dispatch_id === dispatchId && assignment.truck_id === truckId))
      );
      // Refresh to ensure we're in sync with backend
      setTimeout(() => fetchActiveDeliveries(), 500);
    } catch (err) {
      setError('Failed to mark delivery as complete.');
      console.error(err);
      // Refresh on error to get latest state
      fetchActiveDeliveries();
    }
  };

  const totalOrders = assignments.reduce((sum, a) => sum + a.orders.length, 0);
  const totalWeight = assignments.reduce((sum, a) => sum + a.total_weight, 0);
  const totalDistance = assignments.reduce((sum, a) => sum + a.total_distance, 0);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50 py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-semibold mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-800">Active Deliveries</h1>
            <p className="text-gray-600 mt-2">Monitor and manage all currently active delivery assignments</p>
          </div>

          {assignments.length > 0 && (
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-blue-500">
                <p className="text-gray-600 text-sm font-semibold mb-1">Active Trucks</p>
                <p className="text-3xl font-bold text-blue-600">{assignments.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-purple-500">
                <p className="text-gray-600 text-sm font-semibold mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-purple-600">{totalOrders}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-orange-500">
                <p className="text-gray-600 text-sm font-semibold mb-1">Total Weight</p>
                <p className="text-3xl font-bold text-orange-600">{totalWeight.toFixed(1)}</p>
                <p className="text-xs text-gray-500">kg</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-green-500">
                <p className="text-gray-600 text-sm font-semibold mb-1">Total Distance</p>
                <p className="text-3xl font-bold text-green-600">{totalDistance.toFixed(1)}</p>
                <p className="text-xs text-gray-500">km</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mb-4"></div>
                <p className="text-gray-600 font-semibold">Loading active deliveries...</p>
              </div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Active Deliveries</h2>
              <p className="text-gray-600 mb-6">There are currently no active delivery assignments.</p>
              <Link
                href="/dispatch"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded transition"
              >
                Create New Dispatch
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {assignments.map((assignment) => (
                // Pass an arrow function to ensure both IDs get passed correctly
                <DeliveryCard
                  key={assignment.truck_id}
                  assignment={assignment}
                  onMarkComplete={() => handleMarkComplete(assignment.dispatch_id, assignment.truck_id)}
                />
              ))}
            </div>
          )}

          {assignments.length > 0 && (
            <div className="flex gap-4 mt-8">
              <button
                onClick={fetchActiveDeliveries}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition"
              >
                🔄 Refresh
              </button>
              <Link
                href="/dispatch"
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition"
              >
                ➕ New Dispatch
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}