'use client';

import type { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import type { UserRole } from '@/store/authStore';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface ApiErrorResponse {
  message?: string;
}

type RoleFilter = 'All' | UserRole;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('All');

  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [promoteError, setPromoteError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      setPageError(null);

      try {
        const response = await api.get<User[]>('/api/User');
        setUsers(response.data);
      } catch {
        setPageError('Users could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (roleFilter === 'All') {
      return users;
    }

    return users.filter((user) => user.role === roleFilter);
  }, [roleFilter, users]);

  const openPromoteModal = (user: User) => {
    setPromoteError(null);
    setSelectedUser(user);
  };

  const closePromoteModal = () => {
    if (isPromoting) {
      return;
    }

    setSelectedUser(null);
    setPromoteError(null);
  };

  const promoteToTeacher = async () => {
    if (!selectedUser) {
      return;
    }

    setPromoteError(null);
    setIsPromoting(true);

    try {
      const response = await api.put<User>(
        `/api/User/${selectedUser.id}/promote-to-teacher`,
      );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === response.data.id ? response.data : user,
        ),
      );

      setSelectedUser(null);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      setPromoteError(
        axiosError.response?.data?.message ?? 'The user could not be promoted.',
      );
    } finally {
      setIsPromoting(false);
    }
  };

  const columns: DataTableColumn<User>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (user) => (
        <div>
          <p className="font-medium text-(--text-primary)">{user.name}</p>
          <p className="mt-0.5 text-xs text-(--text-secondary)">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      align: 'center',
      render: (user) => {
        const variant =
          user.role === 'Admin'
            ? 'accent'
            : user.role === 'Teacher'
              ? 'success'
              : 'neutral';

        return (
          <div className="flex justify-center">
            <Badge variant={variant}>{user.role}</Badge>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (user) =>
        user.role === 'Student' ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openPromoteModal(user)}
          >
            Promote
          </Button>
        ) : (
          <span className="text-xs text-(--text-placeholder)">—</span>
        ),
    },
  ];

  return (
    <>
      <div>
        <PageHeader
          title="Users"
          description="View accounts and promote students to teachers."
        />

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-(--text-secondary)">
            {filteredUsers.length} user
            {filteredUsers.length === 1 ? '' : 's'}
          </p>

          <div className="flex items-center gap-1 rounded-md border border-(--border) bg-(--surface) p-1">
            {(['All', 'Admin', 'Teacher', 'Student'] as RoleFilter[]).map(
              (role) => {
                const isActive = roleFilter === role;

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setRoleFilter(role)}
                    className={`rounded cursor-pointer px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
                      isActive
                        ? 'bg-(--accent) text-white'
                        : 'text-(--text-secondary) hover:bg-(--surface-hover) hover:text-(--text-primary)'
                    }`}
                  >
                    {role}
                  </button>
                );
              },
            )}
          </div>
        </div>

        {pageError ? (
          <div
            role="alert"
            className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-(--danger)"
          >
            {pageError}
          </div>
        ) : isLoading ? (
          <div className="rounded-[10px] border border-(--border) bg-(--surface) px-4 py-10 text-center text-sm text-(--text-secondary)">
            Loading users...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredUsers}
            rowKey={(user) => user.id}
            emptyMessage="No users match this role."
          />
        )}
      </div>

      <Modal
        open={selectedUser !== null}
        title="Promote student"
        onClose={closePromoteModal}
      >
        {selectedUser && (
          <div>
            <p className="text-sm leading-5 text-(--text-secondary)">
              Promote{' '}
              <strong className="font-medium text-(--text-primary)">
                {selectedUser.name}
              </strong>{' '}
              to Teacher?
            </p>

            <p className="mt-2 text-xs leading-5 text-(--text-secondary)">
              This changes the user&apos;s role immediately. They will have
              access to teacher features after signing in again.
            </p>

            {promoteError && (
              <div
                role="alert"
                className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-(--danger)"
              >
                {promoteError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={closePromoteModal}
                disabled={isPromoting}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={promoteToTeacher}
                disabled={isPromoting}
              >
                {isPromoting ? 'Promoting...' : 'Promote to teacher'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
