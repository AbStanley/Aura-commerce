using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using TaskTracker.Domain;

namespace TaskTracker.Infrastructure;

 
public class FileTaskRepository(string filePath = "tasks.json") : ITaskRepository
{
    private readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = true };

    private List<TaskItem> LoadTasks()
    {
        if (!File.Exists(filePath)) return [];
        try
        {
            string json = File.ReadAllText(filePath);
            return JsonSerializer.Deserialize<List<TaskItem>>(json) ?? [];
        }
        catch
        {
            return [];
        }
    }

    private void SaveTasks(List<TaskItem> tasks)
    {
        string json = JsonSerializer.Serialize(tasks, _jsonOptions);
        File.WriteAllText(filePath, json);
    }

    public int Add(TaskItem task)
    {
        var tasks = LoadTasks();
        tasks.Add(task);
        SaveTasks(tasks);
        return task.Id;
    }

    public bool Update(TaskItem task)
    {
        var tasks = LoadTasks();
        var index = tasks.FindIndex(t => t.Id == task.Id);
        if (index == -1) return false;

        tasks[index] = task;
        SaveTasks(tasks);
        return true;
    }

    public bool Delete(int id)
    {
        var tasks = LoadTasks();
        var task = tasks.FirstOrDefault(t => t.Id == id);
        if (task == null) return false;

        tasks.Remove(task);
        SaveTasks(tasks);
        return true;
    }

    public TaskItem? GetById(int id)
    {
        return LoadTasks().FirstOrDefault(t => t.Id == id);
    }

    public IEnumerable<TaskItem> GetAll()
    {
        return LoadTasks();
    }

    public IEnumerable<TaskItem> GetByStatus(string status)
    {
        // Case-insensitive comparison
        return LoadTasks().Where(t => t.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
    }

    public int GetNextId()
    {
        var tasks = LoadTasks();
        return tasks.Count > 0 ? tasks.Max(t => t.Id) + 1 : 1;
    }
}
