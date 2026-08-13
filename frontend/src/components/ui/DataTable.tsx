import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  emptyMessage = 'No records found.',
}: DataTableProps<T>) {
  const getAlignment = (align: DataTableColumn<T>['align']) => {
    if (align === 'right') return 'text-right';
    if (align === 'center') return 'text-center';

    return 'text-left';
  };

  return (
    <div className="overflow-x-auto rounded-[10px] border border-(--border) bg-(--surface)">
      <table className="w-full min-w-160 border-collapse text-sm">
        <thead>
          <tr className="border-b border-(--border) bg-(--background)">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-4 py-3 text-xs font-medium text-(--text-secondary) ${getAlignment(
                  column.align,
                )}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-b border-(--border) last:border-b-0 hover:bg-(--surface-hover)"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 text-(--text-primary) ${getAlignment(
                      column.align,
                    )}`}
                  >
                    {column.render
                      ? column.render(row)
                      : String(row[column.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-(--text-secondary)"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
