using Learnova.DTO.Subject;
using Learnova.Models;
using Learnova.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Learnova.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubjectController : ControllerBase
{
    private readonly SubjectService _subjectService;

    public SubjectController(SubjectService subjectService)
    {
        _subjectService = subjectService;
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(SubjectRequest request)
    {
        var result = await _subjectService.Create(request);

        if (result.Status == SubjectCreateStatus.CourseNotFound)
        {
            return NotFound(new { message = "Course is not found!" });
        }

        if (result.Status == SubjectCreateStatus.SubjectAlreadyExists)
        {
            return Conflict(new
            {
                message = "A subject already exists with the same name in this course."
            });
        }

        if (result.Status == SubjectCreateStatus.TeacherNotFound)
        {
            return NotFound(new { message = "Assigned teacher is not found!" });
        }

        if (result.Status == SubjectCreateStatus.UserIsNotTeacher)
        {
            return BadRequest(new
            {
                message = "The assigned user is not a teacher."
            });
        }

        return StatusCode(201, result.Subject);
    }
}

