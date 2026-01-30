using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TaskTracker.Application.Commands;
using TaskTracker.Domain;
using TaskTracker.Infrastructure;

// 1. Dependency Injection Composition Root
ITaskRepository repository = new FileTaskRepository();

// 2. Command Registration
// Using a dictionary for O(1) lookup - Strategy/Command Pattern
Dictionary<string, ICommand> commands = new List<ICommand>
{
    new AddCommand(repository),
    new UpdateCommand(repository),
    new DeleteCommand(repository),
    new ChangeStatusCommand(repository, "mark-in-progress", "in-progress"),
    new ChangeStatusCommand(repository, "mark-done", "done"),
    new ListCommand(repository)
}.ToDictionary(c => c.Name, StringComparer.OrdinalIgnoreCase);

// 3. Argument Parsing & Execution
if (args.Length > 0)
{
    HandleCommand(commands, args);
}
else
{
    RunInteractiveMode(commands);
}

static void RunInteractiveMode(Dictionary<string, ICommand> commands)
{
    Console.WriteLine("Task Tracker Interactive Mode");
    Console.WriteLine("Type 'help' to see commands, or 'exit' to quit.");
    Console.WriteLine("---------------------------------------------");

    while (true)
    {
        Console.Write("task-cli > ");
        string? input = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(input)) continue;

        if (input.Trim().Equals("exit", StringComparison.OrdinalIgnoreCase) || 
            input.Trim().Equals("quit", StringComparison.OrdinalIgnoreCase))
        {
            break;
        }

        var parsedArgs = ParseArguments(input);
        HandleCommand(commands, parsedArgs);
    }
}

static void HandleCommand(Dictionary<string, ICommand> commands, string[] args)
{
    if (args.Length == 0) return;

    string commandName = args[0];
    if (commands.TryGetValue(commandName, out var command))
    {
        string[] commandArgs = args.Length > 1 ? args[1..] : [];
        try
        {
            command.Execute(commandArgs);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An unexpected error occurred: {ex.Message}");
        }
    }
    else if (commandName.Equals("help", StringComparison.OrdinalIgnoreCase))
    {
        ShowHelp(commands.Values);
    }
    else
    {
        Console.WriteLine($"Unknown command: {commandName}");
        Console.WriteLine("Type 'help' for a list of commands.");
    }
}

static string[] ParseArguments(string commandLine)
{
    List<string> args = [];
    StringBuilder currentArg = new();
    bool inQuotes = false;

    foreach (char c in commandLine)
    {
        if (c == '"')
        {
            inQuotes = !inQuotes;
        }
        else if (c == ' ' && !inQuotes)
        {
            if (currentArg.Length > 0)
            {
                args.Add(currentArg.ToString());
                currentArg.Clear();
            }
        }
        else
        {
            currentArg.Append(c);
        }
    }

    if (currentArg.Length > 0) args.Add(currentArg.ToString());

    return [.. args];
}

static void ShowHelp(IEnumerable<ICommand> commands)
{
    Console.WriteLine("\nAvailable Commands:");
    foreach (var cmd in commands)
    {
        Console.WriteLine($"  {cmd.Name.PadRight(20)} {cmd.Description}");
    }
    Console.WriteLine($"  {"exit/quit".PadRight(20)} Exits the interactive mode");
}
