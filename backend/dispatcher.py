from typing import List, Dict, Any
from models import Truck, RouteCluster, Order

def assign_routes_to_fleet(clusters: List[RouteCluster], fleet: List[Truck], max_truck_capacity: float = None) -> Dict[str, Any]:
    if max_truck_capacity is None and fleet:
        max_truck_capacity = max(truck.max_weight_capacity for truck in fleet)
    
    # Pre-filter clusters and orders that exceed max truck capacity
    valid_clusters = []
    rejected_orders = []
    
    for cluster in clusters:
        if max_truck_capacity and cluster.total_weight > max_truck_capacity:
            rejected_orders.extend(cluster.orders)
        else:
            valid_clusters.append(cluster)
    
    sorted_clusters = sorted(valid_clusters, key=lambda c: c.total_route_distance, reverse=True)

    assignments = {truck.id: [] for truck in fleet}
    failed_orders = []

    for cluster in sorted_clusters:
        assigned = False
        
        for truck in fleet:
            remaining_distance = truck.max_daily_distance - truck.distance_used
            remaining_capacity = truck.max_weight_capacity
            
            if cluster.total_weight <= remaining_capacity and cluster.total_route_distance <= remaining_distance:
                assignments[truck.id].append(cluster)
                truck.distance_used += cluster.total_route_distance
                
                for order in cluster.orders:
                    order.is_assigned = True
                    
                assigned = True
                break
        
        if not assigned:
            for order in cluster.orders:
                order.priority += 1  
                failed_orders.append(order)

    return {
        "fleet_assignments": assignments,
        "failed_orders": failed_orders,
        "rejected_orders": rejected_orders
    }
