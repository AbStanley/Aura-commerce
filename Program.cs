using System;
using System.Collections.Generic;
using System.Linq;
using TaskTracker.Application.Commands;
using TaskTracker.Domain;
using TaskTracker.Infrastructure;

namespace TaskTracker;

class Program
{
    static void Main(string[] args)
    {
        // 1. Dependency Injection Composition Root
        ITaskRepository repository = new FileTaskRepository();

        // 2. Command Registration
        // Using a dictionary for O(1) lookup - Strategy/Command Pattern
        var commands = new List<ICommand>
        {
            new AddCommand(repository),
            new UpdateCommand(repository),
            new DeleteCommand(repository),
            new ChangeStatusCommand(repository, "mark-in-progress", "in-progress"),
            new ChangeStatusCommand(repository, "mark-done", "done"),
            new ListCommand(repository)
        }.ToDictionary(c => c.Name, StringComparer.OrdinalIgnoreCase);

        // 3. Argument Parsing & Execution
        if (args.Length == 0)
        {
            ShowHelp(commands.Values);
            return;
        }

        string commandName = args[0];
        if (commands.TryGetValue(commandName, out var command))
        {
            // Pass the rest of the arguments (skip the command name)
            string[] commandArgs = args.Length > 1 ? args[1..] : Array.Empty<string>();
            try
            {
                command.Execute(commandArgs);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An unexpected error occurred: {ex.Message}");
            }
        }
        else
        {
            Console.WriteLine($"Unknown command: {commandName}");
            ShowHelp(commands.Values);
        }
    }

    static void ShowHelp(IEnumerable<ICommand> commands)
    {
        Console.WriteLine("Task Tracker CLI");
        Console.WriteLine("Usage: task-cli <command> [arguments]");
        Console.WriteLine("\nAvailable Commands:");
        
        foreach (var cmd in commands)
        {
            Console.WriteLine($"  {cmd.Name.PadRight(20)} {cmd.Description}");
        }
    }
}
