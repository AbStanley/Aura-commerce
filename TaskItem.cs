using System;

namespace TaskTracker;

public class TaskItem
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "todo"; // todo, in-progress, done
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
