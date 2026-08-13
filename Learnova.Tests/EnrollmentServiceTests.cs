using Learnova.Data;
using Learnova.DTO.Enrollment;
using Learnova.Models;
using Learnova.Services;
using Microsoft.EntityFrameworkCore;

namespace Learnova.Tests;

public class EnrollmentServiceTests
{
    private AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task Create_ShouldReturnAlreadyEnrolled_WhenEnrollmentAlreadyExists()
    {
        await using var context = CreateContext();

        var student = new User
        {
            Id = Guid.NewGuid(),
            Name = "Test Student",
            Email = "student@test.com",
            Role = UserRole.Student,
            PasswordHash = Guid.NewGuid().ToString()
        };

        var course = new Course
        {
            Id = Guid.NewGuid(),
            Name = "Test Course"
        };

        var existingEnrollment = new Enrollment
        {
            Id = Guid.NewGuid(),
            StudentId = student.Id,
            CourseId = course.Id
        };

        context.Users.Add(student);
        context.Courses.Add(course);
        context.Enrollments.Add(existingEnrollment);

        await context.SaveChangesAsync();

        var service = new EnrollmentService(context);

        var request = new EnrollmentRequest
        {
            StudentId = student.Id,
            CourseId = course.Id
        };

        var result = await service.Create(request);

        Assert.Equal(
            EnrollmentCreateStatus.AlreadyEnrolled,
            result.Status);

        Assert.Equal(
            1,
            await context.Enrollments.CountAsync());
    }
}