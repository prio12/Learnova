'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { api } from '@/lib/api';
import { Submission } from '@/types/submission';

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    const loadSubmissions = async () => {
      setPageError(null);

      try {
        const response = await api.get<Submission[]>('/api/Submission');

        setSubmissions(response.data);
      } catch {
        setPageError('Submissions could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  const columns: DataTableColumn<Submission>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (submission) => (
        <span className="font-medium text-(--text-primary)">
          {submission.studentName}
        </span>
      ),
    },
    {
      key: 'assignment',
      header: 'Assignment',
      render: (submission) => (
        <span className="text-sm text-(--text-secondary)">
          {submission.assignmentTitle}
        </span>
      ),
    },
    {
      key: 'submittedAt',
      header: 'Submitted',
      render: (submission) => (
        <span className="text-sm text-(--text-secondary)">
          {new Date(submission.submittedAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (submission) => (
        <div className="flex justify-center">
          <Badge
            variant={
              submission.submissionStatus === 'Graded' ? 'success' : 'neutral'
            }
          >
            {submission.submissionStatus}
          </Badge>
        </div>
      ),
    },
    {
      key: 'marks',
      header: 'Marks',
      align: 'center',
      render: (submission) => (
        <span className="text-sm text-(--text-secondary)">
          {submission.marks !== null ? submission.marks : '—'}
        </span>
      ),
    },
    {
      key: 'feedback',
      header: 'Feedback',
      render: (submission) => (
        <span
          className="block max-w-70 truncate text-sm text-(--text-secondary)"
          title={submission.feedback ?? undefined}
        >
          {submission.feedback || '—'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Submissions"
        description="View all student submissions across assignments."
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
          <p className="text-sm text-(--text-secondary)">
            Loading submissions...
          </p>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={submissions}
          rowKey={(submission) => submission.id}
          emptyMessage="No submissions have been created yet."
        />
      )}
    </div>
  );
}
