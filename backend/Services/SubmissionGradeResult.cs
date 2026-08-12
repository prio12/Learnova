using Learnova.DTO.Submission;
using Learnova.Models;

namespace Learnova.Services;

public class SubmissionGradeResult
{
    public SubmissionGradeStatus Status { get; set; }
    public SubmissionResponse? Submission { get; set; }
}