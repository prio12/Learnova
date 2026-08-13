import Link from 'next/link';

import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';

const adminSections = [
  {
    title: 'Users',
    description: 'Manage students, teachers, and administrators.',
    href: '/admin/users',
  },
  {
    title: 'Courses',
    description: 'Create and manage classes and courses.',
    href: '/admin/courses',
  },
  {
    title: 'Subjects',
    description: 'Manage subjects and teacher assignments.',
    href: '/admin/subjects',
  },
  {
    title: 'Enrollments',
    description: 'Manage student enrollment across courses.',
    href: '/admin/enrollments',
  },
  {
    title: 'Assignments',
    description: 'View assignments across the system.',
    href: '/admin/assignments',
  },
  {
    title: 'Submissions',
    description: 'Review all student submissions.',
    href: '/admin/submissions',
  },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Admin dashboard"
        description="Manage users, courses, subjects, assignments, and submissions."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section) => (
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
