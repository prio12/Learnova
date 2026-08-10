namespace Learnova.DTO.Auth;

using Learnova.Models;
using System.ComponentModel.DataAnnotations;
public class RegisterRequest
{
    [Required]
    [StringLength(24)]
    public required string Name { get; set; }

    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [MinLength(6)]
    public required string Password { get; set; }

}

public class RegisterResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public UserRole Role { get; set; }
    public required string Token { get; set; }
}