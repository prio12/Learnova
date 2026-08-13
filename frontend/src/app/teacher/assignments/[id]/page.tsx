'use client';

import type { AxiosError } from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';

import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import {
  assignmentSchema,
  type AssignmentFormData,
} from '@/lib/validation/assignment';
import { toDateTimeLocal } from '@/lib/date';
import { Assignment } from '@/types/assignment';
import { ApiErrorResponse } from '@/types/api';

export default function TeacherAssignmentDetailsPage() {
  const params = useParams<{ id: string }>();
  const assignmentId = params.id;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
  });

  useEffect(() => {
    const loadAssignment = async () => {
      setIsLoading(true);
      setPageError(null);

      try {
        const response = await api.get<Assignment>(
          `/api/Assignment/${assignmentId}`,
        );

        setAssignment(response.data);
        setCurrentTime(Date.now());
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;

        setPageError(
          axiosError.response?.data?.message ??
            'The assignment could not be loaded.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (assignmentId) {
      loadAssignment();
    }
  }, [assignmentId]);

  const openEditModal = () => {
    if (!assignment) {
      return;
    }

    setEditError(null);

    reset({
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId,
      subjectId: assignment.subjectId,
      deadline: toDateTimeLocal(assignment.deadline),
      maximumMarks: assignment.maximumMarks,
    });

    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    if (isSaving) {
      return;
    }

    setIsEditOpen(false);
    setEditError(null);
  };

  const onSubmit = async (data: AssignmentFormData) => {
    if (!assignment) {
      return;
    }

    setEditError(null);
    setIsSaving(true);

    try {
      const response = await api.put<Assignment>(
        `/api/Assignment/${assignment.id}`,
        {
          title: data.title,
          description: data.description,
          deadline: new Date(data.deadline).toISOString(),
          maximumMarks: data.maximumMarks,
        },
      );

      setAssignment(response.data);
      setIsEditOpen(false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      setEditError(
        axiosError.response?.data?.message ??
          'The assignment could not be updated.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Assignment"
          description="Loading assignment details..."
        />

        <Card>
          <p className="text-sm text-(--text-secondary)">Loading...</p>
        </Card>
      </div>
    );
  }

  if (pageError || !assignment) {
    return (
      <div>
        <PageHeader
          title="Assignment"
          description="Unable to load this assignment."
        />

        <div
          role="alert"
          className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-(--danger)"
        >
          {pageError ?? 'Assignment not found.'}
        </div>

        <Link
          href="/teacher/assignments"
          className="mt-4 inline-flex text-sm font-medium text-(--accent) transition-colors duration-150 hover:text-(--accent-hover)"
        >
          ← Back to assignments
        </Link>
      </div>
    );
  }
  const deadline = new Date(assignment.deadline);
  const deadlinePassed =
    currentTime !== null && deadline.getTime() <= currentTime;

  return (
    <>
      <div>
        <div className="mb-4">
          <Link
            href="/teacher/assignments"
            className="text-xs font-medium text-(--text-secondary) transition-colors duration-150 hover:text-(--text-primary)"
          >
            ← Back to assignments
          </Link>
        </div>

        <PageHeader
          title={assignment.title}
          description={`${assignment.courseName} · ${assignment.subjectName}`}
          actions={
            <Button variant="secondary" onClick={openEditModal}>
              Edit assignment
            </Button>
          }
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <Card>
            <div>
              <h2 className="text-sm font-semibold text-(--text-primary)">
                Description
              </h2>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-(--text-secondary)">
                {assignment.description}
              </p>
            </div>
          </Card>

          <div className="space-y-4">
            <Card padding="sm">
              <p className="text-xs text-(--text-secondary)">Status</p>

              <div className="mt-2">
                <Badge
                  variant={
                    assignment.status === 'Published' ? 'accent' : 'neutral'
                  }
                >
                  {assignment.status}
                </Badge>
              </div>
            </Card>

            <Card padding="sm">
              <p className="text-xs text-(--text-secondary)">Deadline</p>

              <p className="mt-1 text-sm font-medium text-(--text-primary)">
                {format(deadline, 'MMM d, yyyy · h:mm a')}
              </p>

              <p
                className={`mt-1 text-xs ${
                  deadlinePassed ? 'text-(--danger)' : 'text-(--text-secondary)'
                }`}
              >
                {deadlinePassed ? 'Deadline passed' : 'Upcoming'}
              </p>
            </Card>

            <Card padding="sm">
              <p className="text-xs text-(--text-secondary)">Maximum marks</p>

              <p className="mt-1 text-sm font-medium text-(--text-primary)">
                {assignment.maximumMarks}
              </p>
            </Card>

            <Card padding="sm">
              <p className="text-xs text-(--text-secondary)">Subject teacher</p>

              <p className="mt-1 text-sm font-medium text-(--text-primary)">
                {assignment.teacherName}
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        open={isEditOpen}
        title="Edit assignment"
        onClose={closeEditModal}
        width="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <Input
              label="Title"
              placeholder="Assignment title"
              error={errors.title?.message}
              disabled={isSaving}
              {...register('title')}
            />

            <div className="space-y-1.5">
              <label
                htmlFor="assignment-description"
                className="block text-[13px] font-medium text-(--text-primary)"
              >
                Description
              </label>

              <textarea
                id="assignment-description"
                rows={6}
                disabled={isSaving}
                {...register('description')}
                className={`w-full resize-none rounded-md border bg-(--surface) px-3 py-2 text-sm text-(--text-primary) outline-none transition-colors duration-150 placeholder:text-(--text-placeholder) ${
                  errors.description
                    ? 'border-(--danger) focus:border-(--danger) focus:ring-2 focus:ring-red-100'
                    : 'border-(--border) focus:border-(--accent) focus:ring-2 focus:ring-indigo-100'
                }`}
              />

              {errors.description && (
                <p className="text-xs text-(--danger)">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="rounded-md border border-(--border) bg-(--background) px-3 py-3 text-xs text-(--text-secondary)">
              <p>
                Course:{' '}
                <span className="font-medium text-(--text-primary)">
                  {assignment.courseName}
                </span>
              </p>

              <p className="mt-1">
                Subject:{' '}
                <span className="font-medium text-(--text-primary)">
                  {assignment.subjectName}
                </span>
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="assignment-deadline"
                  className="mb-1.5 block text-[13px] font-medium text-(--text-primary)"
                >
                  Deadline
                </label>

                <input
                  id="assignment-deadline"
                  type="datetime-local"
                  disabled={isSaving}
                  {...register('deadline')}
                  className={`h-9 w-full rounded-md border bg-(--surface) px-3 text-sm text-(--text-primary) outline-none ${
                    errors.deadline ? 'border-(--danger)' : 'border-(--border)'
                  } focus:border-(--accent) focus:ring-2 focus:ring-indigo-100`}
                />

                {errors.deadline && (
                  <p className="mt-1.5 text-xs text-(--danger)">
                    {errors.deadline.message}
                  </p>
                )}
              </div>

              <Input
                label="Maximum marks"
                type="number"
                min={1}
                max={1000}
                step={1}
                error={errors.maximumMarks?.message}
                disabled={isSaving}
                {...register('maximumMarks', {
                  valueAsNumber: true,
                })}
              />
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
      </Modal>
    </>
  );
}
