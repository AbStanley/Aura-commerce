using System;
using TaskTracker.Domain;

namespace TaskTracker.Application.Commands;

 
public class AddCommand(ITaskRepository repository) : ICommand
{
    public string Name => "add";
    public string Description => "Adds a new task. Usage: add <description>";

    public void Execute(string[] args)
    {
        if (args.Length < 1)
        {
            Console.WriteLine("Error: Description required.");
            return;
        }

        string description = args[0];
        int newId = repository.GetNextId();
        var newTask = TaskItem.Create(newId, description);
        
        repository.Add(newTask);
        Console.WriteLine($"Task added successfully (ID: {newId})");
    }
}
