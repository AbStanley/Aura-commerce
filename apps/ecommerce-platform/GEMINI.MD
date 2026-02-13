# .NET Microservices E-Commerce - Guidelines

## 1. Project Philosophy
- **Microservices Architecture**: This project demonstrates a distributed system using independently deployable services.
- **Clean Architecture Strictness**: deeply enforced separation of concerns. Domain layers MUST be pure (no infrastructure dependencies).
- **Event-Driven**: Services communicate asynchronously via RabbitMQ/MassTransit.

## 2. Directory Structure
```text
apps/ecommerce-platform/
├── gateway/               # YARP API Gateway
├── services/              # Microservices (User, Order, Product, etc.)
├── shared/                # Shared libraries
│   ├── Shared.Domain/         # Pure Domain logic (BaseEntity, ValueObjects)
│   ├── Shared.Contracts/      # Public DTOs and Messages
│   └── Shared.Infrastructure/ # Cross-cutting concerns (EF, MassTransit)
├── docker-compose.yml     # Orchestration
└── ECommercePlatform.sln  # Solution file
```

## 3. Architecture & Design Patterns
- **Layering**:
  - `Domain`: Pure C# objects, Rules, Aggregate Roots. **Dependencies: None**.
  - `Application`: Use Cases, CQRS (MediatR). **Dependencies: Domain**.
  - `Infrastructure`: Implementation of interfaces (EF Core, Repositories). **Dependencies: Application, Domain**.
  - `API`: Controllers/Endpoints. **Dependencies: Application, Infrastructure**.
- **Data Access**: PostreSQL with EF Core (Code-First).
- **Resilience**: Polly policies for all external calls.

## 4. Technology Stack (Standard)
- **Framework**: .NET 10.0 (C# 14)
- **Containerization**: Docker (Alpine based images)
- **Orchestration**: Docker Compose (Local), Kubernetes (Production - planned)
- **Messaging**: RabbitMQ (MassTransit)
- **Gateway**: YARP
- **Observability**: Serilog + Seq

## 5. Development Rules
- **Dependencies**: 
  - Domain projects MUST NOT reference `Shared.Infrastructure` or any NuGet packages containing infrastructure concerns.
  - Use `Shared.Domain` for common base entities.
- **Testing**: 
  - Unit Tests: Handlers and Domain Logic.
  - Integration Tests: Use `Testcontainers` (PostDb + Rabbit).
  - E2E Tests: Use `ECommerce.E2E.Tests` (automates `verify.ps1`).
