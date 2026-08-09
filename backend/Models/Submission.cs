namespace Learnova.Models;

public enum SubmissionStatus
{
    Submitted,
    Graded
}

public class Submission
{
    public Guid Id { get; set; }
    public Guid AssignmentId { get; set; }
    public Assignment Assignment { get; set; } = null!;
    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;
    public required string Answer { get; set; }
    public required DateTime SubmittedAt { get; set; }
    public int? Marks { get; set; }
    public string? Feedback { get; set; }
    public SubmissionStatus SubmissionStatus { get; set; } = SubmissionStatus.Submitted;

}