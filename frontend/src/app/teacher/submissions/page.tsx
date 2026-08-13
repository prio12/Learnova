/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import type { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import {
  submissionGradeSchema,
  type SubmissionGradeFormData,
} from '@/lib/validation/submission';
import { Submission } from '@/types/submission';
import { ApiErrorResponse } from '@/types/api';

export default function TeacherSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmissionGradeFormData>({
    resolver: zodResolver(submissionGradeSchema),
  });

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

  useEffect(() => {
    loadSubmissions();
  }, []);

  const openGradeModal = (submission: Submission) => {
    setGradeError(null);

    reset({
      marks: submission.marks ?? 0,
      feedback: submission.feedback ?? '',
    });

    setGradingSubmission(submission);
  };

  const closeGradeModal = () => {
    if (isSaving) {
      return;
    }

    setGradingSubmission(null);
    setGradeError(null);
  };

  const onSubmit = async (data: SubmissionGradeFormData) => {
    if (!gradingSubmission) {
      return;
    }

    setGradeError(null);
    setIsSaving(true);

    try {
      const response = await api.put<Submission>(
        `/api/Submission/${gradingSubmission.id}/grade`,
        {
          marks: data.marks,
          feedback: data.feedback,
        },
      );

      setSubmissions((current) =>
        current.map((submission) =>
          submission.id === response.data.id ? response.data : submission,
        ),
      );

      setGradingSubmission(null);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      setGradeError(
        axiosError.response?.data?.message ??
          'The submission could not be graded.',
      );
    } finally {
      setIsSaving(false);
    }
  };

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
      key: 'actions',
      header: '',
      align: 'right',
      render: (submission) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => openGradeModal(submission)}
        >
          {submission.submissionStatus === 'Graded' ? 'Update grade' : 'Grade'}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Submissions"
        description="Review and grade submissions for your assignments."
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
          emptyMessage="No submissions yet."
        />
      )}

      <Modal
        open={gradingSubmission !== null}
        title={
          gradingSubmission
            ? `Grade: ${gradingSubmission.studentName}`
            : 'Grade submission'
        }
        onClose={closeGradeModal}
        width="lg"
      >
        {gradingSubmission && (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4">
              <div className="rounded-md border border-(--border) bg-(--background) px-3 py-3 text-sm text-(--text-secondary)">
                <p className="mb-1 text-xs font-medium text-(--text-primary)">
                  Student&apos;s answer
                </p>
                <div className="max-h-48 overflow-y-auto whitespace-pre-wrap pr-1">
                  {gradingSubmission.answer}
                </div>
              </div>

              <Input
                label="Marks"
                type="number"
                min={0}
                error={errors.marks?.message}
                disabled={isSaving}
                {...register('marks', { valueAsNumber: true })}
              />

              <div className="space-y-1.5">
                <label
                  htmlFor="grade-feedback"
                  className="block text-[13px] font-medium text-(--text-primary)"
                >
                  Feedback
                </label>

                <textarea
                  id="grade-feedback"
                  rows={4}
                  disabled={isSaving}
                  {...register('feedback')}
                  className={`w-full resize-none rounded-md border bg-(--surface) px-3 py-2 text-sm text-(--text-primary) outline-none transition-colors duration-150 placeholder:text-(--text-placeholder) ${
                    errors.feedback
                      ? 'border-(--danger) focus:border-(--danger) focus:ring-2 focus:ring-red-100'
                      : 'border-(--border) focus:border-(--accent) focus:ring-2 focus:ring-indigo-100'
                  }`}
                />

                {errors.feedback && (
                  <p className="text-xs text-(--danger)">
                    {errors.feedback.message}
                  </p>
                )}
              </div>

              {gradeError && (
                <div
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-(--danger)"
                >
                  {gradeError}
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-(--border) pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeGradeModal}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save grade'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
