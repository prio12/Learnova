namespace Learnova.DTO.Assignment;

public class AssignmentResponse
{
    public Guid Id { get; set; }

    public required string Title { get; set; }
    public required string Description { get; set; }

    public Guid CourseId { get; set; }
    public required string CourseName { get; set; }

    public Guid SubjectId { get; set; }
    public required string SubjectName { get; set; }

    public Guid TeacherId { get; set; }
    public required string TeacherName { get; set; }

    public DateTime Deadline { get; set; }
    public int MaximumMarks { get; set; }
}