using System.Collections.Generic;

namespace TaskTracker.Domain;

public interface ITaskRepository
{
    int Add(TaskItem task);
    bool Update(TaskItem task);
    bool Delete(int id);
    TaskItem? GetById(int id);
    IEnumerable<TaskItem> GetAll();
    IEnumerable<TaskItem> GetByStatus(string status);
    int GetNextId();
}
