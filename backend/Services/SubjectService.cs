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

        User? existingTeacher = null;

        if (request.TeacherId != null)
        {
            existingTeacher = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == request.TeacherId);

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
            CourseName = existingCourse.Name,
            TeacherId = subject.TeacherId,
            TeacherName = existingTeacher?.Name
        };

        return new SubjectCreateResult
        {
            Status = SubjectCreateStatus.Created,
            Subject = response
        };
    }

    public async Task<List<SubjectResponse>> GetAll()
    {
        var subjects = await _context.Subjects
            .Select(s => new SubjectResponse
            {
                Id = s.Id,
                Name = s.Name,
                CourseId = s.CourseId,
                CourseName = s.Course.Name,
                TeacherId = s.TeacherId,
                TeacherName = s.Teacher != null
                    ? s.Teacher.Name
                    : null
            })
            .ToListAsync();

        return subjects;
    }


    public async Task<SubjectUpdateResult> Update(
    Guid id,
    SubjectUpdateRequest request)
    {
        var subject = await _context.Subjects
      .FirstOrDefaultAsync(s => s.Id == id);

        if (subject == null)
        {
            return new SubjectUpdateResult
            {
                Status = SubjectUpdateStatus.SubjectNotFound
            };
        }



        //Checking duplicate subject name inside the course
        var existingSubject = await _context.Subjects
    .FirstOrDefaultAsync(s =>
        s.CourseId == subject.CourseId &&
        s.Name == request.Name &&
        s.Id != id);

        if (existingSubject != null)
        {
            return new SubjectUpdateResult
            {
                Status = SubjectUpdateStatus.SubjectAlreadyExists
            };
        }


        User? existingTeacher = null;

        if (request.TeacherId != null)
        {
            existingTeacher = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == request.TeacherId);

            if (existingTeacher == null)
            {
                return new SubjectUpdateResult
                {
                    Status = SubjectUpdateStatus.TeacherNotFound
                };
            }

            if (existingTeacher.Role != UserRole.Teacher)
            {
                return new SubjectUpdateResult
                {
                    Status = SubjectUpdateStatus.UserIsNotTeacher
                };
            }
        }

        subject.Name = request.Name;
        subject.TeacherId = request.TeacherId;

        await _context.SaveChangesAsync();

        var courseName = await _context.Courses
    .Where(c => c.Id == subject.CourseId)
    .Select(c => c.Name)
    .FirstAsync();


        var response = new SubjectResponse
        {
            Id = subject.Id,
            Name = subject.Name,
            CourseId = subject.CourseId,
            CourseName = courseName,
            TeacherId = subject.TeacherId,
            TeacherName = existingTeacher?.Name
        };

        return new SubjectUpdateResult
        {
            Status = SubjectUpdateStatus.Updated,
            Subject = response
        };
    }


    public async Task<DeleteSubjectStatus> Delete(Guid id)
    {
        var subject = await _context.Subjects
            .FirstOrDefaultAsync(s => s.Id == id);

        if (subject == null)
        {
            return DeleteSubjectStatus.NotFound;
        }

        var hasAssignments = await _context.Assignments
            .AnyAsync(a => a.SubjectId == id);

        if (hasAssignments)
        {
            return DeleteSubjectStatus.HasAssignments;
        }

        _context.Subjects.Remove(subject);
        await _context.SaveChangesAsync();

        return DeleteSubjectStatus.Deleted;
    }
}