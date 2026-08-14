'use client';

import { useEffect, useMemo, useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { api } from '@/lib/api';
import { Enrollment } from '@/types/enrollment';
import { Subject } from '@/types/subject';

export default function StudentCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setPageError(null);

      try {
        const [enrollmentsResponse, subjectsResponse] = await Promise.all([
          api.get<Enrollment[]>('/api/Enrollment'),
          api.get<Subject[]>('/api/Subject'),
        ]);

        setEnrollments(enrollmentsResponse.data);
        setSubjects(subjectsResponse.data);
      } catch {
        setPageError('Courses could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const subjectsByCourseId = useMemo(() => {
    const map = new Map<string, Subject[]>();

    subjects.forEach((subject) => {
      const existing = map.get(subject.courseId) ?? [];
      existing.push(subject);
      map.set(subject.courseId, existing);
    });

    return map;
  }, [subjects]);

  const subjectColumns: DataTableColumn<Subject>[] = [
    {
      key: 'name',
      header: 'Subject',
      render: (subject) => (
        <span
          className="block max-w-60 truncate text-sm font-medium text-(--text-primary)"
          title={subject.name}
        >
          {subject.name}
        </span>
      ),
    },
    {
      key: 'teacher',
      header: 'Teacher',
      render: (subject) => (
        <span
          className="block max-w-60 truncate text-sm text-(--text-secondary)"
          title={subject.teacherName ?? undefined}
        >
          {subject.teacherName ?? 'No teacher assigned'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="My courses"
        description="Courses you are enrolled in and their subjects."
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
      ) : enrollments.length === 0 ? (
        <Card>
          <p className="text-sm text-(--text-secondary)">
            You are not enrolled in any courses yet. Contact an administrator.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {enrollments.map((enrollment) => {
            const courseSubjects =
              subjectsByCourseId.get(enrollment.courseId) ?? [];

            return (
              <div key={enrollment.id}>
                <h2 className="mb-2 text-sm font-semibold text-(--text-primary)">
                  {enrollment.courseName}
                </h2>

                {courseSubjects.length > 0 ? (
                  <DataTable
                    columns={subjectColumns}
                    data={courseSubjects}
                    rowKey={(subject) => subject.id}
                  />
                ) : (
                  <Card>
                    <p className="text-sm text-(--text-secondary)">
                      No subjects have been added to this course yet.
                    </p>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
