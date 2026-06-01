export interface Order {
  id: string;
  lat: number;
  lng: number;
  weight: number;
  priority: number;
  is_assigned?: boolean;
}

export interface Truck {
  id: string;
  max_weight_capacity: number;
  max_daily_distance: number;
  distance_used?: number;
}

export interface RouteCluster {
  cluster_id: string;
  orders: Order[];
  total_weight: number;
  total_route_distance: number;
}

export interface DispatchResult {
  fleet_assignments: Record<string, RouteCluster[]>;
  failed_orders: Order[];
  rejected_orders?: Order[];
  dispatch_id?: string;
}

export interface DeliveryAssignment {
  assignment_id?: string;
  truck_id: string;
  dispatch_id?: string;
  orders: Array<{assignment_id?: string; order_id: string; cluster_id: string}>;
  total_weight: number;
  total_distance: number;
  status: string;
}

export interface CompletedDispatch {
  dispatch_id: string;
  created_at: string;
  warehouse: {lat: number; lng: number};
  total_assignments: number;
  status: string;
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface DispatchStep {
  number: number;
  label: string;
  completed: boolean;
}