using Learnova.DTO.Submission;
using Learnova.Models;

namespace Learnova.Services;

public class SubmissionCreateResult
{
    public SubmissionCreateStatus Status { get; set; }
    public SubmissionResponse? Submission { get; set; }
}