'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navigationByRole } from '@/config/navigation';
import { useAuthStore } from '@/store/authStore';

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  const navigationItems = navigationByRole[user.role];

  return (
    <aside className="hidden w-60 shrink-0 border-r border-(--border) bg-(--surface) md:flex md:flex-col">
      <div className="flex h-16 items-center border-b border-(--border) px-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-(--border) text-xs font-semibold text-(--text-primary)">
            L
          </div>

          <span className="text-sm font-semibold tracking-tight text-(--text-primary)">
            Learnova
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/${user.role.toLowerCase()}` &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-(--accent)'
                    : 'text-(--text-secondary) hover:bg-[#f4f4f5] hover:text-(--text-primary)'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
