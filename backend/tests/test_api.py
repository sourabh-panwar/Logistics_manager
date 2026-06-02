import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import main
from database import Base, get_db


@pytest.fixture()
def client(tmp_path):
    database_url = f"sqlite:///{tmp_path / 'test.db'}"
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    main.app.dependency_overrides[get_db] = override_get_db
    with TestClient(main.app) as test_client:
        yield test_client
    main.app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def test_dispatch_save_persists_orders_trucks_and_active_totals(client):
    payload = {
        "warehouse_lat": 28.6139,
        "warehouse_lng": 77.2090,
        "orders": [
            {"id": "ORDER-1", "lat": 28.62, "lng": 77.21, "weight": 120, "priority": 1},
            {"id": "ORDER-2", "lat": 28.63, "lng": 77.22, "weight": 180, "priority": 1},
        ],
        "trucks": [
            {"id": "TRUCK-1", "max_weight_capacity": 1000, "max_daily_distance": 10000}
        ],
    }

    dispatch_response = client.post("/api/dispatch", json=payload)
    assert dispatch_response.status_code == 200
    assert dispatch_response.json()["dispatch_id"]

    orders_response = client.get("/api/orders")
    trucks_response = client.get("/api/trucks")
    active_response = client.get("/api/active-deliveries")

    assert orders_response.status_code == 200
    assert trucks_response.status_code == 200
    assert active_response.status_code == 200
    assert len(orders_response.json()) == 2
    assert len(trucks_response.json()) == 1

    active = active_response.json()
    assert len(active) == 1
    assert active[0]["truck_id"] == "TRUCK-1"
    assert len(active[0]["orders"]) == 2
    assert active[0]["total_weight"] == pytest.approx(300)


def test_invalid_order_payload_returns_validation_error(client):
    response = client.post(
        "/api/orders",
        json={"id": "BAD", "lat": 95, "lng": 77.2, "weight": -5, "priority": 0},
    )

    assert response.status_code == 422
