namespace Learnova.DTO.Enrollment;

public class EnrollmentResponse
{
    public Guid Id { get; set; }

    public Guid StudentId { get; set; }
    public required string StudentName { get; set; }

    public Guid CourseId { get; set; }
    public required string CourseName { get; set; }
}