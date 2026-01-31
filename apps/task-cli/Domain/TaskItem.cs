using System;

namespace TaskTracker.Domain;

public record TaskItem(
    int Id,
    string Description,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt
)
{
    // Factory method for creating a new task
    public static TaskItem Create(int id, string description) =>
        new(id, description, "todo", DateTime.Now, DateTime.Now);
        
    // Method to update description (returns a new instance because it's a record)
    public TaskItem UpdateDescription(string newDescription) =>
        this with { Description = newDescription, UpdatedAt = DateTime.Now };

    // Method to update status
    public TaskItem UpdateStatus(string newStatus) =>
        this with { Status = newStatus, UpdatedAt = DateTime.Now };
}
