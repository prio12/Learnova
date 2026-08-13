'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

export function Modal({
  open,
  title,
  onClose,
  children,
  width = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const widths = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`w-full ${widths[width]} rounded-[10px] border border-(--border) bg-(--surface)`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-(--border) px-5 py-4">
          <h2
            id="modal-title"
            className="text-sm font-semibold text-(--text-primary)"
          >
            {title}
          </h2>

          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-lg leading-none text-(--text-secondary) transition-colors duration-150 hover:bg-(--surface-hover) hover:text-(--text-primary)"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-5 py-5">
          {children}
        </div>
      </section>
    </div>
  );
}
