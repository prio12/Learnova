using Learnova.DTO.Subject;
using Learnova.Models;

namespace Learnova.Services;

public class SubjectCreateResult
{
    public SubjectCreateStatus Status { get; set; }
    public SubjectResponse? Subject { get; set; }
}