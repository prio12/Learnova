'use client';

import type { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { Course } from '@/types/course';
import { User } from '@/types/user';
import { ApiErrorResponse } from '@/types/api';
import { Enrollment } from '@/types/enrollment';

interface EnrollmentForm {
  studentId: string;
  courseId: string;
}

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [deletingEnrollment, setDeletingEnrollment] =
    useState<Enrollment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [form, setForm] = useState<EnrollmentForm>({
    studentId: '',
    courseId: '',
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setPageError(null);

      try {
        const [enrollmentsResponse, coursesResponse, usersResponse] =
          await Promise.all([
            api.get<Enrollment[]>('/api/Enrollment'),
            api.get<Course[]>('/api/Course'),
            api.get<User[]>('/api/User'),
          ]);

        setEnrollments(enrollmentsResponse.data);
        setCourses(coursesResponse.data);

        setStudents(
          usersResponse.data.filter((user) => user.role === 'Student'),
        );
      } catch {
        setPageError('Enrollments could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const openCreateModal = () => {
    setForm({
      studentId: '',
      courseId: '',
    });

    setCreateError(null);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    if (isCreating) {
      return;
    }

    setIsCreateOpen(false);
    setCreateError(null);
  };

  const createEnrollment = async () => {
    if (!form.studentId) {
      setCreateError('Student is required.');
      return;
    }

    if (!form.courseId) {
      setCreateError('Course is required.');
      return;
    }

    setCreateError(null);
    setIsCreating(true);

    try {
      const response = await api.post<Enrollment>('/api/Enrollment', {
        studentId: form.studentId,
        courseId: form.courseId,
      });

      setEnrollments((currentEnrollments) => [
        ...currentEnrollments,
        response.data,
      ]);

      setIsCreateOpen(false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      setCreateError(
        axiosError.response?.data?.message ??
          'The enrollment could not be created.',
      );
    } finally {
      setIsCreating(false);
    }
  };

  const openDeleteModal = (enrollment: Enrollment) => {
    setDeletingEnrollment(enrollment);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    if (isDeleting) {
      return;
    }

    setDeletingEnrollment(null);
    setDeleteError(null);
  };

  const deleteEnrollment = async () => {
    if (!deletingEnrollment) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await api.delete(`/api/Enrollment/${deletingEnrollment.id}`);

      setEnrollments((currentEnrollments) =>
        currentEnrollments.filter(
          (enrollment) => enrollment.id !== deletingEnrollment.id,
        ),
      );

      setDeletingEnrollment(null);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      setDeleteError(
        axiosError.response?.data?.message ??
          'The enrollment could not be deleted.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<Enrollment>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (enrollment) => (
        <span className="font-medium text-(--text-primary)">
          {enrollment.studentName}
        </span>
      ),
    },
    {
      key: 'course',
      header: 'Course',
      render: (enrollment) => (
        <span className="text-sm text-(--text-secondary)">
          {enrollment.courseName}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (enrollment) => (
        <Button
          size="sm"
          variant="danger"
          onClick={() => openDeleteModal(enrollment)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <>
      <div>
        <PageHeader
          title="Enrollments"
          description="Manage student enrollments across courses."
          actions={<Button onClick={openCreateModal}>Add enrollment</Button>}
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
              Loading enrollments...
            </p>
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={enrollments}
            rowKey={(enrollment) => enrollment.id}
            emptyMessage="No enrollments have been created yet."
          />
        )}
      </div>

      <Modal
        open={isCreateOpen}
        title="Add enrollment"
        onClose={closeCreateModal}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="enrollment-student"
              className="block text-[13px] font-medium text-(--text-primary)"
            >
              Student
            </label>

            <select
              id="enrollment-student"
              value={form.studentId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  studentId: event.target.value,
                }))
              }
              disabled={isCreating}
              className="w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm text-(--text-primary) outline-none transition-colors duration-150 focus:border-(--accent) focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Select a student</option>

              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} — {student.email}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="enrollment-course"
              className="block text-[13px] font-medium text-(--text-primary)"
            >
              Course
            </label>

            <select
              id="enrollment-course"
              value={form.courseId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  courseId: event.target.value,
                }))
              }
              disabled={isCreating}
              className="w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm text-(--text-primary) outline-none transition-colors duration-150 focus:border-(--accent) focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Select a course</option>

              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {createError && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-(--danger)"
            >
              {createError}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={closeCreateModal}
              disabled={isCreating}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={createEnrollment}
              disabled={isCreating}
            >
              {isCreating ? 'Adding...' : 'Add enrollment'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={deletingEnrollment !== null}
        title="Delete enrollment"
        onClose={closeDeleteModal}
        width="sm"
      >
        {deletingEnrollment && (
          <div className="space-y-4">
            <p className="text-sm text-(--text-secondary)">
              Are you sure you want to remove{' '}
              <span className="font-medium text-(--text-primary)">
                {deletingEnrollment.studentName}
              </span>{' '}
              from{' '}
              <span className="font-medium text-(--text-primary)">
                {deletingEnrollment.courseName}
              </span>
              ? This action cannot be undone.
            </p>

            {deleteError && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-(--danger)"
              >
                {deleteError}
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="danger"
                onClick={deleteEnrollment}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete enrollment'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
