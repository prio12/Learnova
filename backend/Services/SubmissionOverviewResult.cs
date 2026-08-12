using Learnova.DTO.Submission;
using Learnova.Models;

namespace Learnova.Services;

public class SubmissionOverviewResult
{
    public SubmissionOverviewStatus Status { get; set; }

    public List<AssignmentSubmissionOverviewResponse> Students { get; set; }
        = new();
}