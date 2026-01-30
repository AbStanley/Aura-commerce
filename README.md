# .NET Coding Challenges Monorepo

This repository contains a collection of backend coding challenges and applications implemented in **C# / .NET 10**.

## 🏗 Project Structure

This is a Monorepo managed by a single solution file.

```text
/
├── apps/
│   ├── task-cli/            # Task Tracker CLI Application
│   └── ... (future apps)
├── CodingChallenges.sln     # Root Solution
├── GEMINI.md                # Development Guidelines
└── README.md                # Documentation
```

## 🚀 Applications

### 1. Task Tracker CLI (`task-cli`)
A simple command-line interface to track and manage tasks, demonstrating Clean Architecture and SOLID principles.

**How to Run:**

Option 1: **From the Root** (Recommended for quick checks)
```bash
# Interactive Mode
dotnet run --project apps/task-cli/TaskTracker.csproj

# Single Command
dotnet run --project apps/task-cli/TaskTracker.csproj -- add "New Task"
```

Option 2: **From the App Directory** (Recommended for development)
```bash
cd apps/task-cli
dotnet run
```

**Features:**
- Add, List, Update, Delete tasks.
- Interactive REPL mode.
- JSON file persistence.

## 🛠 Technology Stack

- **Framework**: .NET 10.0
- **Language**: C# 12+
- **Architecture**:
  - Clean Architecture (Domain, Application, Infrastructure)
  - SOLID Principles
  - Dependency Injection
  - Command Pattern

## 👨‍💻 Development

1. Create a new project under `apps/`.
2. Add it to the solution: `dotnet sln add apps/NewApp/NewApp.csproj`.
3. Follow the guidelines in `GEMINI.md`.
