# Dhaka Tesla Pool System

> **"Share a seat. Split the fare. Survive Dhaka traffic."**

Dhaka Tesla Pool is aride-pooling platform engineered specifically for Dhaka's unique urban mobility ecosystem. The system pairs passengers along overlapping traffic corridors (e.g. Banani Road 11 to Mohakhali / Gulshan 1) into shared three-seater electric vehicles while guaranteeing strict seat capacity enforcement, transparent individual fare calculation, and explicit ride state lifecycles.

---

## The Banani Rush-Hour Story & Demo Cast

It's 8:41 AM on Banani Road 11. **Jashim** is ready in **Bullet**, his battery-powered 3-seat electric Tesla vehicle. 

- **Nusrat** requests a ride from **Banani Road 11 to Mohakhali**.
- **Rafiq** requests a matching trip from **Banani Road 11 to Gulshan 1**.
- The system automatically matches Nusrat and Rafiq into Bullet's pool (2 of 3 seats occupied), applying a 20% shared pool discount to both fares.
- **Shirin** attempts to book the 3rd seat from **Banani Road 11 to Farmgate**.
- When a 4th passenger attempts to request, the system's transaction locks block the request with a `409 POOL_FULL` error, preserving Bullet's strict 3-seat capacity limit.

---

## System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Browser)"]
        UI["Next.js App Router (React 19, Tailwind CSS)"]
    end

    subgraph API ["Backend API Layer (Node.js 22)"]
        Fastify["Fastify 5 API Server"]
        Cors["@fastify/cors & @fastify/helmet"]
        AuthPlugin["Better Auth Integration"]
        ZodValidator["Zod Input Validation Schema"]
        PrismaClient["Prisma 7 Client (@prisma/adapter-pg)"]
    end

    subgraph DB ["Database Layer"]
        Postgres["PostgreSQL 17 Database"]
    end

    UI -->|REST / HTTP JSON| Fastify
    Fastify --> Cors
    Fastify --> AuthPlugin
    Fastify --> ZodValidator
    Fastify --> PrismaClient
    PrismaClient -->|Native PG Connection| Postgres
```

---

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o{ Vehicle : "owns"
    User ||--o{ RideRequest : "requests"
    User ||--o{ Pool : "creates (Driver)"
    User ||--o{ PoolMembership : "joins"
    User ||--o{ Fare : "pays"
    
    Vehicle ||--o{ Pool : "assigned to"
    
    RideRequest ||--o{ PoolMembership : "linked to"
    
    Pool ||--o{ PoolMembership : "contains"
    Pool ||--o{ RideHistory : "tracks transitions"
    Pool ||--o{ Fare : "generates"

    User {
        string id PK
        string name
        string email
        string role
    }

    Vehicle {
        string id PK
        string ownerId FK
        string type
        int capacity
    }

    RideRequest {
        string id PK
        string userId FK
        string origin
        string destination
        string status
    }

    Pool {
        string id PK
        string vehicleId FK
        string creatorId FK
        int capacity
        string state
    }

    PoolMembership {
        string id PK
        string poolId FK
        string userId FK
        string rideRequestId FK
        string status
    }

    Fare {
        string id PK
        string poolId FK
        string userId FK
        decimal amount
        json calculationData
    }

    RideHistory {
        string id PK
        string poolId FK
        string oldState
        string newState
        string changedBy
    }
```

---

## Fare Calculation & Monetary Storage Rationale

### 1. Fare Model Formula
Every pooled passenger receives an individual, transparent fare calculated using:

`passengerFare = baseFare + distanceCharge - poolDiscount`

- **Base Fare**: 80 BDT
- **Distance Charge**: 40 to 60 BDT (based on zone distance e.g. Banani to Mohakhali = 60, Banani to Gulshan 1 = 40)
- **Pool Discount**: 20% discount on total trip price when sharing a ride in Bullet

### 2. Monetary Storage: Integer Poysha vs Decimal
We store money in integer **Poysha / Paisa** (1 BDT = 100 Poysha) in backend calculations:
- **Why?** IEEE 754 floating-point arithmetic (e.g. `0.1 + 0.2 = 0.30000000000000004`) causes accumulative rounding errors in financial ledgers.
- Storing total as `11200 Poysha` ensures exact integer math during payment splitting, fare refunds, and driver payout aggregation without fractional loss.

---

## Ride Lifecycle & Concurrency Control

### State Transition Machine
```text
[REQUESTED] --> [MATCHED/ACCEPTED] --> [DRIVER_ARRIVED] --> [STARTED] --> [COMPLETED]
     |                   |                      |                 |
     +-------------------+----------------------+-----------------+--> [CANCELLED]
```
Invalid transitions (e.g. `COMPLETED` -> `STARTED`) are rejected with `400 AppError (INVALID_STATE_TRANSITION)`.

### Concurrency & Capacity Enforcement
When Nusrat and Shirin attempt to book the final available seat simultaneously:
1. `createMembership` runs inside an isolated Prisma Database Transaction (`prisma.$transaction`).
2. The transaction inspects `pool.memberships.length < pool.capacity`.
3. The first request commits atomically; the second request encounters `pool.memberships.length >= pool.capacity` and immediately fails with `409 AppError (POOL_FULL)`.

---

## Technology Choices & Justification

| Layer / Tool | Selected Choice | Realistic Alternatives | Engineering Rationale |
| :--- | :--- | :--- | :--- |
| **Backend** | Fastify 5 + Node.js 22 | Express, NestJS | High HTTP throughput, lower latency overhead, low memory footprint suitable for real-time ride matching. |
| **Database** | PostgreSQL 17 | MongoDB, MySQL | Relational integrity, ACID transaction support required for seat capacity concurrency and foreign key constraints. |
| **ORM** | Prisma 7.10 | TypeORM, Drizzle | Type-safe query builder, auto-generated TypeScript types, native pg adapter integration. |
| **Frontend** | Next.js 15 (App Router) | React + Vite | Server/Client components, built-in routing, fast SSR/SSG compilation for passenger & driver dashboards. |
| **Validation** | Zod 4 | Yup, Joi | TypeScript-first schema inference seamlessly shared between HTTP handlers and services. |
| **Testing** | Vitest 5 | Jest | Ultra-fast ESM-native test runner with instant hot-module re-execution. |

---

## Quick Start & Setup Instructions

### Prerequisites
- Node.js >= 22.x
- pnpm >= 10.x
- Docker & Docker Compose

### 1. Run with Docker Compose (Recommended)
```bash
# Clone and build containers
docker compose up --build
```
- Web UI: `http://localhost:3000`
- API Health Check: `http://localhost:4000/health`

### 2. Manual Local Setup
```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

# Run database migration & seed story cast
cd apps/api
pnpm prisma migrate dev
pnpm prisma db seed

# Run backend API
pnpm run dev

# Run frontend web (in root or apps/web)
cd ../web
pnpm run dev
```

### 3. Run Test Suite
```bash
cd apps/api
pnpm run test
```

---




*Dhaka Tesla Pool System — Production-minded Engineering for Dhaka's Urban Transit.*
