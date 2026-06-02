# Logistics Manager

A full-stack dispatch planning system for delivery operations. The app lets an operator set a warehouse, add delivery points, register trucks, calculate a dispatch manifest, activate it, and then track active/completed assignments.

## What It Does

- Plans deliveries from a warehouse using order weight, priority, truck capacity, and daily distance limits.
- Groups nearby orders into route clusters.
- Sequences each route using a nearest-stop heuristic.
- Assigns routes to trucks while respecting distance and load constraints.
- Shows colored route lines on the map before dispatch activation.
- Persists dispatches, assignments, orders, and trucks in SQLite.
- Tracks active deliveries and completed dispatch history.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, Leaflet |
| Backend | FastAPI, Pydantic, SQLAlchemy |
| Database | SQLite |
| Testing | Pytest, FastAPI TestClient |

## Project Structure

```text
Logistics_manager/
  backend/
    main.py              # FastAPI app and routes
    database.py          # SQLite models and session setup
    crud.py              # Database operations
    models.py            # Pydantic domain models
    cluster_engine.py    # Order clustering logic
    route_optimizer.py   # Route sequencing and distance calculation
    dispatcher.py        # Truck assignment logic
    tests/               # Backend tests
  frontend/
    app/                 # Next.js pages
    components/          # Reusable UI and map components
    lib/                 # API client and shared types
```

## Main API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | Health check |
| `POST` | `/api/orders` | Create an order |
| `GET` | `/api/orders` | List orders |
| `POST` | `/api/trucks` | Create a truck |
| `GET` | `/api/trucks` | List trucks |
| `POST` | `/api/run-dispatch` | Calculate a dispatch without saving |
| `POST` | `/api/dispatch` | Save and activate a dispatch |
| `GET` | `/api/active-deliveries` | List active truck assignments |
| `GET` | `/api/dispatch-history` | List completed dispatches |
| `PUT` | `/api/dispatch-truck/{dispatch_id}/{truck_id}/complete` | Complete a truck assignment |

## Demo Flow

1. Open the dashboard.
2. Go to Dispatch.
3. Select the warehouse on the map.
4. Add delivery locations and weights.
5. Add trucks with capacity and distance limits.
6. Calculate the dispatch.
7. Review colored truck routes on the map.
8. Save and activate the manifest.
9. Open Active Deliveries and mark a truck complete.
10. Check Completed Dispatches after all assignments are delivered.

## Current Limitations

- Route optimization uses a heuristic, not a full vehicle-routing solver.
- Leaflet route lines are straight-line visualizations, not road-network paths.
- SQLite is suitable for demo/local use; production should use PostgreSQL.
- Authentication and driver-specific views are not implemented yet.

## Strong Future Upgrades

- Add OR-Tools for true vehicle-routing optimization.
- Integrate OSRM or GraphHopper for road distance and road geometry.
- Add CSV import/export for orders and fleet data.
- Add authentication with dispatcher and driver roles.
- Add analytics for truck utilization, delivery success rate, and distance saved.
