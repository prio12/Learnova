'use client';

import type { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';

interface Course {
  id: string;
  name: string;
  description: string | null;
}

interface CourseFormData {
  name: string;
  description: string;
}

interface ApiErrorResponse {
  message?: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const router = useRouter();

  const [form, setForm] = useState<CourseFormData>({
    name: '',
    description: '',
  });

  useEffect(() => {
    const loadCourses = async () => {
      setPageError(null);

      try {
        const response = await api.get<Course[]>('/api/Course');
        setCourses(response.data);
      } catch {
        setPageError('Courses could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  const openCreateModal = () => {
    setForm({
      name: '',
      description: '',
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

  const createCourse = async () => {
    if (!form.name.trim()) {
      setCreateError('Course name is required.');
      return;
    }

    setCreateError(null);
    setIsCreating(true);

    try {
      const response = await api.post<Course>('/api/Course', {
        name: form.name.trim(),
        description: form.description.trim() || null,
      });

      setCourses((currentCourses) => [...currentCourses, response.data]);

      setIsCreateOpen(false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      setCreateError(
        axiosError.response?.data?.message ??
          'The course could not be created.',
      );
    } finally {
      setIsCreating(false);
    }
  };

  const columns: DataTableColumn<Course>[] = [
    {
      key: 'name',
      header: 'Course',
      render: (course) => (
        <div>
          <p className="font-medium text-(--text-primary)">{course.name}</p>

          {course.description && (
            <p className="mt-0.5 max-w-xl truncate text-xs text-(--text-secondary)">
              {course.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (course) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            router.push(`/admin/courses/${course.id}`);
          }}
        >
          Open
        </Button>
      ),
    },
  ];

  return (
    <>
      <div>
        <PageHeader
          title="Courses"
          description="Create courses and manage the subjects within them."
          actions={<Button onClick={openCreateModal}>Create course</Button>}
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
              Loading courses...
            </p>
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={courses}
            rowKey={(course) => course.id}
            emptyMessage="No courses have been created yet."
          />
        )}
      </div>

      <Modal
        open={isCreateOpen}
        title="Create course"
        onClose={closeCreateModal}
      >
        <div className="space-y-4">
          <Input
            id="course-name"
            label="Course name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            placeholder="e.g. Computer Science"
            disabled={isCreating}
          />

          <div className="space-y-1.5">
            <label
              htmlFor="course-description"
              className="block text-[13px] font-medium text-(--text-primary)"
            >
              Description
            </label>

            <textarea
              id="course-description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={4}
              disabled={isCreating}
              placeholder="A short description of the course."
              className="w-full resize-none rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm text-(--text-primary) outline-none transition-colors duration-150 placeholder:text-(--text-placeholder) focus:border-(--accent) focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
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

            <Button type="button" onClick={createCourse} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create course'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
