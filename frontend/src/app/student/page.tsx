import Link from 'next/link';

import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';

const studentSections = [
  {
    title: 'Courses',
    description: 'View the courses you are enrolled in.',
    href: '/student/courses',
  },
  {
    title: 'Assignments',
    description: 'View and submit assignments for your courses.',
    href: '/student/assignments',
  },
  {
    title: 'Submissions',
    description: 'Track your submission status, marks, and feedback.',
    href: '/student/submissions',
  },
];

export default function StudentDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Student dashboard"
        description="View your courses, assignments, and submissions."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {studentSections.map((section) => (
          <Link key={section.href} href={section.href} className="group block">
            <Card className="h-full transition-colors duration-150 hover:border-(--text-placeholder)">
              <div className="flex h-full flex-col">
                <h2 className="text-sm font-semibold text-(--text-primary)">
                  {section.title}
                </h2>

                <p className="mt-2 text-sm leading-5 text-(--text-secondary)">
                  {section.description}
                </p>

                <span className="mt-auto pt-5 text-xs font-medium text-(--accent)">
                  Open {section.title.toLowerCase()} →
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
