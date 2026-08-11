using Learnova.Data;
using Learnova.DTO.Enrollment;
using Learnova.Models;
using Microsoft.EntityFrameworkCore;

namespace Learnova.Services;

public class EnrollmentService
{
    private readonly AppDbContext _context;

    public EnrollmentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<EnrollmentCreateResult> Create(EnrollmentRequest request)
    {
        var existingStudent = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.StudentId);

        if (existingStudent == null)
        {
            return new EnrollmentCreateResult
            {
                Status = EnrollmentCreateStatus.StudentNotFound
            };
        }

        if (existingStudent.Role != UserRole.Student)
        {
            return new EnrollmentCreateResult
            {
                Status = EnrollmentCreateStatus.UserIsNotStudent
            };
        }

        var existingCourse = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == request.CourseId);

        if (existingCourse == null)
        {
            return new EnrollmentCreateResult
            {
                Status = EnrollmentCreateStatus.CourseNotFound
            };
        }

        var existingEnrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e =>
                e.StudentId == request.StudentId &&
                e.CourseId == request.CourseId);

        if (existingEnrollment != null)
        {
            return new EnrollmentCreateResult
            {
                Status = EnrollmentCreateStatus.AlreadyEnrolled
            };
        }

        var enrollment = new Enrollment
        {
            StudentId = request.StudentId,
            CourseId = request.CourseId
        };

        await _context.Enrollments.AddAsync(enrollment);
        await _context.SaveChangesAsync();

        var response = new EnrollmentResponse
        {
            Id = enrollment.Id,

            StudentId = enrollment.StudentId,
            StudentName = existingStudent.Name,

            CourseId = enrollment.CourseId,
            CourseName = existingCourse.Name
        };

        return new EnrollmentCreateResult
        {
            Status = EnrollmentCreateStatus.Created,
            Enrollment = response
        };
    }



    public async Task<List<EnrollmentResponse>> GetAll(
    Guid userId,
    string role)
    {
        var query = _context.Enrollments.AsQueryable();

        if (role == UserRole.Student.ToString())
        {
            query = query.Where(e => e.StudentId == userId);
        }
        // no filter for admin

        var enrollments = await query
            .Select(e => new EnrollmentResponse
            {
                Id = e.Id,

                StudentId = e.StudentId,
                StudentName = e.Student.Name,

                CourseId = e.CourseId,
                CourseName = e.Course.Name
            })
            .ToListAsync();

        return enrollments;
    }
}