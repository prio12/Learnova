using Learnova.DTO.Enrollment;
using Learnova.Models;

namespace Learnova.Services;

public class EnrollmentCreateResult
{
    public EnrollmentCreateStatus Status { get; set; }
    public EnrollmentResponse? Enrollment { get; set; }
}