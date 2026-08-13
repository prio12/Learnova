export interface Subject {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  teacherId: string | null;
  teacherName: string | null;
}
