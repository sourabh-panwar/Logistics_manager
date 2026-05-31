'use client';

import React, {useState, useReducer} from 'react';
import Navigation from '@/components/Navigation';
import MapComponent from '@/components/MapComponent';
import DispatchConfirmModal from '@/components/DispatchConfirmModal';
import Toast from '@/components/Toast';
import {Order, Truck, Coordinate, DispatchResult} from '@/lib/types';
import {dispatchAPI} from '@/lib/api';
import Link from 'next/link';

type DispatchStep = 'warehouse' | 'deliveries' | 'trucks' | 'calculate' | 'review';

interface DispatchState {
  currentStep: DispatchStep;
  warehouse: Coordinate | null;
  deliveries: Array<{id: string; lat: number; lng: number; weight: number}>;
  trucks: Array<{id: string; maxWeight: number; maxDistance: number}>;
  dispatchResult: DispatchResult | null;
  loading: boolean;
  error: string | null;
  tempDeliveryWeight: string;
  tempDeliveryCoord: Coordinate | null;
  truckForm: {id: string; maxWeight: string; maxDistance: string};
  toast: {message: string; type: 'success' | 'error' | 'info'} | null;
  showConfirmModal: boolean;
}

type DispatchAction =
  | {type: 'SET_STEP'; payload: DispatchStep}
  | {type: 'SET_WAREHOUSE'; payload: Coordinate}
  | {type: 'ADD_DELIVERY'; payload: {id: string; lat: number; lng: number; weight: number}}
  | {type: 'REMOVE_DELIVERY'; payload: number}
  | {type: 'SET_TEMP_DELIVERY_WEIGHT'; payload: string}
  | {type: 'SET_TEMP_DELIVERY_COORD'; payload: Coordinate | null}
  | {type: 'UPDATE_TRUCK_FORM'; payload: Partial<{id: string; maxWeight: string; maxDistance: string}>}
  | {type: 'ADD_TRUCK'; payload: {id: string; maxWeight: number; maxDistance: number}}
  | {type: 'REMOVE_TRUCK'; payload: number}
  | {type: 'SET_LOADING'; payload: boolean}
  | {type: 'SET_ERROR'; payload: string | null}
  | {type: 'SET_DISPATCH_RESULT'; payload: DispatchResult}
  | {type: 'SHOW_TOAST'; payload: {message: string; type: 'success' | 'error' | 'info'}}
  | {type: 'HIDE_TOAST'}
  | {type: 'SHOW_CONFIRM_MODAL'}
  | {type: 'HIDE_CONFIRM_MODAL'}
  | {type: 'RESET_FORM'};

const initialState: DispatchState = {
  currentStep: 'warehouse',
  warehouse: null,
  deliveries: [],
  trucks: [],
  dispatchResult: null,
  loading: false,
  error: null,
  tempDeliveryWeight: '',
  tempDeliveryCoord: null,
  truckForm: {id: '', maxWeight: '', maxDistance: ''},
  toast: null,
  showConfirmModal: false,
};

function dispatchReducer(state: DispatchState, action: DispatchAction): DispatchState {
  switch (action.type) {
    case 'SET_STEP':
      return {...state, currentStep: action.payload};
    case 'SET_WAREHOUSE':
      return {...state, warehouse: action.payload};
    case 'ADD_DELIVERY':
      return {
        ...state,
        deliveries: [...state.deliveries, action.payload],
        tempDeliveryWeight: '',
        tempDeliveryCoord: null,
      };
    case 'REMOVE_DELIVERY':
      return {...state, deliveries: state.deliveries.filter((_, i) => i !== action.payload)};
    case 'SET_TEMP_DELIVERY_WEIGHT':
      return {...state, tempDeliveryWeight: action.payload};
    case 'SET_TEMP_DELIVERY_COORD':
      return {...state, tempDeliveryCoord: action.payload};
    case 'UPDATE_TRUCK_FORM':
      return {...state, truckForm: {...state.truckForm, ...action.payload}};
    case 'ADD_TRUCK':
      return {
        ...state,
        trucks: [...state.trucks, action.payload],
        truckForm: {id: '', maxWeight: '', maxDistance: ''},
      };
    case 'REMOVE_TRUCK':
      return {...state, trucks: state.trucks.filter((_, i) => i !== action.payload)};
    case 'SET_LOADING':
      return {...state, loading: action.payload};
    case 'SET_ERROR':
      return {...state, error: action.payload};
    case 'SET_DISPATCH_RESULT':
      return {...state, dispatchResult: action.payload};
    case 'SHOW_TOAST':
      return {...state, toast: action.payload};
    case 'HIDE_TOAST':
      return {...state, toast: null};
    case 'SHOW_CONFIRM_MODAL':
      return {...state, showConfirmModal: true};
    case 'HIDE_CONFIRM_MODAL':
      return {...state, showConfirmModal: false};
    case 'RESET_FORM':
      return initialState;
    default:
      return state;
  }
}

