import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={`rounded-[10px] border border-(--border) bg-(--surface) ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
