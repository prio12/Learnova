using Learnova.DTO.Assignment;
using Learnova.Models;

namespace Learnova.Services;

public class AssignmentCreateResult
{
    public AssignmentCreateStatus Status { get; set; }
    public AssignmentResponse? Assignment { get; set; }
}