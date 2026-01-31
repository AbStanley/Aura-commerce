using System;
using TaskTracker.Domain;

namespace TaskTracker.Application.Commands;

 
public class UpdateCommand(ITaskRepository repository) : ICommand
{
    public string Name => "update";
    public string Description => "Updates a task description. Usage: update <id> <new description>";

    public void Execute(string[] args)
    {
        if (args.Length < 2)
        {
            Console.WriteLine("Error: ID and New Description required.");
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

        string newDescription = args[1];
        var updatedTask = task.UpdateDescription(newDescription);
        repository.Update(updatedTask);
        
        Console.WriteLine($"Task {id} updated successfully.");
    }
}
