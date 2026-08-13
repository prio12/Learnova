import { z } from 'zod';

export const assignmentSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or fewer'),

  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be 1000 characters or fewer'),

  courseId: z.string().min(1, 'Course is required'),

  subjectId: z.string().min(1, 'Subject is required'),

  deadline: z
    .string()
    .min(1, 'Deadline is required')
    .refine(
      (value) => new Date(value).getTime() > Date.now(),
      'Deadline must be in the future',
    ),

  maximumMarks: z
    .number({
      error: 'Maximum marks is required',
    })
    .int('Maximum marks must be a whole number')
    .min(1, 'Maximum marks must be at least 1')
    .max(1000, 'Maximum marks cannot exceed 1000'),
});

export type AssignmentFormData = z.infer<typeof assignmentSchema>;
