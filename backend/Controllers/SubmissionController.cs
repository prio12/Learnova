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
}