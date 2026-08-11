namespace Learnova.DTO.Subject;

public class SubjectResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }

    public Guid CourseId { get; set; }
    public required string CourseName { get; set; }

    public Guid? TeacherId { get; set; }
    public string? TeacherName { get; set; }
}