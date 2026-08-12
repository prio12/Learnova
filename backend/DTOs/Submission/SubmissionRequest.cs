namespace Learnova.DTO.Submission;

using System.ComponentModel.DataAnnotations;

public class SubmissionRequest
{
    [Required]
    public Guid AssignmentId { get; set; }

    [Required]
    [StringLength(5000)]
    public required string Answer { get; set; }
}