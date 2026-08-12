using Learnova.Models;

namespace Learnova.DTO.Submission;

public class AssignmentSubmissionOverviewResponse
{
    public Guid StudentId { get; set; }
    public required string StudentName { get; set; }

    public bool HasSubmitted { get; set; }

    public Guid? SubmissionId { get; set; }
    public DateTime? SubmittedAt { get; set; }

    public int? Marks { get; set; }
    public string? Feedback { get; set; }

    public SubmissionStatus? SubmissionStatus { get; set; }
}