using System;
using System.Linq;

namespace TaskTracker;

class Program
{
    static void Main(string[] args)
    {
        if (args.Length == 0)
        {
            Console.WriteLine("Usage: task-cli <command> [arguments]");
            return;
        }

        var repository = new TaskRepository();
        string command = args[0].ToLower();

        try
        {
            switch (command)
            {
                case "add":
                    if (args.Length < 2)
                    {
                        Console.WriteLine("Error: Description required.");
                        return;
                    }
                    string addDescription = args[1];
                    int newId = repository.AddTask(addDescription);
                    Console.WriteLine($"Task added successfully (ID: {newId})");
                    break;

                case "update":
                    if (args.Length < 3)
                    {
                        Console.WriteLine("Error: ID and Description required.");
                        return;
                    }
                    if (!int.TryParse(args[1], out int updateId))
                    {
                        Console.WriteLine("Error: Invalid ID.");
                        return;
                    }
                    string updateDescription = args[2];
                    if (repository.UpdateTask(updateId, updateDescription))
                    {
                        Console.WriteLine($"Task {updateId} updated successfully.");
                    }
                    else
                    {
                        Console.WriteLine($"Error: Task with ID {updateId} not found.");
                    }
                    break;

                case "delete":
                    if (args.Length < 2)
                    {
                        Console.WriteLine("Error: ID required.");
                        return;
                    }
                    if (!int.TryParse(args[1], out int deleteId))
                    {
                        Console.WriteLine("Error: Invalid ID.");
                        return;
                    }
                    if (repository.DeleteTask(deleteId))
                    {
                        Console.WriteLine($"Task {deleteId} deleted successfully.");
                    }
                    else
                    {
                        Console.WriteLine($"Error: Task with ID {deleteId} not found.");
                    }
                    break;

                case "mark-in-progress":
                    if (args.Length < 2)
                    {
                        Console.WriteLine("Error: ID required.");
                        return;
                    }
                    if (!int.TryParse(args[1], out int progressId))
                    {
                        Console.WriteLine("Error: Invalid ID.");
                        return;
                    }
                    if (repository.UpdateStatus(progressId, "in-progress"))
                    {
                        Console.WriteLine($"Task {progressId} marked as in-progress.");
                    }
                    else
                    {
                        Console.WriteLine($"Error: Task with ID {progressId} not found.");
                    }
                    break;

                case "mark-done":
                    if (args.Length < 2)
                    {
                        Console.WriteLine("Error: ID required.");
                        return;
                    }
                    if (!int.TryParse(args[1], out int doneId))
                    {
                        Console.WriteLine("Error: Invalid ID.");
                        return;
                    }
                    if (repository.UpdateStatus(doneId, "done"))
                    {
                        Console.WriteLine($"Task {doneId} marked as done.");
                    }
                    else
                    {
                        Console.WriteLine($"Error: Task with ID {doneId} not found.");
                    }
                    break;

                case "list":
                    if (args.Length > 1)
                    {
                        string status = args[1].ToLower();
                        if (status != "todo" && status != "done" && status != "in-progress")
                        {
                            Console.WriteLine("Error: Invalid status. Use 'todo', 'in-progress', or 'done'.");
                            return;
                        }
                        var tasksByStatus = repository.GetTasksByStatus(status);
                        PrintTasks(tasksByStatus);
                    }
                    else
                    {
                        var allTasks = repository.GetAllTasks();
                        PrintTasks(allTasks);
                    }
                    break;

                default:
                    Console.WriteLine("Unknown command.");
                    break;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An error occurred: {ex.Message}");
        }
    }

    static void PrintTasks(System.Collections.Generic.List<TaskItem> tasks)
    {
        if (tasks.Count == 0)
        {
            Console.WriteLine("No tasks found.");
            return;
        }

        foreach (var task in tasks)
        {
            Console.WriteLine($"[{task.Id}] {task.Description} - {task.Status} (Created: {task.CreatedAt})");
        }
    }
}
