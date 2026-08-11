namespace Learnova.Models;


public enum AssignmentStatus
{
    Draft,
    Published,
}


public class Assignment
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public required DateTime Deadline { get; set; }
    public required int MaximumMarks { get; set; }
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Draft;
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
    public Guid TeacherId { get; set; }
    public User Teacher { get; set; } = null!;



}