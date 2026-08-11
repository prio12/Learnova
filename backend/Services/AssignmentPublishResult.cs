using Learnova.DTO.Assignment;
using Learnova.Models;

namespace Learnova.Services;

public class AssignmentPublishResult
{
    public AssignmentPublishStatus Status { get; set; }
    public AssignmentResponse? Assignment { get; set; }
}