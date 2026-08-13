using Learnova.Data;
using Learnova.DTO.Assignment;
using Learnova.Models;
using Learnova.Services;
using Microsoft.EntityFrameworkCore;

namespace Learnova.Tests;

public class AssignmentServiceTests
{
    private AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task Update_ShouldReturnNotOwner_WhenTeacherDoesNotOwnAssignment()
    {
        await using var context = CreateContext();

        var ownerTeacher = new User
        {
            Id = Guid.NewGuid(),
            Name = "Owner Teacher",
            Email = "owner@test.com",
            Role = UserRole.Teacher,
            PasswordHash = Guid.NewGuid().ToString()
        };

        var otherTeacher = new User
        {
            Id = Guid.NewGuid(),
            Name = "Other Teacher",
            Email = "other@test.com",
            Role = UserRole.Teacher,
            PasswordHash = Guid.NewGuid().ToString()
        };

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Original Title",
            Description = "Original Description",
            CourseId = Guid.NewGuid(),
            SubjectId = Guid.NewGuid(),
            TeacherId = ownerTeacher.Id,
            Deadline = DateTime.UtcNow.AddDays(1),
            MaximumMarks = 100,
            Status = AssignmentStatus.Draft
        };

        context.Users.AddRange(ownerTeacher, otherTeacher);
        context.Assignments.Add(assignment);

        await context.SaveChangesAsync();

        var service = new AssignmentService(context);

        var request = new AssignmentUpdateRequest
        {
            Title = "Changed Title",
            Description = "Changed Description",
            Deadline = DateTime.UtcNow.AddDays(2),
            MaximumMarks = 90
        };

        var result = await service.Update(
            assignment.Id,
            otherTeacher.Id,
            request);

        Assert.Equal(
            AssignmentUpdateStatus.NotOwner,
            result.Status);

        Assert.Equal(
            "Original Title",
            assignment.Title);

        Assert.Equal(
            "Original Description",
            assignment.Description);
    }



    [Fact]
    public async Task Publish_ShouldChangeStatusToPublished_WhenTeacherOwnsAssignment()
    {
        await using var context = CreateContext();

        var teacher = new User
        {
            Id = Guid.NewGuid(),
            Name = "Test Teacher",
            Email = "teacher@test.com",
            Role = UserRole.Teacher,
            PasswordHash = Guid.NewGuid().ToString()
        };

        var course = new Course
        {
            Id = Guid.NewGuid(),
            Name = "Test Course"
        };

        var subject = new Subject
        {
            Id = Guid.NewGuid(),
            Name = "Test Subject"
        };

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Test Assignment",
            Description = "Test Description",
            CourseId = course.Id,
            SubjectId = subject.Id,
            TeacherId = teacher.Id,
            Deadline = DateTime.UtcNow.AddDays(1),
            MaximumMarks = 100,
            Status = AssignmentStatus.Draft
        };

        context.Users.Add(teacher);
        context.Courses.Add(course);
        context.Subjects.Add(subject);
        context.Assignments.Add(assignment);

        await context.SaveChangesAsync();

        var service = new AssignmentService(context);

        var result = await service.Publish(
            assignment.Id,
            teacher.Id);

        Assert.Equal(
            AssignmentPublishStatus.Published,
            result.Status);

        Assert.NotNull(result.Assignment);

        Assert.Equal(
            AssignmentStatus.Published,
            result.Assignment!.Status);

        Assert.Equal(
            assignment.Id,
            result.Assignment.Id);
    }
}