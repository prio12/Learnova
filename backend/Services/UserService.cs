using Learnova.Data;
using Learnova.DTO.User;
using Microsoft.EntityFrameworkCore;
using Learnova.Models;

namespace Learnova.Services;

public class UserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserResponse>> GetAll()
    {
        var users = await _context.Users
            .Select(u => new UserResponse
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role
            })
            .ToListAsync();

        return users;
    }

    public async Task<UserResponse?> GetById(Guid id)
    {
        var user = await _context.Users
            .Where(u => u.Id == id)
            .Select(u => new UserResponse
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role
            })
            .FirstOrDefaultAsync();

        return user;
    }


    public async Task<PromoteUserResult> PromoteToTeacher(Guid id)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return new PromoteUserResult
            {
                Status = PromoteUserStatus.UserNotFound
            };
        }

        if (user.Role != UserRole.Student)
        {
            return new PromoteUserResult
            {
                Status = PromoteUserStatus.NotStudent
            };
        }

        user.Role = UserRole.Teacher;

        await _context.SaveChangesAsync();

        var response = new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role
        };

        return new PromoteUserResult
        {
            Status = PromoteUserStatus.Promoted,
            User = response
        };
    }
}