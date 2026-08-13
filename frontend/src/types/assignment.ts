export type AssignmentStatus = 'Draft' | 'Published';

export interface Assignment {
  id: string;
  title: string;
  description: string;

  courseId: string;
  courseName: string;

  subjectId: string;
  subjectName: string;

  teacherId: string;
  teacherName: string;

  status: AssignmentStatus;

  deadline: string;
  maximumMarks: number;
}

export interface AssignmentFormData {
  title: string;
  description: string;
  courseId: string;
  subjectId: string;
  deadline: string;
  maximumMarks: number;
}

export interface AssignmentUpdateFormData {
  title: string;
  description: string;
  deadline: string;
  maximumMarks: number;
}
