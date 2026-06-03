'use client';

import React, {useReducer} from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import DispatchConfirmModal from '@/components/DispatchConfirmModal';
import Toast from '@/components/Toast';
import {Coordinate, DispatchResult, Order, Truck} from '@/lib/types';
import {dispatchAPI} from '@/lib/api';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {ssr: false});

type DispatchStep = 'warehouse' | 'deliveries' | 'trucks' | 'calculate';

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

const steps: Array<{id: DispatchStep; label: string}> = [
  {id: 'warehouse', label: 'Warehouse'},
  {id: 'deliveries', label: 'Deliveries'},
  {id: 'trucks', label: 'Fleet'},
  {id: 'calculate', label: 'Review'},
];

function dispatchReducer(state: DispatchState, action: DispatchAction): DispatchState {
  switch (action.type) {
    case 'SET_STEP':
      return {...state, currentStep: action.payload};
    case 'SET_WAREHOUSE':
      return {...state, warehouse: action.payload, error: null};
    case 'ADD_DELIVERY':
      return {
        ...state,
        deliveries: [...state.deliveries, action.payload],
        tempDeliveryWeight: '',
        tempDeliveryCoord: null,
        error: null,
      };
    case 'REMOVE_DELIVERY':
      return {...state, deliveries: state.deliveries.filter((_, index) => index !== action.payload)};
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
        error: null,
      };
    case 'REMOVE_TRUCK':
      return {...state, trucks: state.trucks.filter((_, index) => index !== action.payload)};
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

const inputClass =
  'w-full rounded-md border border-white/20 bg-dark-card px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-stone-950';
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-500';

export default function DispatchPage() {
  const [state, dispatch] = useReducer(dispatchReducer, initialState);

  const isStepComplete = (step: DispatchStep) => {
    if (step === 'warehouse') return Boolean(state.warehouse);
    if (step === 'deliveries') return state.deliveries.length > 0;
    if (step === 'trucks') return state.trucks.length > 0;
    if (step === 'calculate') return Boolean(state.dispatchResult);
    return false;
  };

  const addDelivery = () => {
    const weight = Number(state.tempDeliveryWeight);
    if (!state.tempDeliveryCoord || !Number.isFinite(weight) || weight <= 0) {
      dispatch({type: 'SET_ERROR', payload: 'Select a delivery point and enter a positive weight.'});
      return;
    }

    dispatch({
      type: 'ADD_DELIVERY',
      payload: {
        id: `ORDER-${String(state.deliveries.length + 1).padStart(3, '0')}`,
        lat: state.tempDeliveryCoord.lat,
        lng: state.tempDeliveryCoord.lng,
        weight,
      },
    });
  };

  const addTruck = () => {
    const maxWeight = Number(state.truckForm.maxWeight);
    const maxDistance = Number(state.truckForm.maxDistance);
    const truckId = state.truckForm.id.trim();

    if (!truckId || !Number.isFinite(maxWeight) || !Number.isFinite(maxDistance) || maxWeight <= 0 || maxDistance <= 0) {
      dispatch({type: 'SET_ERROR', payload: 'Enter a truck ID, positive capacity, and positive daily distance.'});
      return;
    }

    if (state.trucks.some((truck) => truck.id === truckId)) {
      dispatch({type: 'SET_ERROR', payload: 'Truck IDs must be unique.'});
      return;
    }

    dispatch({type: 'ADD_TRUCK', payload: {id: truckId, maxWeight, maxDistance}});
  };

  const buildPayload = () => {
    const orders: Order[] = state.deliveries.map((delivery) => ({
      id: delivery.id,
      lat: delivery.lat,
      lng: delivery.lng,
      weight: delivery.weight,
      priority: 1,
      is_assigned: false,
    }));

    const trucks: Truck[] = state.trucks.map((truck) => ({
      id: truck.id,
      max_weight_capacity: truck.maxWeight,
      max_daily_distance: truck.maxDistance,
      distance_used: 0,
    }));

    return {orders, trucks};
  };

  const handleCalculateDispatch = async () => {
    if (!state.warehouse || state.deliveries.length === 0 || state.trucks.length === 0) {
      dispatch({type: 'SET_ERROR', payload: 'Complete warehouse, deliveries, and fleet before review.'});
      return;
    }

    dispatch({type: 'SET_LOADING', payload: true});
    dispatch({type: 'SET_ERROR', payload: null});

    try {
      const {orders, trucks} = buildPayload();
      const response = await dispatchAPI.calculate({
        orders,
        trucks,
        warehouse_lat: state.warehouse.lat,
        warehouse_lng: state.warehouse.lng,
      });

      dispatch({type: 'SET_DISPATCH_RESULT', payload: response.data});
      dispatch({type: 'SHOW_CONFIRM_MODAL'});
      dispatch({type: 'SHOW_TOAST', payload: {message: 'Dispatch manifest calculated.', type: 'success'}});
    } catch (err) {
      dispatch({type: 'SET_ERROR', payload: 'Dispatch calculation failed. Check backend status and try again.'});
      dispatch({type: 'SHOW_TOAST', payload: {message: 'Calculation failed.', type: 'error'}});
      console.error(err);
    } finally {
      dispatch({type: 'SET_LOADING', payload: false});
    }
  };

  const handleSaveDispatch = async () => {
    if (!state.warehouse) return;

    dispatch({type: 'SET_LOADING', payload: true});
    dispatch({type: 'SET_ERROR', payload: null});

    try {
      const {orders, trucks} = buildPayload();
      await dispatchAPI.save({
        orders,
        trucks,
        warehouse_lat: state.warehouse.lat,
        warehouse_lng: state.warehouse.lng,
      });

      dispatch({type: 'SHOW_TOAST', payload: {message: 'Dispatch activated.', type: 'success'}});
      setTimeout(() => {
        window.location.href = '/active-deliveries';
      }, 900);
    } catch (err) {
      dispatch({type: 'SET_ERROR', payload: 'Failed to activate dispatch.'});
      dispatch({type: 'SHOW_TOAST', payload: {message: 'Activation failed.', type: 'error'}});
      console.error(err);
    } finally {
      dispatch({type: 'SET_LOADING', payload: false});
    }
  };

  const totalWeight = state.deliveries.reduce((sum, delivery) => sum + delivery.weight, 0);

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
              <h1 className="mt-3 text-3xl font-semibold text-white">New dispatch</h1>
              <p className="mt-2 text-sm text-stone-500">Build a route manifest from warehouse, order, and fleet constraints.</p>
            </div>
            <div className="grid grid-cols-3 overflow-hidden rounded-md border border-white/10 bg-dark-card text-center shadow-sm">
              <div className="border-r border-white/10 px-4 py-3">
                <p className="text-lg font-semibold">{state.deliveries.length}</p>
                <p className="text-xs text-stone-500">Orders</p>
              </div>
              <div className="border-r border-white/10 px-4 py-3">
                <p className="text-lg font-semibold">{totalWeight.toFixed(0)}</p>
                <p className="text-xs text-stone-500">Kg</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-lg font-semibold">{state.trucks.length}</p>
                <p className="text-xs text-stone-500">Trucks</p>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-md border border-white/10 bg-dark-card p-3 shadow-sm">
            <div className="grid gap-2 sm:grid-cols-4">
              {steps.map((step, index) => {
                const active = state.currentStep === step.id;
                const complete = isStepComplete(step.id);
                return (
                  <button
                    key={step.id}
                    onClick={() => (complete || index === 0) && dispatch({type: 'SET_STEP', payload: step.id})}
                    className={`flex items-center gap-3 rounded-md px-3 py-3 text-left transition ${
                      active ? 'bg-white text-black' : complete ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-stone-500'
                    }`}
                  >
                    <span className={`flex h-7 w-7 items-center justify-center rounded border text-xs font-semibold ${
                      active ? 'border-white/20' : complete ? 'border-emerald-500/30' : 'border-white/10'
                    }`}>
                      {complete && !active ? '✓' : index + 1}
                    </span>
                    <span className="text-sm font-semibold">{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {state.error && (
            <div className="mb-6 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-900">
              {state.error}
            </div>
          )}

          {state.toast && (
            <Toast message={state.toast.message} type={state.toast.type} onClose={() => dispatch({type: 'HIDE_TOAST'})} />
          )}

          <section className="rounded-md border border-white/10 bg-dark-card p-5 shadow-sm">
            {state.currentStep === 'warehouse' && (
              <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
                <aside className="rounded-md border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Step 1</p>
                  <h2 className="mt-3 text-2xl font-semibold">Set warehouse</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-500">
                    Click once on the map to choose the dispatch origin. You can return here and choose a new point.
                  </p>
                  {state.warehouse && (
                    <div className="mt-6 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
                      <p className="font-semibold">Warehouse selected</p>
                      <p className="mt-1">Lat {state.warehouse.lat.toFixed(4)}, Lng {state.warehouse.lng.toFixed(4)}</p>
                    </div>
                  )}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => dispatch({type: 'SET_STEP', payload: 'deliveries'})}
                      disabled={!state.warehouse}
                      className="rounded-md bg-dark-card px-5 py-3 text-white font-semibold text-black transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                    >
                      Continue
                    </button>
                  </div>
                </aside>
                <div className="h-[560px]">
                  <MapComponent onWarehouseSet={(coord) => dispatch({type: 'SET_WAREHOUSE', payload: coord})} warehousePin={state.warehouse} mode="warehouse" />
                </div>
              </div>
            )}

            {state.currentStep === 'deliveries' && (
              <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="h-[680px]">
                  <MapComponent
                    warehousePin={state.warehouse}
                    deliveryPins={state.deliveries.map((delivery) => ({...delivery, type: 'delivery' as const}))}
                    onDeliveryAdded={(coord) => dispatch({type: 'SET_TEMP_DELIVERY_COORD', payload: coord})}
                    mode="delivery"
                    tempPin={state.tempDeliveryCoord}
                  />
                </div>
                <aside className="rounded-md border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Step 2</p>
                  <h2 className="mt-3 text-2xl font-semibold">Register deliveries</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-500">Select a delivery point on the map, then enter its package weight.</p>

                  <div className="mt-6 rounded-md border border-white/10 bg-dark-card p-4">
                    {state.tempDeliveryCoord && (
                      <p className="mb-4 rounded border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white">
                        Selected: {state.tempDeliveryCoord.lat.toFixed(4)}, {state.tempDeliveryCoord.lng.toFixed(4)}
                      </p>
                    )}
                    <label className={labelClass}>Weight in kg</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Example: 120"
                      value={state.tempDeliveryWeight}
                      onChange={(event) => dispatch({type: 'SET_TEMP_DELIVERY_WEIGHT', payload: event.target.value})}
                      className={inputClass}
                    />
                    <button
                      onClick={addDelivery}
                      disabled={!state.tempDeliveryCoord || !state.tempDeliveryWeight}
                      className="mt-4 w-full rounded-md bg-dark-card px-4 py-3 text-white font-semibold text-black transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                    >
                      Add delivery
                    </button>
                  </div>

                  <div className="mt-5 max-h-72 overflow-y-auto rounded-md border border-white/10 bg-dark-card">
                    {state.deliveries.length === 0 ? (
                      <p className="p-4 text-sm text-stone-500">No deliveries added yet.</p>
                    ) : (
                      state.deliveries.map((delivery, index) => (
                        <div key={delivery.id} className="flex items-center justify-between border-b border-white/5 p-3 last:border-b-0">
                          <div>
                            <p className="text-sm font-semibold text-white">{delivery.id}</p>
                            <p className="text-xs text-stone-500">{delivery.weight} kg</p>
                          </div>
                          <button
                            onClick={() => dispatch({type: 'REMOVE_DELIVERY', payload: index})}
                            className="rounded border border-white/10 px-2 py-1 text-xs font-semibold text-stone-500 transition hover:border-rose-500/50 hover:text-rose-400"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button onClick={() => dispatch({type: 'SET_STEP', payload: 'warehouse'})} className="rounded-md border border-white/20 px-4 py-3 text-sm font-semibold">
                      Back
                    </button>
                    <button
                      onClick={() => dispatch({type: 'SET_STEP', payload: 'trucks'})}
                      disabled={state.deliveries.length === 0}
                      className="ml-auto rounded-md bg-dark-card px-5 py-3 text-white font-semibold text-black transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                    >
                      Continue
                    </button>
                  </div>
                </aside>
              </div>
            )}

            {state.currentStep === 'trucks' && (
              <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                <aside className="rounded-md border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Step 3</p>
                  <h2 className="mt-3 text-2xl font-semibold">Add fleet</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-500">Each truck needs a unique ID, load capacity, and maximum route distance.</p>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label className={labelClass}>Truck ID</label>
                      <input
                        type="text"
                        placeholder="TRUCK-001"
                        value={state.truckForm.id}
                        onChange={(event) => dispatch({type: 'UPDATE_TRUCK_FORM', payload: {id: event.target.value}})}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Capacity in kg</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1000"
                        value={state.truckForm.maxWeight}
                        onChange={(event) => dispatch({type: 'UPDATE_TRUCK_FORM', payload: {maxWeight: event.target.value}})}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Daily distance in km</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="500"
                        value={state.truckForm.maxDistance}
                        onChange={(event) => dispatch({type: 'UPDATE_TRUCK_FORM', payload: {maxDistance: event.target.value}})}
                        className={inputClass}
                      />
                    </div>
                    <button onClick={addTruck} className="w-full rounded-md bg-dark-card px-4 py-3 text-white font-semibold text-black transition hover:bg-stone-800">
                      Add truck
                    </button>
                  </div>
                </aside>

                <div className="rounded-md border border-white/10 bg-dark-card">
                  <div className="border-b border-white/10 p-4">
                    <p className="text-sm font-semibold text-white">Fleet list</p>
                    <p className="mt-1 text-sm text-stone-500">{state.trucks.length} trucks registered</p>
                  </div>
                  {state.trucks.length === 0 ? (
                    <p className="p-6 text-sm text-stone-500">No trucks added yet.</p>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {state.trucks.map((truck, index) => (
                        <div key={truck.id} className="grid gap-4 p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center">
                          <p className="text-sm font-semibold text-white">{truck.id}</p>
                          <p className="text-sm text-stone-500">{truck.maxWeight} kg capacity</p>
                          <p className="text-sm text-stone-500">{truck.maxDistance} km daily</p>
                          <button
                            onClick={() => dispatch({type: 'REMOVE_TRUCK', payload: index})}
                            className="rounded border border-white/10 px-3 py-2 text-xs font-semibold text-stone-500 transition hover:border-rose-500/50 hover:text-rose-400"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3 border-t border-white/10 p-4">
                    <button onClick={() => dispatch({type: 'SET_STEP', payload: 'deliveries'})} className="rounded-md border border-white/20 px-4 py-3 text-sm font-semibold">
                      Back
                    </button>
                    <button
                      onClick={() => dispatch({type: 'SET_STEP', payload: 'calculate'})}
                      disabled={state.trucks.length === 0}
                      className="ml-auto rounded-md bg-dark-card px-5 py-3 text-white font-semibold text-black transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                    >
                      Review plan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {state.currentStep === 'calculate' && (
              <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                <aside className="rounded-md border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Step 4</p>
                  <h2 className="mt-3 text-2xl font-semibold">Calculate manifest</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-500">
                    The backend will cluster orders, sequence stops, and assign routes across available trucks.
                  </p>
                  <button
                    onClick={handleCalculateDispatch}
                    disabled={state.loading}
                    className="mt-6 w-full rounded-md bg-dark-card px-5 py-3 text-sm font-semibold text-black transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                  >
                    {state.loading ? 'Calculating...' : 'Calculate dispatch'}
                  </button>
                  <button onClick={() => dispatch({type: 'SET_STEP', payload: 'trucks'})} className="mt-3 w-full rounded-md border border-white/20 px-5 py-3 text-sm font-semibold">
                    Back to fleet
                  </button>
                </aside>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    ['Orders', state.deliveries.length],
                    ['Total weight', `${totalWeight.toFixed(1)} kg`],
                    ['Fleet size', state.trucks.length],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-md border border-white/10 bg-dark-card p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
                      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {state.showConfirmModal && state.dispatchResult && state.warehouse && (
        <DispatchConfirmModal
          result={state.dispatchResult}
          warehouse={state.warehouse}
          loading={state.loading}
          onSave={handleSaveDispatch}
          onRecalculate={() => {
            dispatch({type: 'HIDE_CONFIRM_MODAL'});
            dispatch({type: 'SET_STEP', payload: 'calculate'});
          }}
          onCancel={() => dispatch({type: 'HIDE_CONFIRM_MODAL'})}
        />
      )}
    </>
  );
}
