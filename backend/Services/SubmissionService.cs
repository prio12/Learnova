using Learnova.Data;
using Learnova.DTO.Submission;
using Learnova.Models;
using Microsoft.EntityFrameworkCore;

namespace Learnova.Services;

public class SubmissionService
{
    private readonly AppDbContext _context;

    public SubmissionService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SubmissionCreateResult> Create(
        SubmissionRequest request,
        Guid studentId)
    {
        var assignment = await _context.Assignments
            .FirstOrDefaultAsync(a => a.Id == request.AssignmentId);

        if (assignment == null)
        {
            return new SubmissionCreateResult
            {
                Status = SubmissionCreateStatus.AssignmentNotFound
            };
        }

        if (assignment.Status != AssignmentStatus.Published)
        {
            return new SubmissionCreateResult
            {
                Status = SubmissionCreateStatus.AssignmentNotPublished
            };
        }

        var isEnrolled = await _context.Enrollments
            .AnyAsync(e =>
                e.StudentId == studentId &&
                e.CourseId == assignment.CourseId);

        if (!isEnrolled)
        {
            return new SubmissionCreateResult
            {
                Status = SubmissionCreateStatus.StudentNotEnrolled
            };
        }

        if (DateTime.UtcNow > assignment.Deadline)
        {
            return new SubmissionCreateResult
            {
                Status = SubmissionCreateStatus.DeadlinePassed
            };
        }

        var existingSubmission = await _context.Submissions
            .FirstOrDefaultAsync(s =>
                s.AssignmentId == request.AssignmentId &&
                s.StudentId == studentId);

        if (existingSubmission != null)
        {
            return new SubmissionCreateResult
            {
                Status = SubmissionCreateStatus.AlreadySubmitted
            };
        }

        var submission = new Submission
        {
            AssignmentId = assignment.Id,
            StudentId = studentId,
            Answer = request.Answer,
            SubmittedAt = DateTime.UtcNow,
            SubmissionStatus = SubmissionStatus.Submitted
        };

        await _context.Submissions.AddAsync(submission);
        await _context.SaveChangesAsync();

        var response = new SubmissionResponse
        {
            Id = submission.Id,

            AssignmentId = assignment.Id,
            AssignmentTitle = assignment.Title,

            StudentId = studentId,
            StudentName = await _context.Users
                .Where(u => u.Id == studentId)
                .Select(u => u.Name)
                .FirstAsync(),

            Answer = submission.Answer,
            SubmittedAt = submission.SubmittedAt,
            Marks = submission.Marks,
            Feedback = submission.Feedback,
            SubmissionStatus = submission.SubmissionStatus
        };

        return new SubmissionCreateResult
        {
            Status = SubmissionCreateStatus.Created,
            Submission = response
        };
    }
}