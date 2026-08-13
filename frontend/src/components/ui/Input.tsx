import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[13px] font-medium text-(--text-primary)"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`h-9 w-full rounded-md border bg-(--surface) px-3 text-sm text-(--text-primary) outline-none transition-colors duration-150 placeholder:text-(--text-placeholder) ${
          error
            ? 'border-(--danger) focus:border-(--danger) focus:ring-2 focus:ring-red-100'
            : 'border-(--border) focus:border-(--accent) focus:ring-2 focus:ring-indigo-100'
        } ${className}`}
        {...props}
      />

      {error && (
        <p className="text-xs text-(--danger)" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
