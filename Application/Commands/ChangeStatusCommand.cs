using System;
using TaskTracker.Domain;

namespace TaskTracker.Application.Commands;

public class ChangeStatusCommand : ICommand
{
    private readonly ITaskRepository _repository;
    private readonly string _targetStatus;
    private readonly string _commandName;

    public ChangeStatusCommand(ITaskRepository repository, string commandName, string targetStatus)
    {
        _repository = repository;
        _commandName = commandName;
        _targetStatus = targetStatus;
    }

    public string Name => _commandName;
    public string Description => $"Marks a task as {_targetStatus}. Usage: {_commandName} <id>";

    public void Execute(string[] args)
    {
        if (args.Length < 1)
        {
            Console.WriteLine("Error: ID required.");
            return;
        }

        if (!int.TryParse(args[0], out int id))
        {
            Console.WriteLine("Error: Invalid ID.");
            return;
        }

        var task = _repository.GetById(id);
        if (task == null)
        {
            Console.WriteLine($"Error: Task with ID {id} not found.");
            return;
        }

        var updatedTask = task.UpdateStatus(_targetStatus);
        _repository.Update(updatedTask);
        
        Console.WriteLine($"Task {id} marked as {_targetStatus}.");
    }
}
