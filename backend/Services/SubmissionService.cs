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



    public async Task<List<SubmissionResponse>> GetAll(
    Guid userId,
    string role)
    {
        var query = _context.Submissions.AsQueryable();

        if (role == UserRole.Student.ToString())
        {
            query = query
                .Where(s => s.StudentId == userId);
        }
        else if (role == UserRole.Teacher.ToString())
        {
            query = query
                .Where(s => s.Assignment.TeacherId == userId);
        }
        // no filter for admin

        var submissions = await query
            .Select(s => new SubmissionResponse
            {
                Id = s.Id,

                AssignmentId = s.AssignmentId,
                AssignmentTitle = s.Assignment.Title,

                StudentId = s.StudentId,
                StudentName = s.Student.Name,

                Answer = s.Answer,
                SubmittedAt = s.SubmittedAt,

                Marks = s.Marks,
                Feedback = s.Feedback,
                SubmissionStatus = s.SubmissionStatus
            })
            .ToListAsync();

        return submissions;
    }


    public async Task<SubmissionUpdateResult> Update(
    Guid submissionId,
    Guid studentId,
    SubmissionUpdateRequest request)
    {
        var submission = await _context.Submissions
            .Include(s => s.Assignment)
            .FirstOrDefaultAsync(s => s.Id == submissionId);

        if (submission == null)
        {
            return new SubmissionUpdateResult
            {
                Status = SubmissionUpdateStatus.SubmissionNotFound
            };
        }

        if (submission.StudentId != studentId)
        {
            return new SubmissionUpdateResult
            {
                Status = SubmissionUpdateStatus.NotOwner
            };
        }

        if (DateTime.UtcNow > submission.Assignment.Deadline)
        {
            return new SubmissionUpdateResult
            {
                Status = SubmissionUpdateStatus.DeadlinePassed
            };
        }

        submission.Answer = request.Answer;

        await _context.SaveChangesAsync();

        var response = await _context.Submissions
            .Where(s => s.Id == submissionId)
            .Select(s => new SubmissionResponse
            {
                Id = s.Id,
                AssignmentId = s.AssignmentId,
                AssignmentTitle = s.Assignment.Title,
                StudentId = s.StudentId,
                StudentName = s.Student.Name,
                Answer = s.Answer,
                SubmittedAt = s.SubmittedAt,
                Marks = s.Marks,
                Feedback = s.Feedback,
                SubmissionStatus = s.SubmissionStatus
            })
            .FirstAsync();

        return new SubmissionUpdateResult
        {
            Status = SubmissionUpdateStatus.Updated,
            Submission = response
        };
    }



    public async Task<SubmissionGradeResult> Grade(
        Guid submissionId,
        Guid teacherId,
        SubmissionGradeRequest request)
    {
        var submission = await _context.Submissions
            .Include(s => s.Assignment)
            .FirstOrDefaultAsync(s => s.Id == submissionId);

        if (submission == null)
        {
            return new SubmissionGradeResult
            {
                Status = SubmissionGradeStatus.SubmissionNotFound
            };
        }

        if (submission.Assignment.TeacherId != teacherId)
        {
            return new SubmissionGradeResult
            {
                Status = SubmissionGradeStatus.NotOwner
            };
        }

        if (request.Marks > submission.Assignment.MaximumMarks)
        {
            return new SubmissionGradeResult
            {
                Status = SubmissionGradeStatus.MarksExceedMaximum
            };
        }

        submission.Marks = request.Marks;
        submission.Feedback = request.Feedback;
        submission.SubmissionStatus = SubmissionStatus.Graded;

        await _context.SaveChangesAsync();

        var response = await _context.Submissions
            .Where(s => s.Id == submissionId)
            .Select(s => new SubmissionResponse
            {
                Id = s.Id,
                AssignmentId = s.AssignmentId,
                AssignmentTitle = s.Assignment.Title,
                StudentId = s.StudentId,
                StudentName = s.Student.Name,
                Answer = s.Answer,
                SubmittedAt = s.SubmittedAt,
                Marks = s.Marks,
                Feedback = s.Feedback,
                SubmissionStatus = s.SubmissionStatus
            })
            .FirstAsync();

        return new SubmissionGradeResult
        {
            Status = SubmissionGradeStatus.Graded,
            Submission = response
        };
    }



    public async Task<SubmissionOverviewResult> GetAssignmentOverview(
    Guid assignmentId,
    Guid teacherId)
    {
        var assignment = await _context.Assignments
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null)
        {
            return new SubmissionOverviewResult
            {
                Status = SubmissionOverviewStatus.AssignmentNotFound
            };
        }

        if (assignment.TeacherId != teacherId)
        {
            return new SubmissionOverviewResult
            {
                Status = SubmissionOverviewStatus.NotOwner
            };
        }

        var students = await _context.Enrollments
            .Where(e => e.CourseId == assignment.CourseId)
            .Select(e => new AssignmentSubmissionOverviewResponse
            {
                StudentId = e.StudentId,
                StudentName = e.Student.Name,
                HasSubmitted = _context.Submissions.Any(s =>
                    s.AssignmentId == assignmentId &&
                    s.StudentId == e.StudentId)
            })
            .ToListAsync();

        var submissionIds = students
            .Where(s => s.HasSubmitted)
            .Select(s => s.StudentId)
            .ToList();

        var submissions = await _context.Submissions
            .Where(s =>
                s.AssignmentId == assignmentId &&
                submissionIds.Contains(s.StudentId))
            .Select(s => new
            {
                s.StudentId,
                s.Id,
                s.SubmittedAt,
                s.Marks,
                s.Feedback,
                s.SubmissionStatus
            })
            .ToListAsync();

        foreach (var student in students)
        {
            var submission = submissions
                .FirstOrDefault(s => s.StudentId == student.StudentId);

            if (submission != null)
            {
                student.SubmissionId = submission.Id;
                student.SubmittedAt = submission.SubmittedAt;
                student.Marks = submission.Marks;
                student.Feedback = submission.Feedback;
                student.SubmissionStatus = submission.SubmissionStatus;
            }
        }

        return new SubmissionOverviewResult
        {
            Status = SubmissionOverviewStatus.Success,
            Students = students
        };
    }
}