'use client';

import type { AxiosError } from 'axios';
import { useEffect, useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { Subject } from '@/types/subject';
import { Course } from '@/types/course';
import { User } from '@/types/user';
import { ApiErrorResponse } from '@/types/api';

interface SubjectFormData {
  name: string;
  courseId: string;
  teacherId: string | null;
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [form, setForm] = useState<SubjectFormData>({
    name: '',
    courseId: '',
    teacherId: null,
  });

  useEffect(() => {
    const loadData = async () => {
      setPageError(null);

      try {
        const [subjectsResponse, coursesResponse, usersResponse] =
          await Promise.all([
            api.get<Subject[]>('/api/Subject'),
            api.get<Course[]>('/api/Course'),
            api.get<User[]>('/api/User'),
          ]);

        setSubjects(subjectsResponse.data);
        setCourses(coursesResponse.data);

        setTeachers(
          usersResponse.data.filter((user) => user.role === 'Teacher'),
        );
      } catch {
        setPageError('Subjects could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const openCreateModal = () => {
    setForm({
      name: '',
      courseId: '',
      teacherId: null,
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

  const createSubject = async () => {
    if (!form.name.trim()) {
      setCreateError('Subject name is required.');
      return;
    }

    if (!form.courseId) {
      setCreateError('Course is required.');
      return;
    }

    setCreateError(null);
    setIsCreating(true);

    try {
      const response = await api.post<Subject>('/api/Subject', {
        name: form.name.trim(),
        courseId: form.courseId,
        teacherId: form.teacherId,
      });

      setSubjects((currentSubjects) => [...currentSubjects, response.data]);

      setIsCreateOpen(false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      setCreateError(
        axiosError.response?.data?.message ??
          'The subject could not be created.',
      );
    } finally {
      setIsCreating(false);
    }
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);

    setForm({
      name: subject.name,
      courseId: subject.courseId,
      teacherId: subject.teacherId,
    });

    setEditError(null);
  };

  const closeEditModal = () => {
    if (isEditing) {
      return;
    }

    setEditingSubject(null);
    setEditError(null);
  };

  const updateSubject = async () => {
    if (!editingSubject) {
      return;
    }

    if (!form.name.trim()) {
      setEditError('Subject name is required.');
      return;
    }

    setEditError(null);
    setIsEditing(true);

    try {
      const response = await api.put<Subject>(
        `/api/Subject/${editingSubject.id}`,
        {
          name: form.name.trim(),
          teacherId: form.teacherId,
        },
      );

      setSubjects((currentSubjects) =>
        currentSubjects.map((subject) =>
          subject.id === response.data.id ? response.data : subject,
        ),
      );

      setEditingSubject(null);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      setEditError(
        axiosError.response?.data?.message ??
          'The subject could not be updated.',
      );
    } finally {
      setIsEditing(false);
    }
  };

  const openDeleteModal = (subject: Subject) => {
    setDeletingSubject(subject);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    if (isDeleting) {
      return;
    }

    setDeletingSubject(null);
    setDeleteError(null);
  };

  const deleteSubject = async () => {
    if (!deletingSubject) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await api.delete(`/api/Subject/${deletingSubject.id}`);

      setSubjects((currentSubjects) =>
        currentSubjects.filter((subject) => subject.id !== deletingSubject.id),
      );

      setDeletingSubject(null);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      if (axiosError.response?.status === 409) {
        setDeleteError(
          axiosError.response?.data?.message ??
            'This subject cannot be deleted because it has assignments.',
        );
      } else if (axiosError.response?.status === 404) {
        setDeleteError(
          axiosError.response?.data?.message ?? 'Subject not found.',
        );
      } else {
        setDeleteError('The subject could not be deleted.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<Subject>[] = [
    {
      key: 'name',
      header: 'Subject',
      render: (subject) => (
        <span className="font-medium text-(--text-primary)">
          {subject.name}
        </span>
      ),
    },
    {
      key: 'course',
      header: 'Course',
      render: (subject) => (
        <span className="text-sm text-(--text-secondary)">
          {subject.courseName}
        </span>
      ),
    },
    {
      key: 'teacher',
      header: 'Teacher',
      align: 'center',
      render: (subject) => (
        <div className="flex justify-center">
          {subject.teacherName ? (
            <Badge variant="accent">{subject.teacherName}</Badge>
          ) : (
            <span className="text-sm text-(--text-placeholder)">
              Unassigned
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (subject) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openEditModal(subject)}
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => openDeleteModal(subject)}
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
          title="Subjects"
          description="Manage subjects and their teacher assignments across courses."
          actions={<Button onClick={openCreateModal}>Add subject</Button>}
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
              Loading subjects...
            </p>
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={subjects}
            rowKey={(subject) => subject.id}
            emptyMessage="No subjects have been created yet."
          />
        )}
      </div>

      <Modal open={isCreateOpen} title="Add subject" onClose={closeCreateModal}>
        <div className="space-y-4">
          <Input
            id="subject-name"
            label="Subject name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            placeholder="e.g. Algorithms"
            disabled={isCreating}
          />

          <div className="space-y-1.5">
            <label
              htmlFor="subject-course"
              className="block text-[13px] font-medium text-(--text-primary)"
            >
              Course
            </label>

            <select
              id="subject-course"
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

          <div className="space-y-1.5">
            <label
              htmlFor="subject-teacher"
              className="block text-[13px] font-medium text-(--text-primary)"
            >
              Teacher
            </label>

            <select
              id="subject-teacher"
              value={form.teacherId ?? ''}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  teacherId: event.target.value || null,
                }))
              }
              disabled={isCreating}
              className="w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm text-(--text-primary) outline-none transition-colors duration-150 focus:border-(--accent) focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Unassigned</option>

              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
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

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={closeCreateModal}
              disabled={isCreating}
            >
              Cancel
            </Button>

            <Button type="button" onClick={createSubject} disabled={isCreating}>
              {isCreating ? 'Adding...' : 'Add subject'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={editingSubject !== null}
        title="Edit subject"
        onClose={closeEditModal}
      >
        {editingSubject && (
          <div className="space-y-4">
            <Input
              id="edit-subject-name"
              label="Subject name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="e.g. Algorithms"
              disabled={isEditing}
            />

            <div className="space-y-1.5">
              <label
                htmlFor="edit-subject-course"
                className="block text-[13px] font-medium text-(--text-primary)"
              >
                Course
              </label>

              <div
                id="edit-subject-course"
                className="w-full rounded-md border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--text-secondary)"
              >
                {editingSubject.courseName}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="edit-subject-teacher"
                className="block text-[13px] font-medium text-(--text-primary)"
              >
                Teacher
              </label>

              <select
                id="edit-subject-teacher"
                value={form.teacherId ?? ''}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    teacherId: event.target.value || null,
                  }))
                }
                disabled={isEditing}
                className="w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm text-(--text-primary) outline-none transition-colors duration-150 focus:border-(--accent) focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Unassigned</option>

                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            {editError && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-(--danger)"
              >
                {editError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={closeEditModal}
                disabled={isEditing}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={updateSubject}
                disabled={isEditing}
              >
                {isEditing ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={deletingSubject !== null}
        title="Delete subject"
        onClose={closeDeleteModal}
        width="sm"
      >
        {deletingSubject && (
          <div className="space-y-4">
            <p className="text-sm text-(--text-secondary)">
              Are you sure you want to delete{' '}
              <span className="font-medium text-(--text-primary)">
                {deletingSubject.name}
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

            <div className="flex justify-end gap-2 pt-2">
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
                onClick={deleteSubject}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete subject'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