export default function DispatchPage() {
  const [state, dispatch] = useReducer(dispatchReducer, initialState);

  const handleWarehouseSet = (coord: Coordinate) => {
    dispatch({type: 'SET_WAREHOUSE', payload: coord});
  };

  const handleDeliveryMapClick = (coord: Coordinate) => {
    dispatch({type: 'SET_TEMP_DELIVERY_COORD', payload: coord});
  };

  const addDelivery = () => {
    if (!state.tempDeliveryCoord || !state.tempDeliveryWeight) {
      dispatch({type: 'SET_ERROR', payload: 'Please enter weight and click on map for location'});
      return;
    }

    const newDelivery = {
      id: `ORDER-${state.deliveries.length + 1}`,
      lat: state.tempDeliveryCoord.lat,
      lng: state.tempDeliveryCoord.lng,
      weight: parseFloat(state.tempDeliveryWeight),
    };

    dispatch({type: 'ADD_DELIVERY', payload: newDelivery});
    dispatch({type: 'SET_ERROR', payload: null});
  };

  const removeDelivery = (index: number) => {
    dispatch({type: 'REMOVE_DELIVERY', payload: index});
  };

  const addTruck = () => {
    if (!state.truckForm.id || !state.truckForm.maxWeight || !state.truckForm.maxDistance) {
      dispatch({type: 'SET_ERROR', payload: 'Please fill all truck fields'});
      return;
    }

    const newTruck = {
      id: state.truckForm.id,
      maxWeight: parseFloat(state.truckForm.maxWeight),
      maxDistance: parseFloat(state.truckForm.maxDistance),
    };

    dispatch({type: 'ADD_TRUCK', payload: newTruck});
    dispatch({type: 'SET_ERROR', payload: null});
  };

  const removeTruck = (index: number) => {
    dispatch({type: 'REMOVE_TRUCK', payload: index});
  };

  const handleCalculateDispatch = async () => {
    if (!state.warehouse || state.deliveries.length === 0 || state.trucks.length === 0) {
      dispatch({type: 'SET_ERROR', payload: 'Please complete all previous steps'});
      return;
    }

    dispatch({type: 'SET_LOADING', payload: true});
    dispatch({type: 'SET_ERROR', payload: null});

    try {
      const orders: Order[] = state.deliveries.map((d) => ({
        id: d.id,
        lat: d.lat,
        lng: d.lng,
        weight: d.weight,
        priority: 1,
        is_assigned: false,
      }));

      const truckData: Truck[] = state.trucks.map((t) => ({
        id: t.id,
        max_weight_capacity: t.maxWeight,
        max_daily_distance: t.maxDistance,
        distance_used: 0,
      }));

      const response = await dispatchAPI.calculate({
        orders,
        trucks: truckData,
        warehouse_lat: state.warehouse.lat,
        warehouse_lng: state.warehouse.lng,
      });

      dispatch({type: 'SET_DISPATCH_RESULT', payload: response.data});
      dispatch({type: 'SHOW_CONFIRM_MODAL'});
      dispatch({type: 'SHOW_TOAST', payload: {message: 'Dispatch plan calculated successfully!', type: 'success'}});
    } catch (err) {
      dispatch({type: 'SET_ERROR', payload: 'Failed to calculate dispatch plan. Please try again.'});
      dispatch({type: 'SHOW_TOAST', payload: {message: 'Error calculating dispatch plan', type: 'error'}});
      console.error(err);
    } finally {
      dispatch({type: 'SET_LOADING', payload: false});
    }
  };

  const handleSaveDispatch = async () => {
    if (!state.warehouse || state.deliveries.length === 0 || state.trucks.length === 0) {
      dispatch({type: 'SET_ERROR', payload: 'Invalid dispatch data'});
      return;
    }

    dispatch({type: 'SET_LOADING', payload: true});
    dispatch({type: 'SET_ERROR', payload: null});

    try {
      const orders: Order[] = state.deliveries.map((d) => ({
        id: d.id,
        lat: d.lat,
        lng: d.lng,
        weight: d.weight,
        priority: 1,
        is_assigned: false,
      }));

      const truckData: Truck[] = state.trucks.map((t) => ({
        id: t.id,
        max_weight_capacity: t.maxWeight,
        max_daily_distance: t.maxDistance,
        distance_used: 0,
      }));

      await dispatchAPI.save({
        orders,
        trucks: truckData,
        warehouse_lat: state.warehouse.lat,
        warehouse_lng: state.warehouse.lng,
      });

      dispatch({type: 'SHOW_TOAST', payload: {message: 'Dispatch activated successfully!', type: 'success'}});
      setTimeout(() => {
        window.location.href = '/active-deliveries';
      }, 1500);
    } catch (err) {
      dispatch({type: 'SET_ERROR', payload: 'Failed to save dispatch. Please try again.'});
      dispatch({type: 'SHOW_TOAST', payload: {message: 'Error saving dispatch', type: 'error'}});
      console.error(err);
    } finally {
      dispatch({type: 'SET_LOADING', payload: false});
    }
  };

  const stepIndicator = [
    {number: 1, label: 'Warehouse', id: 'warehouse' as DispatchStep},
    {number: 2, label: 'Deliveries', id: 'deliveries' as DispatchStep},
    {number: 3, label: 'Trucks', id: 'trucks' as DispatchStep},
    {number: 4, label: 'Calculate', id: 'calculate' as DispatchStep},
  ];

  const isStepComplete = (step: DispatchStep) => {
    if (step === 'warehouse') return state.warehouse !== null;
    if (step === 'deliveries') return state.deliveries.length > 0;
    if (step === 'trucks') return state.trucks.length > 0;
    if (step === 'calculate') return state.dispatchResult !== null;
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
                    onClick={() => isStepComplete(step.id) && dispatch({type: 'SET_STEP', payload: step.id})}
                    className={`w-12 h-12 rounded-full font-bold text-lg transition mb-2 ${
                      state.currentStep === step.id
                        ? 'bg-blue-600 text-white'
                        : isStepComplete(step.id)
                        ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {state.currentStep === step.id ? step.number : isStepComplete(step.id) ? '✓' : step.number}
                  </button>
                  <span className={`text-sm font-semibold text-center ${state.currentStep === step.id ? 'text-blue-600' : 'text-gray-600'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {state.error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
              ⚠️ {state.error}
            </div>
          )}

          {state.toast && (
            <Toast
              message={state.toast.message}
              type={state.toast.type}
              onClose={() => dispatch({type: 'HIDE_TOAST'})}
            />
          )}

          <div className="bg-white rounded-lg shadow-md p-8">
            {state.currentStep === 'warehouse' && (
              <div className="flex flex-col h-[600px]">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 1: Set Warehouse Location</h2>
                <p className="text-gray-600 mb-6">Click on the map to mark your warehouse location</p>

                <div className="flex-1 mb-6">
                  <MapComponent onWarehouseSet={handleWarehouseSet} warehousePin={state.warehouse} editable={!state.warehouse} mode="warehouse" />
                </div>

                {state.warehouse && (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-semibold">✓ Warehouse Location Set</p>
                    <p className="text-sm text-green-700 mt-1">
                      Lat: {state.warehouse.lat.toFixed(4)}, Lng: {state.warehouse.lng.toFixed(4)}
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Link href="/" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition">
                    Cancel
                  </Link>
                  <button
                    onClick={() => dispatch({type: 'SET_STEP', payload: 'deliveries'})}
                    disabled={!state.warehouse}
                    className={`font-bold py-3 px-8 rounded transition ml-auto ${
                      state.warehouse
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Continue to Deliveries →
                  </button>
                </div>
              </div>
            )}

            {state.currentStep === 'deliveries' && (
              <div className="flex flex-col h-[800px]">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 2: Register Deliveries</h2>
                <p className="text-gray-600 mb-6">Click on the map to add delivery locations, then enter the weight</p>

                <div className="flex-1 grid md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-2">
                    <MapComponent
                      warehousePin={state.warehouse}
                      deliveryPins={state.deliveries.map((d) => ({id: d.id, lat: d.lat, lng: d.lng, type: 'delivery' as const, weight: d.weight}))}
                      onDeliveryAdded={handleDeliveryMapClick}
                      editable={true}
                      mode="delivery"
                      tempPin={state.tempDeliveryCoord}
                    />
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col">
                    <h3 className="font-bold text-gray-800 mb-4">Add New Delivery</h3>
                    {state.tempDeliveryCoord && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-gray-700">
                          <strong>Location:</strong> Lat: {state.tempDeliveryCoord.lat.toFixed(4)}, Lng: {state.tempDeliveryCoord.lng.toFixed(4)}
                        </p>
                      </div>
                    )}
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter weight"
                      value={state.tempDeliveryWeight}
                      onChange={(e) => dispatch({type: 'SET_TEMP_DELIVERY_WEIGHT', payload: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-600 mb-3">
                      {state.tempDeliveryCoord ? '✓ Location selected. Enter weight above.' : 'Click on the map to select delivery location first.'}
                    </p>
                    <button
                      onClick={addDelivery}
                      disabled={!state.tempDeliveryCoord || !state.tempDeliveryWeight}
                      className={`w-full font-bold py-2 px-4 rounded transition ${
                        state.tempDeliveryCoord && state.tempDeliveryWeight
                          ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Add Delivery
                    </button>
                    <div className="mt-4 flex-1 overflow-y-auto">
                      <p className="font-bold text-gray-800 mb-3">Deliveries ({state.deliveries.length})</p>
                      <div className="space-y-2">
                        {state.deliveries.map((delivery, index) => (
                          <div key={index} className="bg-blue-50 border border-blue-200 rounded p-2 flex justify-between items-start text-xs">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{delivery.id}</p>
                              <p className="text-gray-600">
                                {delivery.weight}kg
                              </p>
                            </div>
                            <button
                              onClick={() => removeDelivery(index)}
                              className="text-red-600 hover:text-red-800 font-bold ml-2"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => dispatch({type: 'SET_STEP', payload: 'warehouse'})}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => dispatch({type: 'SET_STEP', payload: 'trucks'})}
                    disabled={state.deliveries.length === 0}
                    className={`font-bold py-3 px-8 rounded transition ml-auto ${
                      state.deliveries.length > 0
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Continue to Trucks →
                  </button>
                </div>
              </div>
            )}

            {state.currentStep === 'trucks' && (
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
                      value={state.truckForm.id}
                      onChange={(e) => dispatch({type: 'UPDATE_TRUCK_FORM', payload: {id: e.target.value}})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Weight Capacity (kg)</label>
                    <input
                      type="number"
                      placeholder="e.g., 1000"
                      value={state.truckForm.maxWeight}
                      onChange={(e) => dispatch({type: 'UPDATE_TRUCK_FORM', payload: {maxWeight: e.target.value}})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Daily Distance (km)</label>
                    <input
                      type="number"
                      placeholder="e.g., 500"
                      value={state.truckForm.maxDistance}
                      onChange={(e) => dispatch({type: 'UPDATE_TRUCK_FORM', payload: {maxDistance: e.target.value}})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                      onClick={addTruck}
                      disabled={!state.truckForm.id || !state.truckForm.maxWeight || !state.truckForm.maxDistance}
                      className={`w-full font-bold py-2 px-4 rounded transition ${
                        state.truckForm.id && state.truckForm.maxWeight && state.truckForm.maxDistance
                          ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Add Truck
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800 mb-4">Trucks Added ({state.trucks.length})</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {state.trucks.map((truck, index) => (
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
                    onClick={() => dispatch({type: 'SET_STEP', payload: 'deliveries'})}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => dispatch({type: 'SET_STEP', payload: 'calculate'})}
                    disabled={state.trucks.length === 0}
                    className={`font-bold py-3 px-8 rounded transition ml-auto ${
                      state.trucks.length > 0
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Calculate Plan →
                  </button>
                </div>
              </div>
            )}

            {state.currentStep === 'calculate' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 4: Calculate Dispatch Plan</h2>
                <p className="text-gray-600 mb-6">Click the button below to calculate the optimal delivery plan</p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-blue-900 mb-3">Dispatch Summary</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Deliveries</p>
                      <p className="text-2xl font-bold text-blue-600">{state.deliveries.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Weight</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {state.deliveries.reduce((sum, d) => sum + d.weight, 0).toFixed(1)} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Available Trucks</p>
                      <p className="text-2xl font-bold text-blue-600">{state.trucks.length}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCalculateDispatch}
                  disabled={state.loading}
                  className={`w-full font-bold py-4 px-6 rounded-lg transition text-lg ${
                    state.loading
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                  }`}
                >
                  {state.loading ? 'Calculating...' : '✓ Calculate Optimal Plan'}
                </button>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => dispatch({type: 'SET_STEP', payload: 'trucks'})}
                    disabled={state.loading}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition disabled:bg-gray-400"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            )}

            {state.showConfirmModal && state.dispatchResult && (
              <DispatchConfirmModal
                result={state.dispatchResult}
                loading={state.loading}
                onSave={handleSaveDispatch}
                onRecalculate={() => {
                  dispatch({type: 'HIDE_CONFIRM_MODAL'});
                  dispatch({type: 'SET_STEP', payload: 'calculate'});
                }}
                onCancel={() => dispatch({type: 'HIDE_CONFIRM_MODAL'})}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}