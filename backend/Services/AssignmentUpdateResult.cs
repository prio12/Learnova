using Learnova.DTO.Assignment;
using Learnova.Models;

namespace Learnova.Services;

public class AssignmentUpdateResult
{
    public AssignmentUpdateStatus Status { get; set; }
    public AssignmentResponse? Assignment { get; set; }
}