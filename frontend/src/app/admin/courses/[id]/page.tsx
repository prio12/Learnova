'use client';

import type { AxiosError } from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import type { UserRole } from '@/store/authStore';

interface Course {
  id: string;
  name: string;
  description: string | null;
}

interface Subject {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  teacherId: string | null;
  teacherName: string | null;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface SubjectForm {
  name: string;
  teacherId: string | null;
}

interface ApiErrorResponse {
  message?: string;
}

export default function CourseDetailsPage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [form, setForm] = useState<SubjectForm>({
    name: '',
    teacherId: null,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setPageError(null);

      try {
        const [courseResponse, subjectsResponse, usersResponse] =
          await Promise.all([
            api.get<Course>(`/api/Course/${courseId}`),
            api.get<Subject[]>('/api/Subject'),
            api.get<Teacher[]>('/api/User'),
          ]);

        setCourse(courseResponse.data);

        setSubjects(
          subjectsResponse.data.filter(
            (subject) => subject.courseId === courseId,
          ),
        );

        setTeachers(
          usersResponse.data.filter((user) => user.role === 'Teacher'),
        );
      } catch {
        setPageError('The course could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      loadData();
    }
  }, [courseId]);

  const openCreateSubject = () => {
    setEditingSubject(null);
    setForm({
      name: '',
      teacherId: null,
    });
    setFormError(null);
    setIsSubjectModalOpen(true);
  };

  const openEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setForm({
      name: subject.name,
      teacherId: subject.teacherId,
    });
    setFormError(null);
    setIsSubjectModalOpen(true);
  };

  const closeSubjectModal = () => {
    if (isSaving) {
      return;
    }

    setIsSubjectModalOpen(false);
    setEditingSubject(null);
    setFormError(null);
  };

  const toggleTeacher = (teacherId: string) => {
    setForm((current) => ({
      ...current,
      teacherId: current.teacherId === teacherId ? null : teacherId,
    }));
  };

  const saveSubject = async () => {
    if (!form.name.trim()) {
      setFormError('Subject name is required.');
      return;
    }

    setFormError(null);
    setIsSaving(true);

    try {
      if (editingSubject) {
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
      } else {
        const response = await api.post<Subject>('/api/Subject', {
          name: form.name.trim(),
          courseId,
          teacherId: form.teacherId,
        });

        setSubjects((currentSubjects) => [...currentSubjects, response.data]);
      }

      closeSubjectModal();
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      setFormError(
        axiosError.response?.data?.message ?? 'The subject could not be saved.',
      );
    } finally {
      setIsSaving(false);
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
        <Button
          size="sm"
          variant="secondary"
          onClick={() => openEditSubject(subject)}
        >
          Edit
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Course" description="Loading course details..." />

        <Card>
          <p className="text-sm text-(--text-secondary)">Loading...</p>
        </Card>
      </div>
    );
  }

  if (pageError || !course) {
    return (
      <div>
        <PageHeader title="Course" description="Unable to load this course." />

        <div
          role="alert"
          className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-(--danger)"
        >
          {pageError ?? 'Course not found.'}
        </div>

        <Link
          href="/admin/courses"
          className="mt-4 inline-flex text-sm font-medium text-(--accent) transition-colors duration-150 hover:text-(--accent-hover)"
        >
          ← Back to courses
        </Link>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="mb-4">
          <Link
            href="/admin/courses"
            className="text-xs font-medium text-(--text-secondary) transition-colors duration-150 hover:text-(--text-primary)"
          >
            ← Back to courses
          </Link>
        </div>

        <PageHeader
          title={course.name}
          description={
            course.description ??
            'Manage the subjects and teacher assignments for this course.'
          }
        />

        <section>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-(--text-primary)">
                Subjects
              </h2>

              <p className="mt-1 text-xs text-(--text-secondary)">
                {subjects.length} subject
                {subjects.length === 1 ? '' : 's'} in this course.
              </p>
            </div>

            <Button onClick={openCreateSubject}>Add subject</Button>
          </div>

          <DataTable
            columns={columns}
            data={subjects}
            rowKey={(subject) => subject.id}
            emptyMessage="No subjects have been added to this course yet."
          />
        </section>
      </div>

      <Modal
        open={isSubjectModalOpen}
        title={editingSubject ? 'Edit subject' : 'Add subject'}
        onClose={closeSubjectModal}
      >
        <div className="space-y-5">
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
            disabled={isSaving}
          />

          <div>
            <div className="mb-2">
              <p className="text-[13px] font-medium text-(--text-primary)">
                Teacher
              </p>

              <p className="mt-1 text-xs leading-5 text-(--text-secondary)">
                This is the current teacher for the subject. Existing
                assignments keep their original teacher.
              </p>
            </div>

            <div className="space-y-1.5">
              {teachers.length > 0 ? (
                teachers.map((teacher) => {
                  const isSelected = form.teacherId === teacher.id;

                  return (
                    <button
                      key={teacher.id}
                      type="button"
                      disabled={isSaving}
                      onClick={() => toggleTeacher(teacher.id)}
                      className={`flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-left transition-colors duration-150 ${
                        isSelected
                          ? 'border-(--accent) bg-indigo-50'
                          : 'border-(--border) bg-(--surface) hover:bg-(--surface-hover)'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <div className="min-w-0">
                        <p
                          className={`truncate text-sm font-medium ${
                            isSelected
                              ? 'text-(--accent)'
                              : 'text-(--text-primary)'
                          }`}
                        >
                          {teacher.name}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-(--text-secondary)">
                          {teacher.email}
                        </p>
                      </div>

                      <span
                        className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                          isSelected
                            ? 'border-(--accent) bg-(--accent) text-white'
                            : 'border-(--border) text-transparent'
                        }`}
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-md border border-(--border) bg-(--background) px-3 py-4 text-sm text-(--text-secondary)">
                  No teachers are available yet.
                </div>
              )}
            </div>
          </div>

          {formError && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-(--danger)"
            >
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-(--border) pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={closeSubjectModal}
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button type="button" onClick={saveSubject} disabled={isSaving}>
              {isSaving
                ? editingSubject
                  ? 'Saving...'
                  : 'Adding...'
                : editingSubject
                  ? 'Save changes'
                  : 'Add subject'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
