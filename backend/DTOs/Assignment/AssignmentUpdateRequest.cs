namespace Learnova.DTO.Assignment;

using System.ComponentModel.DataAnnotations;

public class AssignmentUpdateRequest
{
    [Required]
    [StringLength(100)]
    public required string Title { get; set; }

    [Required]
    [StringLength(1000)]
    public required string Description { get; set; }

    [Required]
    [FutureDate]
    public DateTime Deadline { get; set; }

    [Range(1, 1000)]
    public int MaximumMarks { get; set; }
}

