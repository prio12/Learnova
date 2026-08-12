using System.Security.Claims;
using Learnova.DTO.Submission;
using Learnova.Models;
using Learnova.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Learnova.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubmissionController : ControllerBase
{
    private readonly SubmissionService _submissionService;

    public SubmissionController(SubmissionService submissionService)
    {
        _submissionService = submissionService;
    }

    [Authorize(Roles = "Student")]
    [HttpPost]
    public async Task<IActionResult> Create(SubmissionRequest request)
    {
        var studentIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(studentIdClaim, out var studentId))
        {
            return Unauthorized(new
            {
                message = "Invalid student identity."
            });
        }

        var result = await _submissionService.Create(request, studentId);

        if (result.Status == SubmissionCreateStatus.AssignmentNotFound)
        {
            return NotFound(new
            {
                message = "Assignment not found."
            });
        }

        if (result.Status == SubmissionCreateStatus.AssignmentNotPublished)
        {
            return BadRequest(new
            {
                message = "Assignment is not published."
            });
        }

        if (result.Status == SubmissionCreateStatus.StudentNotEnrolled)
        {
            return Forbid();
        }

        if (result.Status == SubmissionCreateStatus.DeadlinePassed)
        {
            return BadRequest(new
            {
                message = "The submission deadline has passed."
            });
        }

        if (result.Status == SubmissionCreateStatus.AlreadySubmitted)
        {
            return Conflict(new
            {
                message = "You have already submitted this assignment."
            });
        }

        return StatusCode(201, result.Submission);
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

        var submissions = await _submissionService.GetAll(userId, role);

        return Ok(submissions);
    }


    [Authorize(Roles = "Student")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
    Guid id,
    SubmissionUpdateRequest request)
    {
        var studentIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(studentIdClaim, out var studentId))
        {
            return Unauthorized(new
            {
                message = "Invalid student identity."
            });
        }

        var result = await _submissionService.Update(
            id,
            studentId,
            request);

        if (result.Status == SubmissionUpdateStatus.SubmissionNotFound)
        {
            return NotFound(new
            {
                message = "Submission not found."
            });
        }

        if (result.Status == SubmissionUpdateStatus.NotOwner)
        {
            return Forbid();
        }

        if (result.Status == SubmissionUpdateStatus.DeadlinePassed)
        {
            return BadRequest(new
            {
                message = "The submission deadline has passed."
            });
        }

        return Ok(result.Submission);
    }



    [Authorize(Roles = "Teacher")]
    [HttpPut("{id}/grade")]
    public async Task<IActionResult> Grade(
    Guid id,
    SubmissionGradeRequest request)
    {
        var teacherIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(teacherIdClaim, out var teacherId))
        {
            return Unauthorized(new
            {
                message = "Invalid teacher identity."
            });
        }

        var result = await _submissionService.Grade(
            id,
            teacherId,
            request);

        if (result.Status == SubmissionGradeStatus.SubmissionNotFound)
        {
            return NotFound(new
            {
                message = "Submission not found."
            });
        }

        if (result.Status == SubmissionGradeStatus.NotOwner)
        {
            return Forbid();
        }

        if (result.Status == SubmissionGradeStatus.MarksExceedMaximum)
        {
            return BadRequest(new
            {
                message = "Marks cannot exceed the assignment maximum marks."
            });
        }

        return Ok(result.Submission);
    }


    [Authorize(Roles = "Teacher")]
    [HttpGet("assignment/{assignmentId}/overview")]
    public async Task<IActionResult> GetAssignmentOverview(Guid assignmentId)
    {
        var teacherIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(teacherIdClaim, out var teacherId))
        {
            return Unauthorized(new
            {
                message = "Invalid teacher identity."
            });
        }

        var result = await _submissionService.GetAssignmentOverview(
            assignmentId,
            teacherId);

        if (result.Status == SubmissionOverviewStatus.AssignmentNotFound)
        {
            return NotFound(new
            {
                message = "Assignment not found."
            });
        }

        if (result.Status == SubmissionOverviewStatus.NotOwner)
        {
            return Forbid();
        }

        return Ok(result.Students);
    }
}