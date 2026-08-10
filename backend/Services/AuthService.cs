namespace Learnova.Services;

using Learnova.Data;
using Learnova.DTO.Auth;
using Learnova.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public class AuthService
{
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;
    public AuthService(IPasswordHasher<User> passwordHasher, AppDbContext context, JwtService jwtService)
    {
        _passwordHasher = passwordHasher;
        _context = context;
        _jwtService = jwtService;
    }

    public string HashPassword(string plainPassword, User user)
    {
        var hash = _passwordHasher.HashPassword(user, plainPassword);
        return hash;

    }

    public async Task<RegisterResponse?> Register(RegisterRequest request)
    {

        bool emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email);
        if (emailExists)
        {
            return null;
        }

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = "",
        };
        user.PasswordHash = HashPassword(request.Password, user);

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        var token = _jwtService.GenerateToken(user);

        var response = new RegisterResponse
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role,
            Token = token,
        };
        return response;
    }

    public async Task<LoginResponse?> Login(LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            return null;
        }
        ;
        var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        bool isPasswordValid = verificationResult == PasswordVerificationResult.Success;

        if (!isPasswordValid)
        {
            return null;
        }

        var token = _jwtService.GenerateToken(user);

        var response = new LoginResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            Token = token,
        };

        return response;

    }

}