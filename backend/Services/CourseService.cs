using Learnova.Data;
using Learnova.DTO.Course;
using Learnova.Models;
using Microsoft.EntityFrameworkCore;

namespace Learnova.Services;

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
}