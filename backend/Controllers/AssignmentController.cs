using System.Security.Claims;
using Learnova.DTO.Assignment;
using Learnova.Models;
using Learnova.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Learnova.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssignmentController : ControllerBase
{
    private readonly AssignmentService _assignmentService;

    public AssignmentController(AssignmentService assignmentService)
    {
        _assignmentService = assignmentService;
    }

    [Authorize(Roles = "Teacher")]
    [HttpPost]
    public async Task<IActionResult> Create(AssignmentRequest request)
    {
        var teacherIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(teacherIdClaim, out var teacherId))
        {
            return Unauthorized(new
            {
                message = "Invalid teacher identity."
            });
        }

        var result = await _assignmentService.Create(request, teacherId);

        if (result.Status == AssignmentCreateStatus.CourseNotFound)
        {
            return NotFound(new
            {
                message = "Course not found."
            });
        }

        if (result.Status == AssignmentCreateStatus.SubjectNotFound)
        {
            return NotFound(new
            {
                message = "Subject not found."
            });
        }

        if (result.Status == AssignmentCreateStatus.SubjectDoesNotBelongToCourse)
        {
            return BadRequest(new
            {
                message = "The subject does not belong to the selected course."
            });
        }

        if (result.Status == AssignmentCreateStatus.TeacherNotAssignedToSubject)
        {
            return Forbid();
        }
        ;

        if (result.Status == AssignmentCreateStatus.TeacherNotFound)
        {
            return NotFound(new
            {
                message = "Teacher not found."
            });
        }

        return StatusCode(201, result.Assignment);
    }


    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (!Guid.TryParse(userIdClaim, out var userId) || string.IsNullOrEmpty(role))
        {
            return Unauthorized(new
            {
                message = "Invalid user identity."
            });
        }

        var assignments = await _assignmentService.GetAll(userId, role);

        return Ok(assignments);
    }


    [Authorize]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (!Guid.TryParse(userIdClaim, out var userId) ||
            string.IsNullOrEmpty(role))
        {
            return Unauthorized(new
            {
                message = "Invalid user identity."
            });
        }

        var assignment = await _assignmentService.GetById(id, userId, role);

        if (assignment == null)
        {
            return NotFound(new
            {
                message = "Assignment not found."
            });
        }

        return Ok(assignment);
    }
}