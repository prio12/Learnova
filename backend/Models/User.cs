namespace Learnova.Models;

public enum UserRole
{
    Student,
    Teacher,
    Admin
}

public class User
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public UserRole Role { get; set; } = UserRole.Student;

}