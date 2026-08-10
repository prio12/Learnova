namespace Learnova.Controllers;

using Learnova.DTO.Auth;
using Learnova.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        RegisterResponse? response = await _authService.Register(request);
        if (response == null)
        {
            return Conflict(new { message = "An account with this email address already exists." });
        }
        return StatusCode(201, response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        LoginResponse? response = await _authService.Login(request);
        if (response == null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }
        return Ok(response);
    }
    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok(new { message = "You are authenticated!" });
    }

}