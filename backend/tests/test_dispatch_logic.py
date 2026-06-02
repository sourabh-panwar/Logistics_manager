import pytest

from dispatcher import assign_routes_to_fleet
from models import Order, RouteCluster, Truck
from route_optimizer import calculate_distance, optimize_route_sequence


def test_haversine_distance_uses_real_kilometers():
    delhi_lat, delhi_lng = 28.6139, 77.2090
    gurgaon_lat, gurgaon_lng = 28.4595, 77.0266

    distance = calculate_distance(delhi_lat, delhi_lng, gurgaon_lat, gurgaon_lng)

    assert distance == pytest.approx(24.8, rel=0.15)


def test_route_optimizer_returns_to_warehouse():
    warehouse = (28.6139, 77.2090)
    orders = [
        Order(id="O1", lat=28.62, lng=77.21, weight=10),
        Order(id="O2", lat=28.63, lng=77.22, weight=20),
    ]

    sequence, total_distance = optimize_route_sequence(orders, warehouse[0], warehouse[1])

    assert [order.id for order in sequence] == ["O1", "O2"]
    assert total_distance > 0


def test_assigner_skips_trucks_that_cannot_carry_cluster_weight():
    cluster = RouteCluster(
        cluster_id="ROUTE-1",
        orders=[Order(id="O1", lat=28.61, lng=77.20, weight=900)],
        total_weight=900,
        total_route_distance=40,
    )
    fleet = [
        Truck(id="SMALL", max_weight_capacity=500, max_daily_distance=500),
        Truck(id="LARGE", max_weight_capacity=1000, max_daily_distance=500),
    ]

    result = assign_routes_to_fleet([cluster], fleet)

    assert result["fleet_assignments"]["SMALL"] == []
    assert result["fleet_assignments"]["LARGE"] == [cluster]
    assert result["failed_orders"] == []


def test_assigner_reports_failed_orders_when_distance_is_not_available():
    cluster = RouteCluster(
        cluster_id="ROUTE-1",
        orders=[Order(id="O1", lat=28.61, lng=77.20, weight=100)],
        total_weight=100,
        total_route_distance=600,
    )
    fleet = [Truck(id="TRUCK-1", max_weight_capacity=1000, max_daily_distance=100)]

    result = assign_routes_to_fleet([cluster], fleet)

    assert result["fleet_assignments"]["TRUCK-1"] == []
    assert [order.id for order in result["failed_orders"]] == ["O1"]
    assert result["failed_orders"][0].priority == 2
