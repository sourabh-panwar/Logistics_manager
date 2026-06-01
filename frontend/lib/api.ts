import axios from 'axios';
import {Order, Truck, DispatchResult, DeliveryAssignment, CompletedDispatch} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const orderAPI = {
  create: (order: Order) => api.post('/api/orders', order),
  list: (status?: string) => api.get('/api/orders', {params: {status}}),
  complete: (orderId: string) => api.post(`/api/orders/${orderId}/complete`),
};

export const truckAPI = {
  create: (truck: Truck) => api.post('/api/trucks', truck),
  list: () => api.get('/api/trucks'),
};

export const dispatchAPI = {
  calculate: (data: {
    orders: Order[];
    trucks: Truck[];
    warehouse_lat: number;
    warehouse_lng: number;
  }) => api.post('/api/run-dispatch', data),
  
  save: (data: {
    orders: Order[];
    trucks: Truck[];
    warehouse_lat: number;
    warehouse_lng: number;
  }) => api.post('/api/dispatch', data),
  
  getActive: () => api.get('/api/active-deliveries'),
  getHistory: () => api.get('/api/dispatch-history'),
  
  completeAssignment: (assignmentId: string) => api.put(`/api/assignments/${assignmentId}/complete`),
  
  completeDispatchTruck: (dispatchId: string, truckId: string) =>
    api.put(`/api/dispatch-truck/${dispatchId}/${truckId}/complete`),
};

export default api;