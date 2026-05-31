from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from models import Order, Truck
from cluster_engine import generate_route_clusters
from dispatcher import assign_routes_to_fleet
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
import crud
import uuid

app = FastAPI(title="Logistics Dispatch API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DispatchPayload(BaseModel):
    orders: List[Order]
    trucks: List[Truck]
    warehouse_lat: float
    warehouse_lng: float


class OrderCreate(BaseModel):
    id: str
    lat: float
    lng: float
    weight: float
    priority: int = 1


class TruckCreate(BaseModel):
    id: str
    max_weight_capacity: float
    max_daily_distance: float


@app.get("/")
def health_check():
    return {"status": "Engine is running perfectly"}


@app.post("/api/orders")
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    existing = crud.get_order(db, order.id)
    if existing:
        raise HTTPException(status_code=400, detail="Order already exists")
    db_order = crud.create_order(db, Order(**order.dict()))
    return {"id": db_order.id, "status": db_order.status}


@app.get("/api/orders")
def list_orders(status: str = None, db: Session = Depends(get_db)):
    orders = crud.get_orders(db, status)
    return [
        {
            "id": o.id,
            "lat": o.lat,
            "lng": o.lng,
            "weight": o.weight,
            "priority": o.priority,
            "status": o.status
        }
        for o in orders
    ]


@app.post("/api/trucks")
def create_truck(truck: TruckCreate, db: Session = Depends(get_db)):
    existing = crud.get_truck(db, truck.id)
    if existing:
        raise HTTPException(status_code=400, detail="Truck already exists")
    db_truck = crud.create_truck(db, Truck(**truck.dict()))
    return {"id": db_truck.id}


@app.get("/api/trucks")
def list_trucks(db: Session = Depends(get_db)):
    trucks = crud.get_trucks(db)
    return [
        {
            "id": t.id,
            "max_weight_capacity": t.max_weight_capacity,
            "max_daily_distance": t.max_daily_distance
        }
        for t in trucks
    ]


@app.post("/api/run-dispatch")
def execute_dispatch(payload: DispatchPayload, db: Session = Depends(get_db)):
    standard_truck_weight = payload.trucks[0].max_weight_capacity if payload.trucks else 1000.0
    
    generated_routes = generate_route_clusters(
        all_orders=payload.orders,
        truck_max_weight=standard_truck_weight,
        warehouse_lat=payload.warehouse_lat,
        warehouse_lng=payload.warehouse_lng
    )
    
    final_manifest = assign_routes_to_fleet(
        clusters=generated_routes,
        fleet=payload.trucks
    )
    
    return final_manifest


@app.post("/api/dispatch")
def save_dispatch(payload: DispatchPayload, db: Session = Depends(get_db)):
    standard_truck_weight = payload.trucks[0].max_weight_capacity if payload.trucks else 1000.0
    
    generated_routes = generate_route_clusters(
        all_orders=payload.orders,
        truck_max_weight=standard_truck_weight,
        warehouse_lat=payload.warehouse_lat,
        warehouse_lng=payload.warehouse_lng
    )
    
    final_manifest = assign_routes_to_fleet(
        clusters=generated_routes,
        fleet=payload.trucks
    )
    
    db_dispatch = crud.create_dispatch(db, payload.warehouse_lat, payload.warehouse_lng)
    
    for truck_id, clusters in final_manifest["fleet_assignments"].items():
        for cluster in clusters:
            for order in cluster.orders:
                crud.create_delivery_assignment(
                    db,
                    dispatch_id=db_dispatch.id,
                    truck_id=truck_id,
                    order_id=order.id,
                    cluster_id=cluster.cluster_id,
                    total_weight=cluster.total_weight,
                    total_distance=cluster.total_route_distance
                )
                crud.update_order_status(db, order.id, "assigned")
    
    return {
        "dispatch_id": db_dispatch.id,
        "fleet_assignments": final_manifest["fleet_assignments"],
        "failed_orders": final_manifest["failed_orders"]
    }


@app.get("/api/active-deliveries")
def get_active_deliveries(db: Session = Depends(get_db)):
    assignments = crud.get_active_assignments(db)
    result = {}
    
    for assignment in assignments:
        truck_id = assignment.truck_id
        if truck_id not in result:
            result[truck_id] = {
                "truck_id": truck_id,
                "orders": [],
                "total_weight": 0,
                "total_distance": 0,
                "status": "active"
            }
        result[truck_id]["orders"].append({
            "order_id": assignment.order_id,
            "cluster_id": assignment.cluster_id
        })
        result[truck_id]["total_weight"] += assignment.total_weight
        result[truck_id]["total_distance"] += assignment.total_distance
    
    return list(result.values())


@app.get("/api/dispatch-history")
def get_dispatch_history(db: Session = Depends(get_db)):
    dispatches = crud.get_dispatches(db, status="completed")
    result = []
    
    for dispatch in dispatches:
        assignments = crud.get_dispatch_assignments(db, dispatch.id)
        result.append({
            "dispatch_id": dispatch.id,
            "created_at": dispatch.created_at.isoformat(),
            "warehouse": {
                "lat": dispatch.warehouse_lat,
                "lng": dispatch.warehouse_lng
            },
            "total_assignments": len(assignments),
            "status": dispatch.status
        })
    
    return result


@app.post("/api/orders/{order_id}/complete")
def complete_order(order_id: str, db: Session = Depends(get_db)):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    updated_order = crud.update_order_status(db, order_id, "delivered")
    return {"id": updated_order.id, "status": updated_order.status}