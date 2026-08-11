using Learnova.DTO.Subject;
using Learnova.Models;

namespace Learnova.Services;

public class SubjectUpdateResult
{
    public SubjectUpdateStatus Status { get; set; }
    public SubjectResponse? Subject { get; set; }
}