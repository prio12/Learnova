'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { api } from '@/lib/api';
import type { Assignment } from '@/types/assignment';

type StatusFilter = 'All' | 'Draft' | 'Published';

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssignments = async () => {
      setPageError(null);

      try {
        const response = await api.get<Assignment[]>('/api/Assignment');

        setAssignments(response.data);
      } catch {
        setPageError('Assignments could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignments();
  }, []);

  const filteredAssignments = useMemo(() => {
    if (statusFilter === 'All') {
      return assignments;
    }

    return assignments.filter(
      (assignment) => assignment.status === statusFilter,
    );
  }, [assignments, statusFilter]);

  const formatDeadline = (deadline: string) => {
    return new Date(deadline).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const columns: DataTableColumn<Assignment>[] = [
    {
      key: 'title',
      header: 'Assignment',
      render: (assignment) => (
        <div>
          <p className="font-medium text-(--text-primary)">
            {assignment.title}
          </p>

          <p className="mt-0.5 text-xs text-(--text-secondary)">
            {assignment.maximumMarks} marks
          </p>
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Course',
      render: (assignment) => (
        <span className="text-sm text-(--text-secondary)">
          {assignment.courseName}
        </span>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (assignment) => (
        <span className="text-sm text-(--text-secondary)">
          {assignment.subjectName}
        </span>
      ),
    },
    {
      key: 'teacher',
      header: 'Teacher',
      render: (assignment) => (
        <span className="text-sm text-(--text-secondary)">
          {assignment.teacherName}
        </span>
      ),
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (assignment) => (
        <span className="whitespace-nowrap text-sm text-(--text-secondary)">
          {formatDeadline(assignment.deadline)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (assignment) => (
        <div className="flex justify-center">
          <Badge
            variant={assignment.status === 'Published' ? 'success' : 'neutral'}
          >
            {assignment.status}
          </Badge>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Assignments"
        description="View assignments across courses, subjects, and teachers."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-(--text-secondary)">
          {filteredAssignments.length} assignment
          {filteredAssignments.length === 1 ? '' : 's'}
        </p>

        <div className="flex items-center gap-1 rounded-md border border-(--border) bg-(--surface) p-1">
          {(['All', 'Draft', 'Published'] as StatusFilter[]).map((status) => {
            const isActive = statusFilter === status;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`cursor-pointer rounded px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-(--accent) text-white'
                    : 'text-(--text-secondary) hover:bg-(--surface-hover) hover:text-(--text-primary)'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {pageError ? (
        <div
          role="alert"
          className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-(--danger)"
        >
          {pageError}
        </div>
      ) : isLoading ? (
        <Card>
          <p className="text-sm text-(--text-secondary)">
            Loading assignments...
          </p>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={filteredAssignments}
          rowKey={(assignment) => assignment.id}
          emptyMessage="No assignments match this status."
        />
      )}
    </div>
  );
}
