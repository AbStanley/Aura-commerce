# Personal Blog (.NET 10 + Angular 21)

A modern, full-stack personal blogging platform built to demonstrate the capabilities of the latest .NET and Angular versions.

## 🚀 Tech Stack

-   **Backend**: .NET 10 Web API
    -   **Clean Architecture**: strict separation of Core, Infrastructure, and API.
    -   **Persistence**: File-system based JSON storage (as per requirements).
    -   **Auth**: Simple custom authentication.
-   **Frontend**: Angular 21
    -   **Standalone Components**: No NgModules.
    -   **Signals**: Modern state management.
    -   **Styling**: Vanilla CSS with Glassmorphism aesthetic.

## 📂 Structure

```text
apps/personal-blog/
├── api/             # .NET 10 Web API
├── web/             # Angular 21 Client
└── THOUGHT_PROCESS.md # Design & Decision Log
```

## 🛠️ Getting Started

### Prerequisites
-   .NET 10.0 SDK
-   Node.js 20+

### 1. Run the Backend
The API runs on port **5000**.
```bash
dotnet run --project apps/personal-blog/api/PersonalBlog.Api/PersonalBlog.Api.csproj
```

### 2. Run the Frontend
The Angular app runs on port **4200**.
```bash
cd apps/personal-blog/web
npx ng serve
```

## ✨ Features

-   **Public Blog**: Guests can view all published articles.
-   **Admin Dashboard**: secure area to manage content.
-   **Editor**: Create and edit articles with a simple UI.
-   **Data Persistence**: Articles are saved as `.json` files in `apps/personal-blog/api/data/`.
