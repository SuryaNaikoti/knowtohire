import React from 'react';
import { cn } from '@/lib/utils';

export const TableContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("w-full overflow-x-auto scrollbar-none touch-scroll border border-kth-slate-200 rounded-xl bg-white shadow-xs", className)} {...props}>
    {children}
  </div>
);

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ className, children, ...props }) => (
  <table className={cn("w-full text-left text-xs sm:text-sm border-collapse", className)} {...props}>
    {children}
  </table>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, children, ...props }) => (
  <thead className={cn("bg-kth-slate-50 border-b border-kth-slate-200 sticky top-0 z-10", className)} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, children, ...props }) => (
  <tbody className={cn("divide-y divide-kth-slate-200", className)} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, children, ...props }) => (
  <tr className={cn("min-h-[44px] hover:bg-kth-slate-50 transition-colors duration-150", className)} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...props }) => (
  <th className={cn("px-3 sm:px-4 py-2.5 sm:py-3 font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider text-kth-slate-600 select-none whitespace-nowrap", className)} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...props }) => (
  <td className={cn("px-3 sm:px-4 py-2.5 sm:py-3 text-kth-slate-800 align-middle text-xs sm:text-sm", className)} {...props}>
    {children}
  </td>
);
