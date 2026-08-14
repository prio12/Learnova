export type SubmissionStatus = 'Submitted' | 'Graded';

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  answer: string;
  submittedAt: string;
  marks: number | null;
  feedback: string | null;
  submissionStatus: SubmissionStatus;
}

export interface SubmissionGradeFormData {
  marks: number;
  feedback: string;
}

export interface SubmissionFormData {
  answer: string;
}
