from pydantic import BaseModel, Field
from typing import List, Optional


class Order(BaseModel):
    id: str
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    weight: float = Field(gt=0)
    priority: int = Field(default=1, ge=1)
    is_assigned: bool = False   

class Truck(BaseModel):
    id: str
    max_weight_capacity: float = Field(gt=0)
    max_daily_distance: float = Field(gt=0)
    distance_used: float = Field(default=0.0, ge=0)

class RouteCluster(BaseModel):
    cluster_id: str
    orders: List[Order]
    total_weight: float = Field(ge=0)
    total_route_distance: float = Field(ge=0)
    
    def is_valid(self, max_capacity: float) -> bool:
        return self.total_weight <= max_capacity
