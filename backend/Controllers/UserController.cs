using Learnova.Models;
using Learnova.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Learnova.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly UserService _userService;

    public UserController(UserService userService)
    {
        _userService = userService;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAll();

        return Ok(users);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var user = await _userService.GetById(id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(user);
    }



    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/promote-to-teacher")]
    public async Task<IActionResult> PromoteToTeacher(Guid id)
    {
        var result = await _userService.PromoteToTeacher(id);

        if (result.Status == PromoteUserStatus.UserNotFound)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        if (result.Status == PromoteUserStatus.NotStudent)
        {
            return BadRequest(new
            {
                message = "Only a student can be promoted to teacher."
            });
        }

        return Ok(result.User);
    }
}