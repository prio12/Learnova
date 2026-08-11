using Learnova.Data;
using Learnova.DTO.Course;
using Learnova.Models;
using Microsoft.EntityFrameworkCore;

namespace Learnova.Services;

public enum DeleteCourseResult
{
    NotFound,
    HasDependencies,
    Deleted
}

public class CourseService
{
    private readonly AppDbContext _context;

    public CourseService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CourseResponse> Create(CourseRequest request)
    {
        var course = new Course
        {
            Name = request.Name,
            Description = request.Description
        };
        await _context.Courses.AddAsync(course);
        await _context.SaveChangesAsync();

        var response = new CourseResponse
        {
            Name = course.Name,
            Id = course.Id,
            Description = course.Description
        };
        return response;
    }

    public async Task<List<CourseResponse>> GetAll()
    {
        var courses = await _context.Courses.Select(c => new CourseResponse
        {
            Name = c.Name,
            Description = c.Description,
            Id = c.Id
        }).ToListAsync();

        return courses;
    }

    public async Task<CourseResponse?> GetById(Guid id)
    {
        var course = await _context.Courses.Where(c => c.Id == id)
        .Select(c => new CourseResponse
        {
            Name = c.Name,
            Description = c.Description,
            Id = c.Id
        }).FirstOrDefaultAsync();
        return course;
    }

    public async Task<CourseResponse?> Update(Guid id, CourseRequest request)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == id);
        if (course == null)
        {
            return null;
        }
        course.Name = request.Name;
        course.Description = request.Description;

        await _context.SaveChangesAsync();
        return new CourseResponse
        {
            Id = course.Id,
            Name = course.Name,
            Description = course.Description
        };
    }

    public async Task<DeleteCourseResult> Delete(Guid id)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == id);

        if (course == null)
        {
            return DeleteCourseResult.NotFound;
        }

        var hasRelatedData =
        await _context.Subjects.AnyAsync(s => s.CourseId == id) ||
        await _context.Assignments.AnyAsync(a => a.CourseId == id) ||
        await _context.Enrollments.AnyAsync(e => e.CourseId == id);

        if (hasRelatedData)
        {
            return DeleteCourseResult.HasDependencies;
        }
        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();
        return DeleteCourseResult.Deleted;
    }
}