namespace Learnova.Models;

public class Subject
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public Guid? TeacherId { get; set; }
    public User? Teacher { get; set; }
}