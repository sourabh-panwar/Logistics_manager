'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import {CompletedDispatch} from '@/lib/types';
import {dispatchAPI} from '@/lib/api';

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
      setError('Failed to load completed deliveries. Confirm the backend is running on port 8000.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

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
              <h1 className="mt-3 text-3xl font-semibold text-white">Completed dispatches</h1>
              <p className="mt-2 text-sm text-stone-500">Audit finished dispatches and warehouse origin data.</p>
            </div>
            <button
              onClick={fetchCompletedDeliveries}
              className="rounded-md border border-white/20 bg-dark-card px-5 py-3 text-sm font-semibold text-white transition hover:border-white"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-900">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-md border border-white/10 bg-dark-card p-12 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-stone-950" />
              <p className="mt-4 text-sm font-medium text-stone-500">Loading completed dispatches...</p>
            </div>
          ) : dispatches.length === 0 ? (
            <div className="rounded-md border border-white/10 bg-dark-card p-12 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">No history</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">No completed dispatches yet</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-stone-500">
                Once active assignments are marked complete, they will appear here for review.
              </p>
              <Link href="/dispatch" className="mt-6 inline-flex rounded-md bg-dark-card px-5 py-3 text-sm font-semibold text-black transition hover:bg-stone-800">
                Create dispatch
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-white/10 bg-dark-card shadow-sm">
              <div className="grid grid-cols-[1.4fr_1fr_0.7fr_0.7fr] border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
                <p>Dispatch</p>
                <p>Completed</p>
                <p>Assignments</p>
                <p>Status</p>
              </div>
              <div className="divide-y divide-white/5">
                {dispatches.map((dispatch) => (
                  <div key={dispatch.dispatch_id} className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[1.4fr_1fr_0.7fr_0.7fr] md:items-center">
                    <div>
                      <p className="font-mono text-xs text-stone-500">{dispatch.dispatch_id}</p>
                      <p className="mt-1 text-xs text-stone-500">
                        Warehouse {dispatch.warehouse.lat.toFixed(4)}, {dispatch.warehouse.lng.toFixed(4)}
                      </p>
                    </div>
                    <p className="text-stone-500">{formatDate(dispatch.created_at)}</p>
                    <p className="font-semibold text-white">{dispatch.total_assignments}</p>
                    <span className="w-fit rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-900">
                      {dispatch.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
