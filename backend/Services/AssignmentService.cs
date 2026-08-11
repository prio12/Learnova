using Learnova.Data;
using Learnova.DTO.Assignment;
using Learnova.Models;
using Microsoft.EntityFrameworkCore;

namespace Learnova.Services;

public class AssignmentService
{
    private readonly AppDbContext _context;

    public AssignmentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AssignmentCreateResult> Create(
        AssignmentRequest request,
        Guid teacherId)
    {
        var existingCourse = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == request.CourseId);

        if (existingCourse == null)
        {
            return new AssignmentCreateResult
            {
                Status = AssignmentCreateStatus.CourseNotFound
            };
        }

        var existingSubject = await _context.Subjects
            .FirstOrDefaultAsync(s => s.Id == request.SubjectId);

        if (existingSubject == null)
        {
            return new AssignmentCreateResult
            {
                Status = AssignmentCreateStatus.SubjectNotFound
            };
        }

        if (existingSubject.CourseId != request.CourseId)
        {
            return new AssignmentCreateResult
            {
                Status = AssignmentCreateStatus.SubjectDoesNotBelongToCourse
            };
        }

        if (existingSubject.TeacherId != teacherId)
        {
            return new AssignmentCreateResult
            {
                Status = AssignmentCreateStatus.TeacherNotAssignedToSubject
            };
        }

        var existingTeacher = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == teacherId);

        if (existingTeacher == null)
        {
            return new AssignmentCreateResult
            {
                Status = AssignmentCreateStatus.TeacherNotFound
            };
        }

        var assignment = new Assignment
        {
            Title = request.Title,
            Description = request.Description,
            CourseId = request.CourseId,
            SubjectId = request.SubjectId,
            TeacherId = teacherId,
            Deadline = request.Deadline,
            MaximumMarks = request.MaximumMarks
        };

        await _context.Assignments.AddAsync(assignment);
        await _context.SaveChangesAsync();

        var response = new AssignmentResponse
        {
            Id = assignment.Id,
            Title = assignment.Title,
            Description = assignment.Description,

            CourseId = assignment.CourseId,
            CourseName = existingCourse.Name,

            SubjectId = assignment.SubjectId,
            SubjectName = existingSubject.Name,

            TeacherId = teacherId,
            TeacherName = existingTeacher.Name,


            Deadline = assignment.Deadline,
            MaximumMarks = assignment.MaximumMarks,
            Status = assignment.Status,
        };

        return new AssignmentCreateResult
        {
            Status = AssignmentCreateStatus.Created,
            Assignment = response
        };
    }

    public async Task<List<AssignmentResponse>> GetAll(
      Guid userId,
      string role)
    {
        var query = _context.Assignments.AsQueryable();

        if (role == UserRole.Student.ToString())
        {
            query = query
                .Where(a =>
                    a.Status == AssignmentStatus.Published &&
                    _context.Enrollments.Any(e =>
                        e.StudentId == userId &&
                        e.CourseId == a.CourseId));
        }
        else if (role == UserRole.Teacher.ToString())
        {
            query = query
                .Where(a => a.TeacherId == userId);
        }
        // For Admin no filter

        var assignments = await query
            .Select(a => new AssignmentResponse
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,

                CourseId = a.CourseId,
                CourseName = a.Course.Name,

                SubjectId = a.SubjectId,
                SubjectName = a.Subject.Name,

                TeacherId = a.TeacherId,
                TeacherName = a.Teacher.Name,

                Deadline = a.Deadline,
                MaximumMarks = a.MaximumMarks,

                Status = a.Status
            })
            .ToListAsync();

        return assignments;
    }


    public async Task<AssignmentResponse?> GetById(
    Guid assignmentId,
    Guid userId,
    string role)
    {
        var assignment = await _context.Assignments
            .Where(a => a.Id == assignmentId)
            .Select(a => new AssignmentResponse
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,

                CourseId = a.CourseId,
                CourseName = a.Course.Name,

                SubjectId = a.SubjectId,
                SubjectName = a.Subject.Name,

                TeacherId = a.TeacherId,
                TeacherName = a.Teacher.Name,

                Deadline = a.Deadline,
                MaximumMarks = a.MaximumMarks,
                Status = a.Status
            })
            .FirstOrDefaultAsync();

        if (assignment == null)
        {
            return null;
        }

        if (role == UserRole.Admin.ToString())
        {
            return assignment;
        }

        if (role == UserRole.Teacher.ToString())
        {
            return assignment.TeacherId == userId
                ? assignment
                : null;
        }

        if (role == UserRole.Student.ToString())
        {
            var isEnrolled = await _context.Enrollments
                .AnyAsync(e =>
                    e.StudentId == userId &&
                    e.CourseId == assignment.CourseId);

            if (!isEnrolled || assignment.Status != AssignmentStatus.Published)
            {
                return null;
            }

            return assignment;
        }

        return null;
    }
}