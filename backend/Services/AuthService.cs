namespace Learnova.Services;

using Learnova.Data;
using Learnova.DTO.Auth;
using Learnova.Models;
using Microsoft.AspNetCore.Identity;

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

    public async Task Register(RegisterRequest request)
    {
        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = "",
        };
        user.PasswordHash = HashPassword(request.Password, user);

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
    }

}