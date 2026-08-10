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
    public AuthService(IPasswordHasher<User> passwordHasher, AppDbContext context)
    {
        _passwordHasher = passwordHasher;
        _context = context;
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

        var response = new RegisterResponse
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role,
        };
        return response;
    }

}