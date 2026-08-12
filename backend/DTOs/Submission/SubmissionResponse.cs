using Learnova.Models;

namespace Learnova.DTO.Submission;

public class SubmissionResponse
{
    public Guid Id { get; set; }

    public Guid AssignmentId { get; set; }
    public required string AssignmentTitle { get; set; }

    public Guid StudentId { get; set; }
    public required string StudentName { get; set; }

    public required string Answer { get; set; }

    public DateTime SubmittedAt { get; set; }

    public int? Marks { get; set; }
    public string? Feedback { get; set; }

    public SubmissionStatus SubmissionStatus { get; set; }
}