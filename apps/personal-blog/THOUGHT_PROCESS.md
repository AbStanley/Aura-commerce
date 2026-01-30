# Thought Process & Architecture Decisions

This document outlines the reasoning behind the architectural choices made for the Personal Blog application.

## 1. Project Goal
The primary objective was to build a full-stack web application using **cutting-edge technologies** (.NET 10 & Angular 21) while adhering to specific constraints like **file-system storage** and **high-quality aesthetics**.

## 2. Architecture: Clean Architecture
I chose **Clean Architecture** for the backend to ensure longevity and testability.

-   **Why?**: It decouples the business logic (`Core`) from external concerns like the database or file system (`Infrastructure`).
-   **Benefit**: If we decide to switch from JSON files to a SQL Database later, we only need to write a new `SqlArticleRepository` in `Infrastructure` without touching a single line of the `Core` domain logic or the `API` controllers.

## 3. Technology Choices

### Backend: .NET 10 Web API
-   **Latest LTS**: leveraging the newest performance improvements in .NET.
-   **Minimal APIs vs Controllers**: I chose **Controllers** (`ArticlesController`) over Minimal APIs to provide a more structured, familiar pattern for a monorepo setup where clear separation of concerns is prioritized.

### Frontend: Angular 21
-   **Standalone Components**: Simplifies the mental model by removing `NgModules`. Every component imports exactly what it needs.
-   **Signals**: Used for state management (e.g., `articles = toSignal(...)`). This is the modern standard for reactivity in Angular, offering better performance and simpler syntax than RxJS `async` pipes for basic view binding.
-   **Vanilla CSS**: Instead of using a framework like Tailwind, I used native CSS variables and Flexbox/Grid to demonstrate that modern CSS is powerful enough to create premium "Glassmorphism" designs without extra build steps.

## 4. Specific Implementation Details

### Data Persistence (JSON Files)
-   **Constraint**: The requirements specified file system storage.
-   **Solution**: `JsonFileArticleRepository`.
-   **Trade-off**: While not performant for millions of records, it is perfect for a personal blog. It makes "backing up" the database as simple as copying the `data/` folder.

### Authentication
-   **Constraint**: "Basic or hardcoded".
-   **Implementation**: A simple `AuthController` that checks hardcoded credentials and returns a dummy token.
-   **Security Note**: In a production app, this would be replaced with ASP.NET Core Identity & JWT Bearer tokens. The current setup uses a "Guard" in Angular to simulate the protected routes UX.

## 5. User Experience (UX)
-   **Glassmorphism**: I used semi-transparent backgrounds with blur effects (`backdrop-filter: blur(10px)`). This gives the app a modern, premium feel compared to flat design.
-   **Feedback**: Loading states and error handling were implemented in the UI to ensure the user is never left wondering "is it working?".
