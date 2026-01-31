using System;
using TaskTracker.Domain;

namespace TaskTracker.Application.Commands;

 
public class ChangeStatusCommand(ITaskRepository repository, string commandName, string targetStatus) : ICommand
{
    public string Name => commandName;
    public string Description => $"Marks a task as {targetStatus}. Usage: {commandName} <id>";

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

        var task = repository.GetById(id);
        if (task == null)
        {
            Console.WriteLine($"Error: Task with ID {id} not found.");
            return;
        }

        var updatedTask = task.UpdateStatus(targetStatus);
        repository.Update(updatedTask);
        
        Console.WriteLine($"Task {id} marked as {targetStatus}.");
    }
}
