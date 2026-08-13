'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { navigationByRole } from '@/config/navigation';
import { useAuthStore } from '@/store/authStore';

export function MobileSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return null;
  }

  const navigationItems = navigationByRole[user.role];

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <div className="md:hidden">
      <div className="flex h-14 items-center justify-between border-b border-(--border) bg-(--surface) px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-(--border) text-xs font-semibold text-(--text-primary)">
            L
          </div>

          <span className="text-sm font-semibold tracking-tight text-(--text-primary)">
            Learnova
          </span>
        </div>

        <button
          type="button"
          aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-(--border) text-(--text-secondary) transition-colors duration-150 hover:bg-(--surface-hover) hover:text-(--text-primary)"
        >
          <span className="text-lg leading-none">{isOpen ? '×' : '☰'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="border-b border-(--border) bg-(--surface) px-3 py-3">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== `/${user.role.toLowerCase()}` &&
                  pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-indigo-50 text-(--accent)'
                      : 'text-(--text-secondary) hover:bg-(--surface-hover) hover:text-(--text-primary)'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="my-3 border-t border-(--border)" />

          <div className="px-3 py-1">
            <p className="truncate text-sm font-medium text-(--text-primary)">
              {user.name}
            </p>

            <p className="mt-0.5 text-xs text-(--text-secondary)">
              {user.role}
            </p>
            <p className="mt-0.5 text-xs text-(--text-secondary)">
              {user.email}
            </p>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex h-9 w-full items-center rounded-md text-left text-sm font-medium text-(--text-secondary) transition-colors duration-150 hover:text-(--text-primary)"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
