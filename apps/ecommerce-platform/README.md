# 🛒 .NET 10 Microservices E-Commerce Platform

![Status](https://img.shields.io/badge/Status-Operational-success?style=for-the-badge)
![.NET](https://img.shields.io/badge/.NET-10.0-512bd4?style=for-the-badge&logo=dotnet)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ed?style=for-the-badge&logo=docker)
![Architecture](https://img.shields.io/badge/Architecture-Clean%20%2B%20Event--Driven-orange?style=for-the-badge)

Welcome to the **E-Commerce Microservices Platform**, a state-of-the-art reference implementation built on **.NET 10**. This project demonstrates how to build a scalable, resilient, and enterprise-grade distributed system using modern best practices.

> **🚀 [View Roadmap to Senior Engineering Standards](./TODO.md)**: Check out the plan to elevate this project from 7/10 to 10/10 (Testing, Resilience, CI/CD).

---

## 🏗️ High-Level Architecture

The system follows a **Clean Architecture** approach within each microservice, orchestrated by an **Event-Driven** backbone using RabbitMQ and MassTransit.

```mermaid
graph TD
    User((User/Client))
    Gateway[⚡ YARP API Gateway]
    
    subgraph "Core Services"
        Auth[🔒 User Service]
        Catalog[📦 Product Service]
        Cart[🛒 Cart Service]
        Order[📜 Order Service]
        Payment[💳 Payment Service]
        Notify[🔔 Notification Service]
    end

    subgraph "Infrastructure"
        DB[(🐘 PostgreSQL)]
        Cache[(🔴 Redis)]
        Bus{🐇 RabbitMQ}
        Logs[📝 Seq]
    end

    User -->|HTTP/REST| Gateway
    Gateway -->|Proxy| Auth
    Gateway -->|Proxy| Catalog
    Gateway -->|Proxy| Cart
    Gateway -->|Proxy| Order
    
    Auth --> DB
    Catalog --> DB
    Order --> DB
    Payment --> DB
    Notify --> DB
    
    Cart --> Cache
    
    Order -->|Publishes: OrderPlaced| Bus
    Bus -->|Consumes| Payment
    Payment -->|Publishes: PaymentProcessed| Bus
    Bus -->|Consumes| Order
    Bus -->|Consumes| Notify
    
    style Gateway fill:#f9f,stroke:#333,stroke-width:2px
    style Bus fill:#ff9,stroke:#333,stroke-width:2px
```

### 🧠 The Thinking Process
*   **Monorepo Strategy**: All services live in one repo for easier dependency management (`Shared` libraries) and unified CI/CD, while maintaining strict deployment isolation.
*   **Clean Architecture**: Each service is divided into `Domain` (Core), `Application` (Use Cases), `Infrastructure` (Db/Bus), and `API` (Entry). This ensures technology independence for the core logic.
*   **Resilience First**: Implemented **Polly** retries for Database and Message Bus failures. The system is designed to "self-heal" during transient outages.
*   **Observability**: Centralized logging via **Seq** and **Serilog** ensures you can trace a request from Gateway -> Service -> Database -> Event Bus -> Consumer in one view.

---

## 🛠️ Technology Stack

| Category | Technology | Usage |
| :--- | :--- | :--- |
| **Framework** | **.NET 10** | Latest performance features & C# 14 syntax. |
| **Containerization** | **Docker & Compose** | One-command startup for entire stack. |
| **Gateway** | **YARP** | High-performance reverse proxy & rate limiting. |
| **Database** | **PostgreSQL & EF Core** | Relational data with Code-First migrations. |
| **Caching** | **Redis** | High-speed shopping cart storage. |
| **Messaging** | **MassTransit (RabbitMQ)** | Robust event bus for async workflows. |
| **Auth** | **OpenIddict & JWT** | Secure OAuth2/OpenID Connect flow. |
| **Logging** | **Serilog & Seq** | Structured logging and centralization. |

---

## 🚀 Quick Start Guide

### Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed & running.
*   (Optional) [.NET 10 SDK](https://dotnet.microsoft.com/download) for local dev.

### One-Command Launch
Run the entire platform (Infrastructure + 7 Services) with:

```powershell
docker-compose -f apps/ecommerce-platform/docker-compose.yml up -d --build
```

> **First Run Note**: The `ecommerce-seq` container usually takes 10-20 seconds to initialize.

### 🔍 Access Points

| Component | Base URL | Interactive Docs (Scalar) | Credentials |
| :--- | :--- | :--- | :--- |
| **API Gateway** | [http://localhost:5000](http://localhost:5000) | [Open Docs](http://localhost:5000/scalar/v1) | N/A |
| **User Service** | [http://localhost:5001](http://localhost:5001) | [Open Docs](http://localhost:5001/scalar/v1) | N/A |
| **Product Service** | [http://localhost:5002](http://localhost:5002) | [Open Docs](http://localhost:5002/scalar/v1) | N/A |
| **Cart Service** | [http://localhost:5003](http://localhost:5003) | [Open Docs](http://localhost:5003/scalar/v1) | N/A |
| **Order Service** | [http://localhost:5004](http://localhost:5004) | [Open Docs](http://localhost:5004/scalar/v1) | N/A |
| **Payment Service** | [http://localhost:5005](http://localhost:5005) | [Open Docs](http://localhost:5005/scalar/v1) | N/A |
| **Notify Service** | [http://localhost:5006](http://localhost:5006) | [Open Docs](http://localhost:5006/scalar/v1) | N/A |
| **Seq Logs** | [http://localhost:8091](http://localhost:8091) | [Dashboard](http://localhost:8091) | `admin` / `password` |
| **RabbitMQ** | [http://localhost:15672](http://localhost:15672) | [Dashboard](http://localhost:15672) | `guest` / `guest` |

> **📖 Aggregated API Documentation**: Access **all** microservice APIs from a single page at [**http://localhost:5000/api-docs**](http://localhost:5000/api-docs)

---

## �️ Frontend Developer Guide

> **TL;DR**: Your `API_BASE_URL` is always `http://localhost:5000`. You never need to know the other ports exist.

### How the Gateway Works

```
Your Frontend App (React/Angular/Vue)
        │
        ▼
   localhost:5000  ← API Gateway (the only URL you need)
        │
        ├─── /api/auth/*        → User Service
        ├─── /api/users/*       → User Service
        ├─── /api/products/*    → Product Service
        ├─── /api/cart/*        → Cart Service
        ├─── /api/orders/*      → Order Service
        ├─── /api/payments/*    → Payment Service
        └─── /api/notifications/* → Notification Service
```

### Example Usage

```javascript
// ✅ CORRECT - All requests go through the Gateway
const API_BASE = 'http://localhost:5000';

await fetch(`${API_BASE}/api/auth/login`, { method: 'POST', body: credentials });
await fetch(`${API_BASE}/api/products`);
await fetch(`${API_BASE}/api/cart/${userId}/items`, { method: 'POST', body: item });
```

### Why Use the Gateway?

| Benefit | Description |
|---------|-------------|
| **Single endpoint** | Only one URL to configure in your app |
| **Authentication** | JWT validation happens at the Gateway |
| **CORS** | Configured once at the Gateway |
| **Production-ready** | In production, only the Gateway is exposed to the internet |

> ⚠️ The individual service ports (5001-5006) are exposed in Docker for **debugging only**. Never use them in your frontend code.

---

## 🔌 API Endpoints

### **User Service**
*   `POST /api/auth/register` - Create a new account.
*   `POST /api/auth/login` - Get Access Token.

### **Product Service**
*   `GET /api/products` - List all products.
*   `POST /api/products` - Create product (Admin).

### **Cart Service**
*   `GET /api/cart/{userId}` - Get cart.
*   `POST /api/cart/{userId}/items` - Add item.

### **Order Service**
*   `POST /api/orders` - Submit an order (Triggers Saga).
*   `GET /api/orders` - View order history.

---

## 🧪 Development Workflow

### Building Locally
If you want to code without Docker:
```bash
dotnet build apps/ecommerce-platform/ECommercePlatform.sln
```

### Running Tests
Unit tests run automatically in CI, but you can trigger them manually:
```bash
dotnet test apps/ecommerce-platform/ECommercePlatform.sln
```

### CI/CD
*   Pipeline is defined in `.github/workflows/ci-cd.yml`.
*   Automatically builds, tests, and validates Docker images on every push to `main`.

---

---

## 🧪 Testing

The solution includes a comprehensive "Test Pyramid" ensuring quality at all levels.

### 1. Unit Tests (Business Logic)
Fast, isolated tests for Domain Entities and Application Handlers.
```bash
# Run all unit tests
dotnet test apps/ecommerce-platform/services/OrderService/OrderService.UnitTests
dotnet test apps/ecommerce-platform/services/ShoppingCartService/ShoppingCartService.UnitTests
```

### 2. Integration Tests (Component Wiring)
Uses **Testcontainers** to spin up real PostgreSQL and RabbitMQ instances for testing API endpoints.
*   **Requirements**: Docker Desktop must be running.
*   **What it tests**: API Controllers -> Database/Broker interaction.
```bash
dotnet test apps/ecommerce-platform/tests/ECommerce.IntegrationTests
```

### 3. End-to-End (E2E) Tests (Full System Flow)
The golden path verification. These tests automatically:
1.  Spin up the **entire** microservices mesh (Gateway + 7 Services) using `docker compose`.
2.  Wait for the system to be healthy.
3.  Simulate a real user journey (Register -> Login -> Shop -> Checkout -> Order Confirmed).
4.  Tear down the environment.

```bash
# Verify the entire platform (takes ~2-3 mins)
dotnet test apps/ecommerce-platform/tests/ECommerce.E2E.Tests
```

> **Legacy/Manual Verification**: You can still use the PowerShell script for manual verification if preferred:
> ```powershell
> ./apps/ecommerce-platform/verify.ps1
> ```

### 🩺 Health Checks
Check the status of all services:
```bash
curl http://localhost:5000/health
```

---

## 📜 License
This project uses **MassTransit v8.3.6** (Apache 2.0) to remain fully open-source and free for production use.
