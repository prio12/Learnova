using Learnova.Data;
using Learnova.DTO.Subject;
using Microsoft.EntityFrameworkCore;
using Learnova.Models;

namespace Learnova.Services;


public class SubjectService
{
    private readonly AppDbContext _context;

    public SubjectService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SubjectCreateResult> Create(SubjectRequest request)
    {
        var existingCourse = await _context.Courses.FirstOrDefaultAsync(c => c.Id == request.CourseId);
        if (existingCourse == null)
        {
            return new SubjectCreateResult
            {
                Status = SubjectCreateStatus.CourseNotFound
            };
        }

        var existingSubject = await _context.Subjects
        .FirstOrDefaultAsync(s => s.CourseId == request.CourseId && s.Name == request.Name);
        if (existingSubject != null)
        {
            return new SubjectCreateResult
            {
                Status = SubjectCreateStatus.SubjectAlreadyExists
            };
        }

        if (request.TeacherId != null)
        {
            var existingTeacher = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.TeacherId);
            if (existingTeacher == null)
            {
                return new SubjectCreateResult
                {
                    Status = SubjectCreateStatus.TeacherNotFound
                };
            }

            if (existingTeacher.Role != UserRole.Teacher)
            {
                return new SubjectCreateResult
                {
                    Status = SubjectCreateStatus.UserIsNotTeacher
                };
            }
        }

        var subject = new Subject
        {
            Name = request.Name,
            CourseId = request.CourseId,
            TeacherId = request.TeacherId
        };

        await _context.Subjects.AddAsync(subject);
        await _context.SaveChangesAsync();

        var response = new SubjectResponse
        {
            Id = subject.Id,
            Name = subject.Name,
            CourseId = subject.CourseId,
            TeacherId = subject.TeacherId
        };

        return new SubjectCreateResult
        {
            Status = SubjectCreateStatus.Created,
            Subject = response
        };
    }
}