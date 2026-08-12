using Learnova.DTO.Submission;
using Learnova.Models;

namespace Learnova.Services;

public class SubmissionUpdateResult
{
    public SubmissionUpdateStatus Status { get; set; }
    public SubmissionResponse? Submission { get; set; }
}