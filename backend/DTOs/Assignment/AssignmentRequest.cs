namespace Learnova.DTO.Assignment;

public class AssignmentRequest
{
    public required string Title { get; set; }
    public required string Description { get; set; }

    public Guid CourseId { get; set; }
    public Guid SubjectId { get; set; }

    public DateTime Deadline { get; set; }
    public int MaximumMarks { get; set; }
}