namespace Learnova.Models;

public class Course
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
}