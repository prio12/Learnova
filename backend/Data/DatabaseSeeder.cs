using Learnova.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Learnova.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var context = services.GetRequiredService<AppDbContext>();
        var passwordHasher = services.GetRequiredService<IPasswordHasher<User>>();

        //users

        const string adminEmail = "admin@learnova.com";
        const string teacherEmail = "teacher@learnova.com";
        const string studentEmail = "student@learnova.com";

        var admin = await context.Users
            .FirstOrDefaultAsync(u => u.Email == adminEmail);

        if (admin == null)
        {
            admin = new User
            {
                Id = Guid.NewGuid(),
                Name = "Learnova Admin",
                Email = adminEmail,
                PasswordHash = "",
                Role = UserRole.Admin
            };

            admin.PasswordHash = passwordHasher.HashPassword(
                admin,
                "Admin@Learnova123"
            );

            context.Users.Add(admin);
        }

        var teacher = await context.Users
            .FirstOrDefaultAsync(u => u.Email == teacherEmail);

        if (teacher == null)
        {
            teacher = new User
            {
                Id = Guid.NewGuid(),
                Name = "Learnova Teacher",
                Email = teacherEmail,
                PasswordHash = "",
                Role = UserRole.Teacher
            };

            teacher.PasswordHash = passwordHasher.HashPassword(
                teacher,
                "Teacher@Learnova123"
            );

            context.Users.Add(teacher);
        }

        var student = await context.Users
            .FirstOrDefaultAsync(u => u.Email == studentEmail);

        if (student == null)
        {
            student = new User
            {
                Id = Guid.NewGuid(),
                Name = "Learnova Student",
                Email = studentEmail,
                PasswordHash = "",
                Role = UserRole.Student
            };

            student.PasswordHash = passwordHasher.HashPassword(
                student,
                "Student@Learnova123"
            );

            context.Users.Add(student);
        }

        await context.SaveChangesAsync();

        //course

        var course = await context.Courses
            .FirstOrDefaultAsync(c => c.Name == "Computer Science");

        if (course == null)
        {
            course = new Course
            {
                Id = Guid.NewGuid(),
                Name = "Computer Science",
                Description = "Computer Science fundamentals and programming."
            };

            context.Courses.Add(course);

            await context.SaveChangesAsync();
        }

        //subject

        var subject = await context.Subjects
            .FirstOrDefaultAsync(s =>
                s.Name == "Algorithms" &&
                s.CourseId == course.Id);

        if (subject == null)
        {
            subject = new Subject
            {
                Id = Guid.NewGuid(),
                Name = "Algorithms",
                CourseId = course.Id,
                TeacherId = teacher.Id
            };

            context.Subjects.Add(subject);

            await context.SaveChangesAsync();
        }

        //enrollment

        var enrollmentExists = await context.Enrollments
            .AnyAsync(e =>
                e.StudentId == student.Id &&
                e.CourseId == course.Id);

        if (!enrollmentExists)
        {
            context.Enrollments.Add(new Enrollment
            {
                Id = Guid.NewGuid(),
                StudentId = student.Id,
                CourseId = course.Id
            });

            await context.SaveChangesAsync();
        }

        //assignment

        var assignment = await context.Assignments
            .FirstOrDefaultAsync(a =>
                a.Title == "Introduction to Algorithms" &&
                a.CourseId == course.Id &&
                a.SubjectId == subject.Id);

        if (assignment == null)
        {
            assignment = new Assignment
            {
                Id = Guid.NewGuid(),
                Title = "Introduction to Algorithms",
                Description = "Explain the basic concepts of sorting algorithms.",
                CourseId = course.Id,
                SubjectId = subject.Id,
                TeacherId = teacher.Id,
                Deadline = DateTime.UtcNow.AddDays(7),
                MaximumMarks = 100,
                Status = AssignmentStatus.Published
            };

            context.Assignments.Add(assignment);

            await context.SaveChangesAsync();
        }

        //submission

        var submissionExists = await context.Submissions
            .AnyAsync(s =>
                s.AssignmentId == assignment.Id &&
                s.StudentId == student.Id);

        if (!submissionExists)
        {
            context.Submissions.Add(new Submission
            {
                Id = Guid.NewGuid(),
                AssignmentId = assignment.Id,
                StudentId = student.Id,
                Answer = "This is a seeded sample submission.",
                SubmittedAt = DateTime.UtcNow,
                SubmissionStatus = SubmissionStatus.Submitted
            });

            await context.SaveChangesAsync();
        }
    }
}