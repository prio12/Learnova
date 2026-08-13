import type { ReactNode } from 'react';

interface BadgeProps {
  variant: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
  children: ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  const variants = {
    neutral: 'bg-zinc-100 text-[var(--text-secondary)]',
    accent: 'bg-indigo-50 text-[var(--accent)]',
    success: 'bg-green-50 text-[var(--success)]',
    warning: 'bg-amber-50 text-[var(--warning)]',
    danger: 'bg-red-50 text-[var(--danger)]',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
