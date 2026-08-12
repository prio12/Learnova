namespace Learnova.DTO.Submission;

using System.ComponentModel.DataAnnotations;

public class SubmissionUpdateRequest
{
    [Required]
    [StringLength(5000)]
    public required string Answer { get; set; }
}