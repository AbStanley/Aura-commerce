using System;
using TaskTracker.Domain;

namespace TaskTracker.Application.Commands;

public class AddCommand : ICommand
{
    private readonly ITaskRepository _repository;

    public AddCommand(ITaskRepository repository)
    {
        _repository = repository;
    }

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
        int newId = _repository.GetNextId();
        var newTask = TaskItem.Create(newId, description);
        
        _repository.Add(newTask);
        Console.WriteLine($"Task added successfully (ID: {newId})");
    }
}
