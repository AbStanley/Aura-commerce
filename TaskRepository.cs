using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;

namespace TaskTracker;

public class TaskRepository
{
    private const string FileName = "tasks.json";
    private readonly string _filePath;

    public TaskRepository()
    {
        _filePath = Path.Combine(Directory.GetCurrentDirectory(), FileName);
        if (!File.Exists(_filePath))
        {
            File.WriteAllText(_filePath, "[]");
        }
    }

    private List<TaskItem> LoadTasks()
    {
        try
        {
            string json = File.ReadAllText(_filePath);
            if (string.IsNullOrWhiteSpace(json)) return new List<TaskItem>();
            return JsonSerializer.Deserialize<List<TaskItem>>(json) ?? new List<TaskItem>();
        }
        catch (Exception)
        {
            return new List<TaskItem>();
        }
    }

    private void SaveTasks(List<TaskItem> tasks)
    {
        var options = new JsonSerializerOptions { WriteIndented = true };
        string json = JsonSerializer.Serialize(tasks, options);
        File.WriteAllText(_filePath, json);
    }

    public int AddTask(string description)
    {
        var tasks = LoadTasks();
        int newId = tasks.Any() ? tasks.Max(t => t.Id) + 1 : 1;
        var task = new TaskItem
        {
            Id = newId,
            Description = description,
            Status = "todo",
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };
        tasks.Add(task);
        SaveTasks(tasks);
        return newId;
    }

    public bool UpdateTask(int id, string description)
    {
        var tasks = LoadTasks();
        var task = tasks.FirstOrDefault(t => t.Id == id);
        if (task == null) return false;

        task.Description = description;
        task.UpdatedAt = DateTime.Now;
        SaveTasks(tasks);
        return true;
    }

    public bool DeleteTask(int id)
    {
        var tasks = LoadTasks();
        var task = tasks.FirstOrDefault(t => t.Id == id);
        if (task == null) return false;

        tasks.Remove(task);
        SaveTasks(tasks);
        return true;
    }

    public bool UpdateStatus(int id, string status)
    {
        var tasks = LoadTasks();
        var task = tasks.FirstOrDefault(t => t.Id == id);
        if (task == null) return false;

        task.Status = status;
        task.UpdatedAt = DateTime.Now;
        SaveTasks(tasks);
        return true;
    }

    public List<TaskItem> GetAllTasks()
    {
        return LoadTasks();
    }

    public List<TaskItem> GetTasksByStatus(string status)
    {
        return LoadTasks().Where(t => t.Status.Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();
    }
}
