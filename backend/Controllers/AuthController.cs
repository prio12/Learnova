namespace Learnova.Controllers;

using Learnova.DTO.Auth;
using Learnova.Services;
using Microsoft.AspNetCore.Mvc;

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
    public async Task Register(RegisterRequest request)
    {
        await _authService.Register(request);
    }
}