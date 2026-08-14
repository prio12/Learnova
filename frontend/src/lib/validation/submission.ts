import { z } from 'zod';

export const submissionGradeSchema = z.object({
  marks: z
    .number({ error: 'Marks is required' })
    .int('Marks must be a whole number')
    .min(0, 'Marks cannot be negative'),
  feedback: z
    .string()
    .min(1, 'Feedback is required')
    .max(1000, 'Feedback must be 1000 characters or fewer'),
});

export type SubmissionGradeFormData = z.infer<typeof submissionGradeSchema>;

export const submissionAnswerSchema = z.object({
  answer: z
    .string()
    .min(1, 'Answer is required')
    .max(5000, 'Answer must be 5000 characters or fewer'),
});

export type SubmissionAnswerFormData = z.infer<typeof submissionAnswerSchema>;
