namespace Learnova.DTO.Subject;

using System.ComponentModel.DataAnnotations;

public class SubjectRequest
{
    [Required]
    [StringLength(30)]
    public required string Name { get; set; }

    public Guid CourseId { get; set; }

    public Guid? TeacherId { get; set; }
}