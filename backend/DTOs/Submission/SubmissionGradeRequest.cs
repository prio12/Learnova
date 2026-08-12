namespace Learnova.DTO.Submission;

using System.ComponentModel.DataAnnotations;

public class SubmissionGradeRequest
{
    [Range(0, 1000)]
    public int Marks { get; set; }

    [StringLength(2000)]
    public string? Feedback { get; set; }
}