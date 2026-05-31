'use client';

import React, {useState} from 'react';
import Navigation from '@/components/Navigation';
import MapComponent from '@/components/MapComponent';
import DispatchSummary from '@/components/DispatchSummary';
import {Order, Truck, Coordinate, DispatchResult} from '@/lib/types';
import {dispatchAPI} from '@/lib/api';
import Link from 'next/link';

type DispatchStep = 'warehouse' | 'deliveries' | 'trucks' | 'calculate' | 'review';

export default function DispatchPage() {
  const [currentStep, setCurrentStep] = useState<DispatchStep>('warehouse');
  const [warehouse, setWarehouse] = useState<Coordinate | null>(null);
  const [deliveries, setDeliveries] = useState<Array<{id: string; lat: number; lng: number; weight: number}>>([]);
  const [trucks, setTrucks] = useState<Array<{id: string; maxWeight: number; maxDistance: number}>>([]);
  const [dispatchResult, setDispatchResult] = useState<DispatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tempDeliveryWeight, setTempDeliveryWeight] = useState('');
  const [tempDeliveryCoord, setTempDeliveryCoord] = useState<Coordinate | null>(null);

  const [truckForm, setTruckForm] = useState({id: '', maxWeight: '', maxDistance: ''});

  const handleWarehouseSet = (coord: Coordinate) => {
    setWarehouse(coord);
  };

  const handleDeliveryMapClick = (coord: Coordinate) => {
    setTempDeliveryCoord(coord);
  };

  const addDelivery = () => {
    if (!tempDeliveryCoord || !tempDeliveryWeight) {
      setError('Please enter weight and click on map for location');
      return;
    }

    const newDelivery = {
      id: `ORDER-${deliveries.length + 1}`,
      lat: tempDeliveryCoord.lat,
      lng: tempDeliveryCoord.lng,
      weight: parseFloat(tempDeliveryWeight),
    };

    setDeliveries([...deliveries, newDelivery]);
    setTempDeliveryWeight('');
    setTempDeliveryCoord(null);
    setError(null);
  };

  const removeDelivery = (index: number) => {
    setDeliveries(deliveries.filter((_, i) => i !== index));
  };

  const addTruck = () => {
    if (!truckForm.id || !truckForm.maxWeight || !truckForm.maxDistance) {
      setError('Please fill all truck fields');
      return;
    }

    const newTruck = {
      id: truckForm.id,
      maxWeight: parseFloat(truckForm.maxWeight),
      maxDistance: parseFloat(truckForm.maxDistance),
    };

    setTrucks([...trucks, newTruck]);
    setTruckForm({id: '', maxWeight: '', maxDistance: ''});
    setError(null);
  };

  const removeTruck = (index: number) => {
    setTrucks(trucks.filter((_, i) => i !== index));
  };

  const handleCalculateDispatch = async () => {
    if (!warehouse || deliveries.length === 0 || trucks.length === 0) {
      setError('Please complete all previous steps');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orders: Order[] = deliveries.map((d) => ({
        id: d.id,
        lat: d.lat,
        lng: d.lng,
        weight: d.weight,
        priority: 1,
        is_assigned: false,
      }));

      const truckData: Truck[] = trucks.map((t) => ({
        id: t.id,
        max_weight_capacity: t.maxWeight,
        max_daily_distance: t.maxDistance,
        distance_used: 0,
      }));

      const response = await dispatchAPI.calculate({
        orders,
        trucks: truckData,
        warehouse_lat: warehouse.lat,
        warehouse_lng: warehouse.lng,
      });

      setDispatchResult(response.data);
      setCurrentStep('review');
    } catch (err) {
      setError('Failed to calculate dispatch plan. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDispatch = async () => {
    if (!warehouse || deliveries.length === 0 || trucks.length === 0) {
      setError('Invalid dispatch data');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orders: Order[] = deliveries.map((d) => ({
        id: d.id,
        lat: d.lat,
        lng: d.lng,
        weight: d.weight,
        priority: 1,
        is_assigned: false,
      }));

      const truckData: Truck[] = trucks.map((t) => ({
        id: t.id,
        max_weight_capacity: t.maxWeight,
        max_daily_distance: t.maxDistance,
        distance_used: 0,
      }));

      await dispatchAPI.save({
        orders,
        trucks: truckData,
        warehouse_lat: warehouse.lat,
        warehouse_lng: warehouse.lng,
      });

      window.location.href = '/active-deliveries';
    } catch (err) {
      setError('Failed to save dispatch. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stepIndicator = [
    {number: 1, label: 'Warehouse', id: 'warehouse' as DispatchStep},
    {number: 2, label: 'Deliveries', id: 'deliveries' as DispatchStep},
    {number: 3, label: 'Trucks', id: 'trucks' as DispatchStep},
    {number: 4, label: 'Calculate', id: 'calculate' as DispatchStep},
    {number: 5, label: 'Review', id: 'review' as DispatchStep},
  ];

  const isStepComplete = (step: DispatchStep) => {
    if (step === 'warehouse') return warehouse !== null;
    if (step === 'deliveries') return deliveries.length > 0;
    if (step === 'trucks') return trucks.length > 0;
    if (step === 'calculate') return dispatchResult !== null;
    return false;
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
            <h1 className="text-4xl font-bold text-gray-800">New Dispatch</h1>
            <p className="text-gray-600 mt-2">Follow the steps to create and optimize a delivery dispatch plan</p>
          </div>

          <div className="mb-10 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between">
              {stepIndicator.map((step) => (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <button
                    onClick={() => isStepComplete(step.id) && setCurrentStep(step.id)}
                    className={`w-12 h-12 rounded-full font-bold text-lg transition mb-2 ${
                      currentStep === step.id
                        ? 'bg-blue-600 text-white'
                        : isStepComplete(step.id)
                        ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {currentStep === step.id ? step.number : isStepComplete(step.id) ? '✓' : step.number}
                  </button>
                  <span className={`text-sm font-semibold text-center ${currentStep === step.id ? 'text-blue-600' : 'text-gray-600'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-8">
            {currentStep === 'warehouse' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 1: Set Warehouse Location</h2>
                <p className="text-gray-600 mb-6">Click on the map to mark your warehouse location</p>

                <MapComponent onWarehouseSet={handleWarehouseSet} warehousePin={warehouse} editable={!warehouse} />

                {warehouse && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-semibold">✓ Warehouse Location Set</p>
                    <p className="text-sm text-green-700 mt-1">
                      Lat: {warehouse.lat.toFixed(4)}, Lng: {warehouse.lng.toFixed(4)}
                    </p>
                  </div>
                )}

                <div className="flex gap-4 mt-8">
                  <Link href="/" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition">
                    Cancel
                  </Link>
                  <button
                    onClick={() => setCurrentStep('deliveries')}
                    disabled={!warehouse}
                    className={`font-bold py-3 px-8 rounded transition ml-auto ${
                      warehouse
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Continue to Deliveries →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'deliveries' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 2: Register Deliveries</h2>
                <p className="text-gray-600 mb-6">Click on the map to add delivery locations, then enter the weight</p>

                <MapComponent
                  warehousePin={warehouse}
                  deliveryPins={deliveries.map((d) => ({id: d.id, lat: d.lat, lng: d.lng, type: 'delivery' as const, weight: d.weight}))}
                  onDeliveryAdded={() => {}}
                  editable={true}
                />

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-4">Add New Delivery</h3>
                    {tempDeliveryCoord && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-gray-700">
                          <strong>Location:</strong> Lat: {tempDeliveryCoord.lat.toFixed(4)}, Lng: {tempDeliveryCoord.lng.toFixed(4)}
                        </p>
                      </div>
                    )}
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter weight"
                      value={tempDeliveryWeight}
                      onChange={(e) => setTempDeliveryWeight(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-600 mb-3">
                      {tempDeliveryCoord ? '✓ Location selected. Enter weight above.' : 'Click on the map to select delivery location first.'}
                    </p>
                    <button
                      onClick={addDelivery}
                      disabled={!tempDeliveryCoord || !tempDeliveryWeight}
                      className={`w-full font-bold py-2 px-4 rounded transition ${
                        tempDeliveryCoord && tempDeliveryWeight
                          ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Add Delivery
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800 mb-4">Deliveries Added ({deliveries.length})</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {deliveries.map((delivery, index) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 rounded p-3 flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">{delivery.id}</p>
                            <p className="text-xs text-gray-600">
                              Weight: {delivery.weight}kg | Lat: {delivery.lat.toFixed(4)}, Lng: {delivery.lng.toFixed(4)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeDelivery(index)}
                            className="text-red-600 hover:text-red-800 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setCurrentStep('warehouse')}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setCurrentStep('trucks')}
                    disabled={deliveries.length === 0}
                    className={`font-bold py-3 px-8 rounded transition ml-auto ${
                      deliveries.length > 0
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Continue to Trucks →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'trucks' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 3: Register Trucks</h2>
                <p className="text-gray-600 mb-6">Add your available trucks with their capacity constraints</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-4">Add Truck</h3>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Truck ID</label>
                    <input
                      type="text"
                      placeholder="e.g., TRUCK-001"
                      value={truckForm.id}
                      onChange={(e) => setTruckForm({...truckForm, id: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Weight Capacity (kg)</label>
                    <input
                      type="number"
                      placeholder="e.g., 1000"
                      value={truckForm.maxWeight}
                      onChange={(e) => setTruckForm({...truckForm, maxWeight: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Daily Distance (km)</label>
                    <input
                      type="number"
                      placeholder="e.g., 500"
                      value={truckForm.maxDistance}
                      onChange={(e) => setTruckForm({...truckForm, maxDistance: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                      onClick={addTruck}
                      disabled={!truckForm.id || !truckForm.maxWeight || !truckForm.maxDistance}
                      className={`w-full font-bold py-2 px-4 rounded transition ${
                        truckForm.id && truckForm.maxWeight && truckForm.maxDistance
                          ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Add Truck
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800 mb-4">Trucks Added ({trucks.length})</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {trucks.map((truck, index) => (
                        <div key={index} className="bg-purple-50 border border-purple-200 rounded p-3 flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">{truck.id}</p>
                            <p className="text-xs text-gray-600">
                              Capacity: {truck.maxWeight}kg | Distance: {truck.maxDistance}km
                            </p>
                          </div>
                          <button
                            onClick={() => removeTruck(index)}
                            className="text-red-600 hover:text-red-800 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setCurrentStep('deliveries')}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setCurrentStep('calculate')}
                    disabled={trucks.length === 0}
                    className={`font-bold py-3 px-8 rounded transition ml-auto ${
                      trucks.length > 0
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Calculate Plan →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'calculate' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 4: Calculate Dispatch Plan</h2>
                <p className="text-gray-600 mb-6">Click the button below to calculate the optimal delivery plan</p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-blue-900 mb-3">Dispatch Summary</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Deliveries</p>
                      <p className="text-2xl font-bold text-blue-600">{deliveries.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Weight</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {deliveries.reduce((sum, d) => sum + d.weight, 0).toFixed(1)} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Available Trucks</p>
                      <p className="text-2xl font-bold text-blue-600">{trucks.length}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCalculateDispatch}
                  disabled={loading}
                  className={`w-full font-bold py-4 px-6 rounded-lg transition text-lg ${
                    loading
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                  }`}
                >
                  {loading ? 'Calculating...' : '✓ Calculate Optimal Plan'}
                </button>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setCurrentStep('trucks')}
                    disabled={loading}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition disabled:bg-gray-400"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'review' && dispatchResult && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 5: Review & Confirm</h2>
                <p className="text-gray-600 mb-6">Review the calculated dispatch plan below</p>

                <DispatchSummary result={dispatchResult} />

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setCurrentStep('calculate')}
                    disabled={loading}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition disabled:bg-gray-400"
                  >
                    ← Recalculate
                  </button>
                  <button
                    onClick={handleSaveDispatch}
                    disabled={loading}
                    className={`font-bold py-3 px-8 rounded transition ml-auto ${
                      loading
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                    }`}
                  >
                    {loading ? 'Saving...' : '✓ Save & Activate Dispatch'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}