# Task Tracker CLI

A simple command-line interface (CLI) to track and manage your tasks. Built with C# and .NET.

## Features

- Add, Update, and Delete tasks
- Mark tasks as in-progress or done
- List all tasks
- Filter tasks by status (todo, in-progress, done)
- Persistent storage using JSON

## Prerequisites

- .NET SDK (Version 8.0 or later recommended)

## Installation

1. Clone the repository.
2. Navigate to the project directory:
   ```bash
   cd task-tracker
   ```
3. Build the project:
   ```bash
   dotnet build
   ```

## Usage

You can run the application using `dotnet run` followed by the command and arguments.

### Commands

**Add a new task**
```bash
dotnet run -- add "Buy groceries"
```

**Update a task**
```bash
dotnet run -- update <id> "Buy groceries and cook dinner"
```

**Delete a task**
```bash
dotnet run -- delete <id>
```

**Mark a task as in-progress**
```bash
dotnet run -- mark-in-progress <id>
```

**Mark a task as done**
```bash
dotnet run -- mark-done <id>
```

**List all tasks**
```bash
dotnet run -- list
```

**List tasks by status**
```bash
dotnet run -- list todo
dotnet run -- list in-progress
dotnet run -- list done
```

## task-cli Alias

To use the command `task-cli` as shown in the project description, you can create an alias or build a standalone executable.

**Creating an alias (PowerShell)**:
```powershell
function task-cli { dotnet run --project "path\to\TaskTracker.csproj" -- $args }
```

**Creating an alias (Bash)**:
```bash
alias task-cli="dotnet run --project /path/to/TaskTracker.csproj --"
```

## Project Structure

The project follows a **Clean Architecture** approach to ensure maintainability and adherence to SOLID principles:

- **Domain/**: Contains the core business logic and entities.
  - `TaskItem.cs`: Immutable record representing a task.
  - `ITaskRepository.cs`: Abstract interface for data persistence.
- **Infrastructure/**: Contains implementation details.
  - `FileTaskRepository.cs`: Concrete implementation of the repository using JSON file storage.
- **Application/Commands/**: Contains the Command Pattern implementations.
  - `ICommand.cs`: Command interface.
  - `AddCommand.cs`, `ListCommand.cs`, etc.: Specific command logic.
- **Program.cs**: Entry point and Composition Root. Connects dependencies and routes commands.
