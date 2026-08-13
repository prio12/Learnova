import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-md font-medium outline-none transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 focus:ring-2 focus:ring-offset-1';

  const variants = {
    primary:
      'bg-(--accent) text-white hover:bg-(--accent-hover) focus:ring-indigo-200',
    secondary:
      'border border-(--border) bg-(--surface) text-(--text-primary) hover:bg-(--surface-hover) focus:ring-gray-200',
    danger: 'bg-(--danger) text-white hover:bg-red-700 focus:ring-red-200',
    ghost:
      'text-(--text-secondary) hover:bg-(--surface-hover) hover:text-(--text-primary) focus:ring-gray-200',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
