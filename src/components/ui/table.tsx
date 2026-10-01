import * as React from "react";
import { cn } from "@/lib/format";

export function Table({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="glass-table w-full overflow-x-auto">
      <table
        className={cn("w-full text-left text-sm text-slate-700", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "border-b border-border bg-slate-50/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn("divide-y divide-border/60 bg-transparent", className)}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableRow({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("transition-colors hover:bg-white/50", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  className,
  children,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn("px-4 py-3.5", className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({
  className,
  children,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-3.5 align-middle", className)} {...props}>
      {children}
    </td>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: any;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {Icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-50 text-coral-600 ring-1 ring-coral-200">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
