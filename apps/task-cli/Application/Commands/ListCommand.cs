using System;
using System.Collections.Generic;
using System.Linq;
using TaskTracker.Domain;

namespace TaskTracker.Application.Commands;

 
public class ListCommand(ITaskRepository repository) : ICommand
{
    public string Name => "list";
    public string Description => "Lists tasks. Usage: list [status]";

    public void Execute(string[] args)
    {
        IEnumerable<TaskItem> tasks;

        if (args.Length > 0)
        {
            string status = args[0].ToLower();
            if (status != "todo" && status != "done" && status != "in-progress")
            {
                Console.WriteLine("Error: Invalid status. Use 'todo', 'in-progress', or 'done'.");
                return;
            }
            tasks = repository.GetByStatus(status);
        }
        else
        {
            tasks = repository.GetAll();
        }

        var taskList = tasks.ToList();
        if (taskList.Count == 0)
        {
            Console.WriteLine("No tasks found.");
            return;
        }

        foreach (var task in taskList)
        {
            Console.WriteLine($"[{task.Id}] {task.Description} - {task.Status} (Created: {task.CreatedAt})");
        }
    }
}
