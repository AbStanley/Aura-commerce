using System;
using TaskTracker.Domain;

namespace TaskTracker.Application.Commands;

 
public class DeleteCommand(ITaskRepository repository) : ICommand
{
    public string Name => "delete";
    public string Description => "Deletes a task. Usage: delete <id>";

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

        if (repository.Delete(id))
        {
            Console.WriteLine($"Task {id} deleted successfully.");
        }
        else
        {
            Console.WriteLine($"Error: Task with ID {id} not found.");
        }
    }
}
