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
            MaximumMarks = assignment.MaximumMarks
        };

        return new AssignmentCreateResult
        {
            Status = AssignmentCreateStatus.Created,
            Assignment = response
        };
    }
}