import Link from 'next/link';

import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';

const teacherSections = [
  {
    title: 'Assignments',
    description: 'Create, manage, and publish assignments for your students.',
    href: '/teacher/assignments',
  },
  {
    title: 'Submissions',
    description: 'Review student submissions and grade their work.',
    href: '/teacher/submissions',
  },
];

export default function TeacherDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Teacher dashboard"
        description="Manage your assignments and review student submissions."
      />

      <section className="grid gap-4 sm:grid-cols-2">
        {teacherSections.map((section) => (
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
