# Task Tracker CLI

A simple command-line interface (CLI) to track and manage your tasks. Built with C# and .NET.

## Features

- Add, Update, and Delete tasks
- Mark tasks as in-progress or done
- List all tasks
- Filter tasks by status (todo, in-progress, done)
- Persistent storage using JSON

## Usage

### Running from the Root (Monorepo)

You can run this application from the root of the repository:

```bash
# Interactive Mode
dotnet run --project apps/task-cli/TaskTracker.csproj

# Single Command
dotnet run --project apps/task-cli/TaskTracker.csproj -- list
```

### Running from this Directory

Navigate to this directory to run commands more simply:

```bash
cd apps/task-cli

# Interactive Mode
dotnet run

# Single Command
dotnet run -- add "Buy groceries"
```

## Commands Reference

| Command | Description | Example |
|---------|-------------|---------|
| `add` | Add a new task | `add "Task Description"` |
| `update` | Update a task description | `update 1 "New Description"` |
| `delete` | Delete a task | `delete 1` |
| `mark-in-progress` | Set status to in-progress | `mark-in-progress 1` |
| `mark-done` | Set status to done | `mark-done 1` |
| `list` | List all tasks | `list` |
| `list <status>` | List tasks by status | `list todo` |

## Project Structure

- **Domain/**: `TaskItem` (Record), `ITaskRepository` (Interface).
- **Infrastructure/**: `FileTaskRepository` (JSON implementation).
- **Application/Commands/**: logic for each CLI command.
- **Program.cs**: Entry point.
- **tasks.json**: Local data store (Git ignored).
