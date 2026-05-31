'use client';

import React, {useEffect, useState} from 'react';
import Navigation from '@/components/Navigation';
import {CompletedDispatch} from '@/lib/types';
import {dispatchAPI} from '@/lib/api';
import Link from 'next/link';

export default function CompletedDeliveriesPage() {
  const [dispatches, setDispatches] = useState<CompletedDispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompletedDeliveries();
  }, []);

  const fetchCompletedDeliveries = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await dispatchAPI.getHistory();
      setDispatches(response.data);
    } catch (err) {
      setError('Failed to load completed deliveries. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50 py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-semibold mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-800">Completed Deliveries</h1>
            <p className="text-gray-600 mt-2">View historical dispatch data and completed delivery records</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="animate-spin inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mb-4"></div>
                <p className="text-gray-600 font-semibold">Loading completed deliveries...</p>
              </div>
            </div>
          ) : dispatches.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Completed Dispatches Yet</h2>
              <p className="text-gray-600 mb-6">
                Once you complete delivery assignments, they will appear here in the history.
              </p>
              <Link
                href="/dispatch"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded transition"
              >
                Create New Dispatch
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {dispatches.map((dispatch) => (
                <div
                  key={dispatch.dispatch_id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 border-l-green-500"
                >
                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">Dispatch ID</h3>
                      <p className="text-sm font-mono text-gray-600 break-all">{dispatch.dispatch_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Completed</p>
                      <p className="text-lg font-semibold text-gray-800">{formatDate(dispatch.created_at)}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <h4 className="font-semibold text-gray-800 mb-3">📍 Warehouse Location</h4>
                    <p className="text-sm text-gray-600">
                      Latitude: {dispatch.warehouse.lat.toFixed(4)} | Longitude: {dispatch.warehouse.lng.toFixed(4)}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-purple-50 rounded p-4 text-center">
                      <p className="text-sm text-gray-600 font-semibold mb-1">Total Assignments</p>
                      <p className="text-3xl font-bold text-purple-600">{dispatch.total_assignments}</p>
                    </div>
                    <div className="bg-green-50 rounded p-4 text-center">
                      <p className="text-sm text-gray-600 font-semibold mb-1">Status</p>
                      <p className="text-lg font-bold text-green-600">✓ {dispatch.status.toUpperCase()}</p>
                    </div>
                    <div className="bg-blue-50 rounded p-4 text-center">
                      <p className="text-sm text-gray-600 font-semibold mb-1">Dispatch ID</p>
                      <p className="text-xs font-mono text-blue-600 break-all">{dispatch.dispatch_id.substring(0, 8)}...</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {dispatches.length > 0 && (
            <div className="flex gap-4 mt-8">
              <button
                onClick={fetchCompletedDeliveries}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition"
              >
                🔄 Refresh
              </button>
              <Link
                href="/active-deliveries"
                className="ml-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded transition"
              >
                View Active Deliveries
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}