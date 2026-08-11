using System.Security.Claims;
using Learnova.DTO.Enrollment;
using Learnova.Models;
using Learnova.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Learnova.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EnrollmentController : ControllerBase
{
    private readonly EnrollmentService _enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService)
    {
        _enrollmentService = enrollmentService;
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(EnrollmentRequest request)
    {
        var result = await _enrollmentService.Create(request);

        if (result.Status == EnrollmentCreateStatus.StudentNotFound)
        {
            return NotFound(new
            {
                message = "Student not found."
            });
        }

        if (result.Status == EnrollmentCreateStatus.UserIsNotStudent)
        {
            return BadRequest(new
            {
                message = "The selected user is not a student."
            });
        }

        if (result.Status == EnrollmentCreateStatus.CourseNotFound)
        {
            return NotFound(new
            {
                message = "Course not found."
            });
        }

        if (result.Status == EnrollmentCreateStatus.AlreadyEnrolled)
        {
            return Conflict(new
            {
                message = "Student is already enrolled in this course."
            });
        }

        return StatusCode(201, result.Enrollment);
    }



    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAll()
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

        if (role == UserRole.Teacher.ToString())
        {
            return Forbid();
        }

        var enrollments = await _enrollmentService.GetAll(userId, role);

        return Ok(enrollments);
    }


    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _enrollmentService.Delete(id);

        if (result == DeleteEnrollmentStatus.NotFound)
        {
            return NotFound(new
            {
                message = "Enrollment not found."
            });
        }

        return NoContent();
    }

}