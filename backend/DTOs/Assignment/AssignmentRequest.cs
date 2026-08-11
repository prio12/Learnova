
namespace Learnova.DTO.Assignment;

using System.ComponentModel.DataAnnotations;

public class AssignmentRequest
{
    [Required]
    [StringLength(100)]
    public required string Title { get; set; }

    [Required]
    [StringLength(1000)]
    public required string Description { get; set; }

    [Required]
    public Guid CourseId { get; set; }

    [Required]
    public Guid SubjectId { get; set; }

    [Required]
    [FutureDate]
    public DateTime Deadline { get; set; }

    [Range(1, 1000)]
    public int MaximumMarks { get; set; }
}

public class FutureDateAttribute : ValidationAttribute
{
    public override bool IsValid(object? value)
    {
        if (value is not DateTime date)
            return false;

        return date > DateTime.UtcNow;
    }

    public override string FormatErrorMessage(string name)
    {
        return $"{name} must be a future date.";
    }
}
