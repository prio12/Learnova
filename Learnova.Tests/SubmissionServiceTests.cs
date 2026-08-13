using Learnova.Data;
using Learnova.DTO.Submission;
using Learnova.Models;
using Learnova.Services;
using Microsoft.EntityFrameworkCore;

namespace Learnova.Tests;


public class SubmissionServiceTests
{
    private AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }


    [Fact]
    public async Task Create_ShouldReturnAssignmentNotPublished_WhenAssignmentIsDraft()
    {
        await using var context = CreateContext();

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Test Assignment",
            Description = "Test Description",
            CourseId = Guid.NewGuid(),
            SubjectId = Guid.NewGuid(),
            TeacherId = Guid.NewGuid(),
            Deadline = DateTime.UtcNow.AddDays(1),
            MaximumMarks = 100,
            Status = AssignmentStatus.Draft
        };


        context.Assignments.Add(assignment);
        await context.SaveChangesAsync();

        var service = new SubmissionService(context);

        var request = new SubmissionRequest
        {
            AssignmentId = assignment.Id,
            Answer = "My test answer."
        };

        var studentId = Guid.NewGuid();

        var result = await service.Create(request, studentId);

        Assert.Equal(
          SubmissionCreateStatus.AssignmentNotPublished,
          result.Status);
    }



    [Fact]
    public async Task Create_ShouldCreateSubmission_WhenRequestIsValid()
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

        var courseId = Guid.NewGuid();

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Test Assignment",
            Description = "Test Description",
            CourseId = courseId,
            SubjectId = Guid.NewGuid(),
            TeacherId = Guid.NewGuid(),
            Deadline = DateTime.UtcNow.AddDays(1),
            MaximumMarks = 100,
            Status = AssignmentStatus.Published
        };

        var enrollment = new Enrollment
        {
            Id = Guid.NewGuid(),
            StudentId = student.Id,
            CourseId = courseId
        };

        context.Users.Add(student);
        context.Assignments.Add(assignment);
        context.Enrollments.Add(enrollment);

        await context.SaveChangesAsync();

        var service = new SubmissionService(context);

        var request = new SubmissionRequest
        {
            AssignmentId = assignment.Id,
            Answer = "My test answer."
        };

        //act
        var result = await service.Create(request, student.Id);

        Assert.Equal(
        SubmissionCreateStatus.Created,
        result.Status);

        Assert.NotNull(result.Submission);

        Assert.Equal(
            assignment.Id,
            result.Submission!.AssignmentId);

        Assert.Equal(
            student.Id,
            result.Submission.StudentId);

        Assert.Equal(
            request.Answer,
            result.Submission.Answer);

        Assert.Equal(
            SubmissionStatus.Submitted,
            result.Submission.SubmissionStatus);

        Assert.Equal(
            1,
            await context.Submissions.CountAsync());
    }


    [Fact]
    public async Task Create_ShouldReturnAlreadySubmitted_WhenStudentHasAlreadySubmitted()
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

        var courseId = Guid.NewGuid();

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Test Assignment",
            Description = "Test Description",
            CourseId = courseId,
            SubjectId = Guid.NewGuid(),
            TeacherId = Guid.NewGuid(),
            Deadline = DateTime.UtcNow.AddDays(1),
            MaximumMarks = 100,
            Status = AssignmentStatus.Published
        };

        var enrollment = new Enrollment
        {
            Id = Guid.NewGuid(),
            StudentId = student.Id,
            CourseId = courseId
        };

        var existingSubmission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            StudentId = student.Id,
            Answer = "My first answer.",
            SubmittedAt = DateTime.UtcNow,
            SubmissionStatus = SubmissionStatus.Submitted
        };

        context.Users.Add(student);
        context.Assignments.Add(assignment);
        context.Enrollments.Add(enrollment);
        context.Submissions.Add(existingSubmission);

        await context.SaveChangesAsync();

        //act
        var service = new SubmissionService(context);

        var request = new SubmissionRequest
        {
            AssignmentId = assignment.Id,
            Answer = "Trying to submit again."
        };

        var result = await service.Create(request, student.Id);

        Assert.Equal(
            SubmissionCreateStatus.AlreadySubmitted,
            result.Status);

        Assert.Null(result.Submission);

        Assert.Equal(
            1,
            await context.Submissions.CountAsync());
    }



    [Fact]
    public async Task Create_ShouldReturnStudentNotEnrolled_WhenStudentIsNotEnrolledInCourse()
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

        var courseId = Guid.NewGuid();

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Test Assignment",
            Description = "Test Description",
            CourseId = courseId,
            SubjectId = Guid.NewGuid(),
            TeacherId = Guid.NewGuid(),
            Deadline = DateTime.UtcNow.AddDays(1),
            MaximumMarks = 100,
            Status = AssignmentStatus.Published
        };

        context.Users.Add(student);
        context.Assignments.Add(assignment);

        await context.SaveChangesAsync();

        var service = new SubmissionService(context);

        var request = new SubmissionRequest
        {
            AssignmentId = assignment.Id,
            Answer = "I should not be allowed to submit."
        };

        var result = await service.Create(request, student.Id);

        Assert.Equal(
            SubmissionCreateStatus.StudentNotEnrolled,
            result.Status);

        Assert.Null(result.Submission);

        Assert.Equal(
            0,
            await context.Submissions.CountAsync());
    }



    [Fact]
    public async Task Create_ShouldReturnDeadlinePassed_WhenAssignmentDeadlineHasPassed()
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

        var courseId = Guid.NewGuid();

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Expired Assignment",
            Description = "Test Description",
            CourseId = courseId,
            SubjectId = Guid.NewGuid(),
            TeacherId = Guid.NewGuid(),
            Deadline = DateTime.UtcNow.AddDays(-1),
            MaximumMarks = 100,
            Status = AssignmentStatus.Published
        };

        var enrollment = new Enrollment
        {
            Id = Guid.NewGuid(),
            StudentId = student.Id,
            CourseId = courseId
        };

        context.Users.Add(student);
        context.Assignments.Add(assignment);
        context.Enrollments.Add(enrollment);

        await context.SaveChangesAsync();

        var service = new SubmissionService(context);

        var request = new SubmissionRequest
        {
            AssignmentId = assignment.Id,
            Answer = "Late submission."
        };

        var result = await service.Create(request, student.Id);

        Assert.Equal(
            SubmissionCreateStatus.DeadlinePassed,
            result.Status);

        Assert.Null(result.Submission);

        Assert.Equal(
            0,
            await context.Submissions.CountAsync());
    }
}