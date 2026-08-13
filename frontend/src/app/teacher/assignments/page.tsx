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
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import {
  assignmentSchema,
  type AssignmentFormData,
} from '@/lib/validation/assignment';
import { useAuthStore } from '@/store/authStore';
import { Assignment } from '@/types/assignment';
import { Course } from '@/types/course';
import { Subject } from '@/types/subject';
import { ApiErrorResponse } from '@/types/api';
import { toDateTimeLocal } from '@/lib/date';
import Link from 'next/link';

type ModalMode = 'create' | 'edit';

export default function TeacherAssignmentsPage() {
  const user = useAuthStore((state) => state.user);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: '',
      description: '',
      courseId: '',
      subjectId: '',
      deadline: '',
      maximumMarks: 100,
    },
  });

  const selectedCourseId = watch('courseId');

  const teacherSubjects = useMemo(() => {
    if (!user) {
      return [];
    }

    return subjects.filter((subject) => subject.teacherId === user.id);
  }, [subjects, user]);

  const availableSubjects = useMemo(() => {
    return teacherSubjects.filter(
      (subject) => subject.courseId === selectedCourseId,
    );
  }, [selectedCourseId, teacherSubjects]);

  useEffect(() => {
    if (!selectedCourseId) {
      setValue('subjectId', '');
      return;
    }

    const currentSubjectId = watch('subjectId');
    const stillValid = availableSubjects.some(
      (subject) => subject.id === currentSubjectId,
    );

    if (!stillValid) {
      setValue('subjectId', '');
    }
  }, [selectedCourseId, availableSubjects, setValue, watch]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setPageError(null);

      try {
        const [assignmentsResponse, coursesResponse, subjectsResponse] =
          await Promise.all([
            api.get<Assignment[]>('/api/Assignment'),
            api.get<Course[]>('/api/Course'),
            api.get<Subject[]>('/api/Subject'),
          ]);

        setAssignments(assignmentsResponse.data);
        setCourses(coursesResponse.data);
        setSubjects(subjectsResponse.data);
      } catch {
        setPageError('Assignments could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingAssignment(null);
    setActionError(null);

    reset({
      title: '',
      description: '',
      courseId: '',
      subjectId: '',
      deadline: '',
      maximumMarks: 100,
    });

    setIsModalOpen(true);
  };

  const openEditModal = (assignment: Assignment) => {
    setModalMode('edit');
    setEditingAssignment(assignment);
    setActionError(null);

    reset({
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId,
      subjectId: assignment.subjectId,
      deadline: toDateTimeLocal(assignment.deadline),
      maximumMarks: assignment.maximumMarks,
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingAssignment(null);
    setActionError(null);
  };

  const onSubmit = async (data: AssignmentFormData) => {
    setActionError(null);
    setIsSaving(true);

    try {
      if (modalMode === 'create') {
        const response = await api.post<Assignment>('/api/Assignment', {
          ...data,
          deadline: new Date(data.deadline).toISOString(),
        });

        setAssignments((current) => [...current, response.data]);
      } else if (editingAssignment) {
        const response = await api.put<Assignment>(
          `/api/Assignment/${editingAssignment.id}`,
          {
            title: data.title,
            description: data.description,
            deadline: new Date(data.deadline).toISOString(),
            maximumMarks: data.maximumMarks,
          },
        );

        setAssignments((current) =>
          current.map((assignment) =>
            assignment.id === response.data.id ? response.data : assignment,
          ),
        );
      }

      closeModal();
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      setActionError(
        axiosError.response?.data?.message ??
          'The assignment could not be saved.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const publishAssignment = async (assignment: Assignment) => {
    setActionError(null);
    setIsPublishing(assignment.id);

    try {
      const response = await api.patch<Assignment>(
        `/api/Assignment/${assignment.id}/publish`,
      );

      setAssignments((current) =>
        current.map((item) =>
          item.id === response.data.id ? response.data : item,
        ),
      );
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      setActionError(
        axiosError.response?.data?.message ??
          'The assignment could not be published.',
      );
    } finally {
      setIsPublishing(null);
    }
  };

  const deleteAssignment = async () => {
    if (!deleteTarget) {
      return;
    }

    setActionError(null);
    setIsDeleting(deleteTarget.id);

    try {
      await api.delete(`/api/Assignment/${deleteTarget.id}`);

      setAssignments((current) =>
        current.filter((assignment) => assignment.id !== deleteTarget.id),
      );

      setDeleteTarget(null);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      setActionError(
        axiosError.response?.data?.message ??
          'The assignment could not be deleted.',
      );
    } finally {
      setIsDeleting(null);
    }
  };

  const columns: DataTableColumn<Assignment>[] = [
    {
      key: 'title',
      header: 'Assignment',
      render: (assignment) => (
        <div className="min-w-0">
          <Link
            href={`/teacher/assignments/${assignment.id}`}
            className="font-medium text-(--text-primary) hover:text-(--accent)"
          >
            {assignment.title}
          </Link>

          <p className="mt-0.5 text-xs text-(--text-secondary)">
            {assignment.courseName} · {assignment.subjectName}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (assignment) => (
        <Badge
          variant={assignment.status === 'Published' ? 'accent' : 'neutral'}
        >
          {assignment.status}
        </Badge>
      ),
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (assignment) => (
        <div>
          <p className="text-sm text-(--text-primary)">
            {format(new Date(assignment.deadline), 'MMM d, yyyy')}
          </p>

          <p
            className={`mt-0.5 text-xs ${
              new Date(assignment.deadline).getTime() <= Date.now()
                ? 'text-(--danger)'
                : 'text-(--text-secondary)'
            }`}
          >
            {formatDistanceToNow(new Date(assignment.deadline), {
              addSuffix: true,
            })}
          </p>
        </div>
      ),
    },
    {
      key: 'marks',
      header: 'Marks',
      align: 'center',
      render: (assignment) => (
        <span className="text-sm text-(--text-primary)">
          {assignment.maximumMarks}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (assignment) => (
        <div className="flex justify-end gap-2">
          {assignment.status === 'Draft' && (
            <Button
              size="sm"
              onClick={() => publishAssignment(assignment)}
              disabled={isPublishing === assignment.id}
            >
              {isPublishing === assignment.id ? 'Publishing...' : 'Publish'}
            </Button>
          )}

          <Button
            size="sm"
            variant="secondary"
            onClick={() => openEditModal(assignment)}
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setActionError(null);
              setDeleteTarget(assignment);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div>
        <PageHeader
          title="Assignments"
          description="Create, publish, and manage the assignments for your subjects."
          actions={<Button onClick={openCreateModal}>Create assignment</Button>}
        />

        {actionError && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-(--danger)"
          >
            {actionError}
          </div>
        )}

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
            emptyMessage="No assignments have been created yet."
          />
        )}
      </div>

      <Modal
        open={isModalOpen}
        title={modalMode === 'create' ? 'Create assignment' : 'Edit assignment'}
        onClose={closeModal}
        width="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <Input
              label="Title"
              placeholder="e.g. Sorting algorithms"
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
                rows={5}
                disabled={isSaving}
                placeholder="Explain what students need to submit."
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

            {modalMode === 'create' ? (
              <>
                <div>
                  <label
                    htmlFor="assignment-course"
                    className="mb-1.5 block text-[13px] font-medium text-(--text-primary)"
                  >
                    Course
                  </label>

                  <select
                    id="assignment-course"
                    {...register('courseId')}
                    disabled={isSaving}
                    className={`h-9 w-full rounded-md border bg-(--surface) px-3 text-sm text-(--text-primary) outline-none ${
                      errors.courseId
                        ? 'border-(--danger)'
                        : 'border-(--border)'
                    } focus:border-(--accent) focus:ring-2 focus:ring-indigo-100`}
                  >
                    <option value="">Select a course</option>

                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>

                  {errors.courseId && (
                    <p className="mt-1.5 text-xs text-(--danger)">
                      {errors.courseId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="assignment-subject"
                    className="mb-1.5 block text-[13px] font-medium text-(--text-primary)"
                  >
                    Subject
                  </label>

                  <select
                    id="assignment-subject"
                    {...register('subjectId')}
                    disabled={!selectedCourseId || isSaving}
                    className={`h-9 w-full rounded-md border bg-(--surface) px-3 text-sm text-(--text-primary) outline-none ${
                      errors.subjectId
                        ? 'border-(--danger)'
                        : 'border-(--border)'
                    } focus:border-(--accent) focus:ring-2 focus:ring-indigo-100`}
                  >
                    <option value="">
                      {selectedCourseId
                        ? availableSubjects.length > 0
                          ? 'Select a subject'
                          : 'No assigned subjects in this course'
                        : 'Select a course first'}
                    </option>

                    {availableSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>

                  {errors.subjectId && (
                    <p className="mt-1.5 text-xs text-(--danger)">
                      {errors.subjectId.message}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <Card padding="sm">
                <div className="text-xs text-(--text-secondary)">
                  <p>
                    Course:{' '}
                    <span className="font-medium text-(--text-primary)">
                      {editingAssignment?.courseName}
                    </span>
                  </p>

                  <p className="mt-1">
                    Subject:{' '}
                    <span className="font-medium text-(--text-primary)">
                      {editingAssignment?.subjectName}
                    </span>
                  </p>
                </div>
              </Card>
            )}

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
                  {...register('deadline')}
                  disabled={isSaving}
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

            {actionError && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-(--danger)"
              >
                {actionError}
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-(--border) pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={closeModal}
                disabled={isSaving}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? modalMode === 'create'
                    ? 'Creating...'
                    : 'Saving...'
                  : modalMode === 'create'
                    ? 'Create assignment'
                    : 'Save changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        title="Delete assignment"
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
            setActionError(null);
          }
        }}
      >
        {deleteTarget && (
          <div>
            <p className="text-sm leading-5 text-(--text-secondary)">
              Delete{' '}
              <strong className="font-medium text-(--text-primary)">
                {deleteTarget.title}
              </strong>
              ?
            </p>

            <p className="mt-2 text-xs leading-5 text-(--text-secondary)">
              Assignments with student submissions cannot be deleted.
            </p>

            {actionError && (
              <div
                role="alert"
                className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-(--danger)"
              >
                {actionError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (!isDeleting) {
                    setDeleteTarget(null);
                    setActionError(null);
                  }
                }}
                disabled={isDeleting !== null}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="danger"
                onClick={deleteAssignment}
                disabled={isDeleting !== null}
              >
                {isDeleting ? 'Deleting...' : 'Delete assignment'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
