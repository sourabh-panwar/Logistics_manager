'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
               Logistics Manager
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Intelligent Delivery Dispatch & Fleet Management System
            </p>
            <p className="text-gray-500">
              Optimize your delivery operations with AI-powered route planning
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
              <div className="text-4xl mb-3">📍</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Smart Routing</h3>
              <p className="text-gray-600 text-sm">
                AI algorithms calculate optimal delivery routes considering weight and distance constraints.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Real-time Tracking</h3>
              <p className="text-gray-600 text-sm">
                Monitor active deliveries and track the status of all your fleet vehicles.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">
                View historical data and completed deliveries to improve future operations.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link
              href="/dispatch"
              className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-white hover:shadow-xl transition transform hover:scale-105"
            >
              <div className="text-5xl mb-4">📦</div>
              <h2 className="text-2xl font-bold mb-3 group-hover:underline">New Dispatch</h2>
              <p className="text-blue-100 mb-6">
                Create and optimize a new delivery dispatch plan for your orders.
              </p>
              <div className="inline-block bg-white text-blue-600 font-semibold py-2 px-6 rounded-full group-hover:bg-blue-50 transition">
                Start Now →
              </div>
            </Link>

            <Link
              href="/active-deliveries"
              className="group bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-8 text-white hover:shadow-xl transition transform hover:scale-105"
            >
              <div className="text-5xl mb-4">🚛</div>
              <h2 className="text-2xl font-bold mb-3 group-hover:underline">Active Deliveries</h2>
              <p className="text-green-100 mb-6">
                Monitor and manage all currently active delivery assignments.
              </p>
              <div className="inline-block bg-white text-green-600 font-semibold py-2 px-6 rounded-full group-hover:bg-green-50 transition">
                View Now →
              </div>
            </Link>

            <Link
              href="/completed-deliveries"
              className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-8 text-white hover:shadow-xl transition transform hover:scale-105"
            >
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-3 group-hover:underline">Completed Deliveries</h2>
              <p className="text-purple-100 mb-6">
                Review historical dispatch data and completed delivery records.
              </p>
              <div className="inline-block bg-white text-purple-600 font-semibold py-2 px-6 rounded-full group-hover:bg-purple-50 transition">
                Browse →
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-3">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-6 text-left">
              <div>
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center font-bold text-blue-600 mb-3">1</div>
                <p className="font-semibold text-gray-800 mb-2">Mark Warehouse</p>
                <p className="text-sm text-gray-600">Click on the map to set your warehouse location</p>
              </div>
              <div>
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center font-bold text-blue-600 mb-3">2</div>
                <p className="font-semibold text-gray-800 mb-2">Add Deliveries</p>
                <p className="text-sm text-gray-600">Mark all delivery locations and enter weights</p>
              </div>
              <div>
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center font-bold text-blue-600 mb-3">3</div>
                <p className="font-semibold text-gray-800 mb-2">Register Trucks</p>
                <p className="text-sm text-gray-600">Input truck capacity and distance limits</p>
              </div>
              <div>
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center font-bold text-blue-600 mb-3">4</div>
                <p className="font-semibold text-gray-800 mb-2">Optimize & Deploy</p>
                <p className="text-sm text-gray-600">Calculate and activate the optimal dispatch plan</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}