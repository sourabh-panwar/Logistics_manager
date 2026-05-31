from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime, ForeignKey, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import json

DATABASE_URL = "sqlite:///./logistics.db"

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False},
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class OrderDB(Base):
    __tablename__ = "orders"
    
    id = Column(String, primary_key=True, index=True)
    lat = Column(Float)
    lng = Column(Float)
    weight = Column(Float)
    priority = Column(Integer, default=1)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    assignments = relationship("DeliveryAssignmentDB", back_populates="order")


class TruckDB(Base):
    __tablename__ = "trucks"
    
    id = Column(String, primary_key=True, index=True)
    max_weight_capacity = Column(Float)
    max_daily_distance = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    assignments = relationship("DeliveryAssignmentDB", back_populates="truck")


class DispatchDB(Base):
    __tablename__ = "dispatches"
    
    id = Column(String, primary_key=True, index=True)
    warehouse_lat = Column(Float)
    warehouse_lng = Column(Float)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    assignments = relationship("DeliveryAssignmentDB", back_populates="dispatch")


class DeliveryAssignmentDB(Base):
    __tablename__ = "delivery_assignments"
    
    id = Column(String, primary_key=True, index=True)
    dispatch_id = Column(String, ForeignKey("dispatches.id"))
    truck_id = Column(String, ForeignKey("trucks.id"))
    order_id = Column(String, ForeignKey("orders.id"))
    cluster_id = Column(String)
    total_weight = Column(Float)
    total_distance = Column(Float)
    status = Column(String, default="assigned")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    dispatch = relationship("DispatchDB", back_populates="assignments")
    truck = relationship("TruckDB", back_populates="assignments")
    order = relationship("OrderDB", back_populates="assignments")


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()