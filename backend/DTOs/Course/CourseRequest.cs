namespace Learnova.DTO.Course;

using System.ComponentModel.DataAnnotations;
public class CourseRequest
{
    [Required]
    public required string Name { get; set; }
    public string? Description { get; set; }
}