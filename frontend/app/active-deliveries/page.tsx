'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import DeliveryCard from '@/components/DeliveryCard';
import {DeliveryAssignment} from '@/lib/types';
import {dispatchAPI} from '@/lib/api';

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
      setError('Failed to load active deliveries. Confirm the backend is running on port 8000.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (dispatchId: string, truckId: string) => {
    setError(null);

    try {
      await dispatchAPI.completeDispatchTruck(dispatchId, truckId);
      setAssignments((prev) =>
        prev.filter((assignment) => !(assignment.dispatch_id === dispatchId && assignment.truck_id === truckId))
      );
      setTimeout(() => fetchActiveDeliveries(), 400);
    } catch (err) {
      setError('Failed to mark delivery as complete.');
      console.error(err);
      fetchActiveDeliveries();
    }
  };

  const totalOrders = assignments.reduce((sum, assignment) => sum + assignment.orders.length, 0);
  const totalWeight = assignments.reduce((sum, assignment) => sum + assignment.total_weight, 0);
  const totalDistance = assignments.reduce((sum, assignment) => sum + assignment.total_distance, 0);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-dark-main bg-dot-pattern px-5 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Link href="/" className="text-sm font-semibold text-stone-500 transition hover:text-white">
                Back to dashboard
              </Link>
              <h1 className="mt-3 text-3xl font-semibold text-white">Active deliveries</h1>
              <p className="mt-2 text-sm text-stone-500">Monitor truck assignments that are still open.</p>
            </div>
            <Link href="/dispatch" className="rounded-md bg-dark-card px-5 py-3 text-sm font-semibold text-black transition hover:bg-stone-800">
              New dispatch
            </Link>
          </div>

          {assignments.length > 0 && (
            <div className="mb-6 grid gap-3 md:grid-cols-4">
              {[
                ['Active trucks', assignments.length],
                ['Orders', totalOrders],
                ['Weight', `${totalWeight.toFixed(1)} kg`],
                ['Distance', `${totalDistance.toFixed(1)} km`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-white/10 bg-dark-card p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-900">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-md border border-white/10 bg-dark-card p-12 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-stone-950" />
              <p className="mt-4 text-sm font-medium text-stone-500">Loading active deliveries...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="rounded-md border border-white/10 bg-dark-card p-12 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">No active work</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">No open truck assignments</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-stone-500">
                Create and activate a dispatch to see truck-level routes in this view.
              </p>
              <Link href="/dispatch" className="mt-6 inline-flex rounded-md bg-dark-card px-5 py-3 text-sm font-semibold text-black transition hover:bg-stone-800">
                Create dispatch
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {assignments.map((assignment) => (
                <DeliveryCard
                  key={`${assignment.dispatch_id}-${assignment.truck_id}`}
                  assignment={assignment}
                  onMarkComplete={() => handleMarkComplete(assignment.dispatch_id!, assignment.truck_id)}
                />
              ))}
            </div>
          )}

          {assignments.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={fetchActiveDeliveries}
                className="rounded-md border border-white/20 bg-dark-card px-5 py-3 text-sm font-semibold text-white transition hover:border-white"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
