namespace Learnova.DTO.Subject;

using System.ComponentModel.DataAnnotations;

public class SubjectUpdateRequest
{
    [Required]
    [StringLength(30)]
    public required string Name { get; set; }

    public Guid? TeacherId { get; set; }
}