namespace Learnova.DTO.Auth;

using System.ComponentModel.DataAnnotations;
using Learnova.Models;

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }


    [Required]
    public required string Password { get; set; }
}

public class LoginResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public UserRole Role { get; set; }
}