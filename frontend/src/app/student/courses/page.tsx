'use client';

import { useEffect, useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { api } from '@/lib/api';
import { Enrollment } from '@/types/enrollment';

export default function StudentCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    const loadEnrollments = async () => {
      setPageError(null);

      try {
        const response = await api.get<Enrollment[]>('/api/Enrollment');

        setEnrollments(response.data);
      } catch {
        setPageError('Courses could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    loadEnrollments();
  }, []);

  const columns: DataTableColumn<Enrollment>[] = [
    {
      key: 'course',
      header: 'Course',
      render: (enrollment) => (
        <span className="font-medium text-(--text-primary)">
          {enrollment.courseName}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="My courses"
        description="Courses you are currently enrolled in."
      />

      {pageError ? (
        <div
          role="alert"
          className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-(--danger)"
        >
          {pageError}
        </div>
      ) : isLoading ? (
        <Card>
          <p className="text-sm text-(--text-secondary)">Loading courses...</p>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={enrollments}
          rowKey={(enrollment) => enrollment.id}
          emptyMessage="You are not enrolled in any courses yet. Contact an administrator."
        />
      )}
    </div>
  );
}
