from sqlalchemy.orm import Session
from database import OrderDB, TruckDB, DispatchDB, DeliveryAssignmentDB
from models import Order, Truck
from datetime import datetime
import uuid


def create_order(db: Session, order: Order) -> OrderDB:
    db_order = OrderDB(
        id=order.id,
        lat=order.lat,
        lng=order.lng,
        weight=order.weight,
        priority=order.priority,
        status="pending"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


def get_orders(db: Session, status: str = None):
    query = db.query(OrderDB)
    if status:
        query = query.filter(OrderDB.status == status)
    return query.all()


def get_order(db: Session, order_id: str):
    return db.query(OrderDB).filter(OrderDB.id == order_id).first()


def update_order_status(db: Session, order_id: str, status: str):
    db_order = get_order(db, order_id)
    if db_order:
        db_order.status = status
        db_order.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_order)
    return db_order


def create_truck(db: Session, truck: Truck) -> TruckDB:
    db_truck = TruckDB(
        id=truck.id,
        max_weight_capacity=truck.max_weight_capacity,
        max_daily_distance=truck.max_daily_distance
    )
    db.add(db_truck)
    db.commit()
    db.refresh(db_truck)
    return db_truck


def get_trucks(db: Session):
    return db.query(TruckDB).all()


def get_truck(db: Session, truck_id: str):
    return db.query(TruckDB).filter(TruckDB.id == truck_id).first()


def create_dispatch(db: Session, warehouse_lat: float, warehouse_lng: float) -> DispatchDB:
    dispatch_id = str(uuid.uuid4())
    db_dispatch = DispatchDB(
        id=dispatch_id,
        warehouse_lat=warehouse_lat,
        warehouse_lng=warehouse_lng,
        status="active"
    )
    db.add(db_dispatch)
    db.commit()
    db.refresh(db_dispatch)
    return db_dispatch


def get_dispatch(db: Session, dispatch_id: str):
    return db.query(DispatchDB).filter(DispatchDB.id == dispatch_id).first()


def get_dispatches(db: Session, status: str = None):
    query = db.query(DispatchDB)
    if status:
        query = query.filter(DispatchDB.status == status)
    return query.all()


def create_delivery_assignment(
    db: Session,
    dispatch_id: str,
    truck_id: str,
    order_id: str,
    cluster_id: str,
    total_weight: float,
    total_distance: float
) -> DeliveryAssignmentDB:
    assignment_id = str(uuid.uuid4())
    db_assignment = DeliveryAssignmentDB(
        id=assignment_id,
        dispatch_id=dispatch_id,
        truck_id=truck_id,
        order_id=order_id,
        cluster_id=cluster_id,
        total_weight=total_weight,
        total_distance=total_distance,
        status="assigned"
    )
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment


def get_active_assignments(db: Session):
    return db.query(DeliveryAssignmentDB).filter(
        DeliveryAssignmentDB.status.in_(["assigned", "in_transit"])
    ).all()


def get_dispatch_assignments(db: Session, dispatch_id: str):
    return db.query(DeliveryAssignmentDB).filter(
        DeliveryAssignmentDB.dispatch_id == dispatch_id
    ).all()


def update_assignment_status(db: Session, assignment_id: str, status: str):
    db_assignment = db.query(DeliveryAssignmentDB).filter(
        DeliveryAssignmentDB.id == assignment_id
    ).first()
    if db_assignment:
        db_assignment.status = status
        db_assignment.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_assignment)
    return db_assignment


def mark_dispatch_completed(db: Session, dispatch_id: str):
    db_dispatch = get_dispatch(db, dispatch_id)
    if db_dispatch:
        db_dispatch.status = "completed"
        db_dispatch.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_dispatch)
    return db_dispatch