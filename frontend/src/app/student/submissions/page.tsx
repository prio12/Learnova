'use client';

import type { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import {
  submissionAnswerSchema,
  type SubmissionAnswerFormData,
} from '@/lib/validation/submission';
import { Assignment } from '@/types/assignment';
import { Submission } from '@/types/submission';
import { ApiErrorResponse } from '@/types/api';

export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmissionAnswerFormData>({
    resolver: zodResolver(submissionAnswerSchema),
  });

  useEffect(() => {
    const loadData = async () => {
      setPageError(null);

      try {
        const [submissionsResponse, assignmentsResponse] = await Promise.all([
          api.get<Submission[]>('/api/Submission'),
          api.get<Assignment[]>('/api/Assignment'),
        ]);

        setSubmissions(submissionsResponse.data);
        setAssignments(assignmentsResponse.data);
      } catch {
        setPageError('Submissions could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const deadlineByAssignmentId = useMemo(() => {
    const map = new Map<string, string>();

    assignments.forEach((assignment) => {
      map.set(assignment.id, assignment.deadline);
    });

    return map;
  }, [assignments]);

  const canEdit = (submission: Submission) => {
    if (submission.submissionStatus === 'Graded') {
      return false;
    }

    const deadline = deadlineByAssignmentId.get(submission.assignmentId);

    if (!deadline) {
      return false;
    }

    return new Date(deadline).getTime() > Date.now();
  };

  const openEditModal = (submission: Submission) => {
    setEditError(null);
    reset({ answer: submission.answer });
    setEditingSubmission(submission);
  };

  const closeEditModal = () => {
    if (isSaving) {
      return;
    }

    setEditingSubmission(null);
    setEditError(null);
  };

  const onSubmit = async (data: SubmissionAnswerFormData) => {
    if (!editingSubmission) {
      return;
    }

    setEditError(null);
    setIsSaving(true);

    try {
      const response = await api.put<Submission>(
        `/api/Submission/${editingSubmission.id}`,
        { answer: data.answer },
      );

      setSubmissions((current) =>
        current.map((submission) =>
          submission.id === response.data.id ? response.data : submission,
        ),
      );

      setEditingSubmission(null);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      setEditError(
        axiosError.response?.data?.message ??
          'The submission could not be updated.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const columns: DataTableColumn<Submission>[] = [
    {
      key: 'assignment',
      header: 'Assignment',
      render: (submission) => (
        <span className="font-medium text-(--text-primary)">
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
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (submission) =>
        canEdit(submission) ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openEditModal(submission)}
          >
            Edit
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        title="My submissions"
        description="Track your submission status, marks, and feedback."
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
          emptyMessage="You haven't submitted any assignments yet."
        />
      )}

      <Modal
        open={editingSubmission !== null}
        title="Edit submission"
        onClose={closeEditModal}
        width="lg"
      >
        {editingSubmission && (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="edit-answer"
                  className="block text-[13px] font-medium text-(--text-primary)"
                >
                  Your answer
                </label>

                <textarea
                  id="edit-answer"
                  rows={8}
                  disabled={isSaving}
                  {...register('answer')}
                  className={`w-full resize-none rounded-md border bg-(--surface) px-3 py-2 text-sm text-(--text-primary) outline-none transition-colors duration-150 placeholder:text-(--text-placeholder) ${
                    errors.answer
                      ? 'border-(--danger) focus:border-(--danger) focus:ring-2 focus:ring-red-100'
                      : 'border-(--border) focus:border-(--accent) focus:ring-2 focus:ring-indigo-100'
                  }`}
                />

                {errors.answer && (
                  <p className="text-xs text-(--danger)">
                    {errors.answer.message}
                  </p>
                )}
              </div>

              {editError && (
                <div
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-(--danger)"
                >
                  {editError}
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-(--border) pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeEditModal}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
