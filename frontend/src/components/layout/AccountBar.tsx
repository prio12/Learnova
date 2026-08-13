'use client';

import { useEffect, useRef, useState } from 'react';
import { FiLogOut, FiUser } from 'react-icons/fi';

import { useAuthStore } from '@/store/authStore';

export function AccountBar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return null;
  }

  return (
    <header className="hidden h-16 items-center justify-end border-b border-(--border) bg-(--surface) px-4 md:flex md:px-6 lg:px-8">
      <div ref={menuRef} className="relative">
        <button
          type="button"
          aria-label="Open account menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-(--border) bg-(--surface) text-(--text-secondary) transition-colors duration-150 hover:bg-(--surface-hover) hover:text-(--text-primary)"
        >
          <FiUser size={16} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-11 z-50 w-64 rounded-lg border border-(--border) bg-(--surface) shadow-lg">
            <div className="px-4 py-3">
              <p className="truncate text-sm font-medium text-(--text-primary)">
                {user.name}
              </p>

              <p className="mt-0.5 text-xs text-(--text-secondary)">
                {user.role}
              </p>

              <p className="mt-2 truncate text-xs text-(--text-secondary)">
                {user.email}
              </p>
            </div>

            <div className="border-t border-(--border)" />

            <button
              type="button"
              onClick={logout}
              className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-sm text-(--text-secondary) transition-colors duration-150 hover:bg-(--surface-hover) hover:text-(--text-primary)"
            >
              <FiLogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
