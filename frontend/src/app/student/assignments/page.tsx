/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import type { AxiosError } from 'axios';
import { format, formatDistanceToNow } from 'date-fns';
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

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [submittingAssignment, setSubmittingAssignment] =
    useState<Assignment | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmissionAnswerFormData>({
    resolver: zodResolver(submissionAnswerSchema),
  });

  const loadData = async () => {
    setPageError(null);

    try {
      const [assignmentsResponse, submissionsResponse] = await Promise.all([
        api.get<Assignment[]>('/api/Assignment'),
        api.get<Submission[]>('/api/Submission'),
      ]);

      setAssignments(assignmentsResponse.data);
      setSubmissions(submissionsResponse.data);
    } catch {
      setPageError('Assignments could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submissionByAssignmentId = useMemo(() => {
    const map = new Map<string, Submission>();

    submissions.forEach((submission) => {
      map.set(submission.assignmentId, submission);
    });

    return map;
  }, [submissions]);

  const openSubmitModal = (assignment: Assignment) => {
    setSubmitError(null);
    reset({ answer: '' });
    setSubmittingAssignment(assignment);
  };

  const closeSubmitModal = () => {
    if (isSaving) {
      return;
    }

    setSubmittingAssignment(null);
    setSubmitError(null);
  };

  const onSubmit = async (data: SubmissionAnswerFormData) => {
    if (!submittingAssignment) {
      return;
    }

    setSubmitError(null);
    setIsSaving(true);

    try {
      const response = await api.post<Submission>('/api/Submission', {
        assignmentId: submittingAssignment.id,
        answer: data.answer,
      });

      setSubmissions((current) => [...current, response.data]);
      setSubmittingAssignment(null);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      setSubmitError(
        axiosError.response?.data?.message ??
          'The assignment could not be submitted.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const columns: DataTableColumn<Assignment>[] = [
    {
      key: 'title',
      header: 'Assignment',
      render: (assignment) => (
        <div className="min-w-0">
          <span className="font-medium text-(--text-primary)">
            {assignment.title}
          </span>

          <p className="mt-0.5 text-xs text-(--text-secondary)">
            {assignment.courseName} · {assignment.subjectName}
          </p>
        </div>
      ),
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (assignment) => {
        const deadline = new Date(assignment.deadline);
        const passed = deadline.getTime() <= Date.now();

        return (
          <div>
            <p className="text-sm text-(--text-primary)">
              {format(deadline, 'MMM d, yyyy')}
            </p>

            <p
              className={`mt-0.5 text-xs ${
                passed ? 'text-(--danger)' : 'text-(--text-secondary)'
              }`}
            >
              {formatDistanceToNow(deadline, { addSuffix: true })}
            </p>
          </div>
        );
      },
    },
    {
      key: 'marks',
      header: 'Max marks',
      align: 'center',
      render: (assignment) => (
        <span className="text-sm text-(--text-primary)">
          {assignment.maximumMarks}
        </span>
      ),
    },
    {
      key: 'action',
      header: '',
      align: 'right',
      render: (assignment) => {
        const submission = submissionByAssignmentId.get(assignment.id);
        const deadlinePassed =
          new Date(assignment.deadline).getTime() <= Date.now();

        if (submission) {
          return <Badge variant="success">Submitted</Badge>;
        }

        if (deadlinePassed) {
          return <Badge variant="danger">Deadline passed</Badge>;
        }

        return (
          <Button size="sm" onClick={() => openSubmitModal(assignment)}>
            Submit
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Assignments"
        description="Assignments published for the courses you're enrolled in."
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
            Loading assignments...
          </p>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={assignments}
          rowKey={(assignment) => assignment.id}
          emptyMessage="No assignments have been published for your courses yet."
        />
      )}

      <Modal
        open={submittingAssignment !== null}
        title={
          submittingAssignment
            ? `Submit: ${submittingAssignment.title}`
            : 'Submit'
        }
        onClose={closeSubmitModal}
        width="lg"
      >
        {submittingAssignment && (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4">
              <p className="whitespace-pre-wrap text-sm leading-6 text-(--text-secondary)">
                {submittingAssignment.description}
              </p>

              <div className="space-y-1.5">
                <label
                  htmlFor="submission-answer"
                  className="block text-[13px] font-medium text-(--text-primary)"
                >
                  Your answer
                </label>

                <textarea
                  id="submission-answer"
                  rows={8}
                  placeholder="Write your answer here..."
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

              {submitError && (
                <div
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-(--danger)"
                >
                  {submitError}
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-(--border) pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeSubmitModal}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
