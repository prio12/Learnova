import type { UserRole } from '@/store/authStore';

export interface NavigationItem {
  label: string;
  href: string;
}

export const navigationByRole: Record<UserRole, NavigationItem[]> = {
  Admin: [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Courses', href: '/admin/courses' },
    { label: 'Subjects', href: '/admin/subjects' },
    { label: 'Enrollments', href: '/admin/enrollments' },
    { label: 'Assignments', href: '/admin/assignments' },
    { label: 'Submissions', href: '/admin/submissions' },
  ],

  Teacher: [
    { label: 'Dashboard', href: '/teacher' },
    { label: 'Assignments', href: '/teacher/assignments' },
    { label: 'Submissions', href: '/teacher/submissions' },
  ],

  Student: [
    { label: 'Dashboard', href: '/student' },
    { label: 'Courses', href: '/student/courses' },
    { label: 'Assignments', href: '/student/assignments' },
    { label: 'Submissions', href: '/student/submissions' },
  ],
};
