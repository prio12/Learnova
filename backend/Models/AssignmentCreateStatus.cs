namespace Learnova.Models;

public enum AssignmentCreateStatus
{
    CourseNotFound,
    SubjectNotFound,
    SubjectDoesNotBelongToCourse,
    TeacherNotFound,
    TeacherNotAssignedToSubject,
    Created
}