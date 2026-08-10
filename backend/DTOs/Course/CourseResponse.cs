namespace Learnova.DTO.Course;

public class CourseResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
}