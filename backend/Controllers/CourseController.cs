using Learnova.DTO.Course;
using Learnova.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Learnova.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CourseController : ControllerBase
{
    private readonly CourseService _courseService;

    public CourseController(CourseService courseService)
    {
        _courseService = courseService;
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("addCourse")]

    public async Task<IActionResult> Create(CourseRequest request)
    {
        CourseResponse response = await _courseService.Create(request);
        return StatusCode(201, response);
    }
}