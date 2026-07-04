import React from 'react';

export interface TableHeader {
  key: string;
  label: string;
  className?: string;
}

export interface TableProps {
  headers: TableHeader[];
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const Table: React.FC<TableProps> = ({
  headers,
  children,
  className = '',
  containerClassName = '',
}) => {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-gray-200 border-solid bg-white shadow-sm ${containerClassName}`}>
      <table className={`w-full text-left border-collapse ${className}`}>
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 border-solid">
            {headers.map((header) => (
              <th
                key={header.key}
                className={`px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider select-none ${header.className || ''}`}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tr
      className={`hover:bg-gray-50/50 transition-colors duration-150 ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <td className={`px-6 py-4 whitespace-nowrap align-middle ${className}`} {...props}>
      {children}
    </td>
  );
};
