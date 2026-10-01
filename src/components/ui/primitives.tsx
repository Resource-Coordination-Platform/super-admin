"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/format";

// ---------------- Button ----------------
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success"
  | "subtle"
  | "brand";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "glass-btn-primary bg-coral-500 text-white shadow-xs hover:bg-coral-600 active:bg-coral-700",
  brand:
    "glass-btn-primary bg-brand-600 text-white shadow-xs hover:bg-brand-700 active:bg-brand-800",
  secondary:
    "glass-btn-secondary bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:bg-slate-950",
  outline:
    "glass-btn-outline border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900",
  ghost:
    "glass-btn-ghost text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger:
    "glass-btn-danger bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800",
  success:
    "glass-btn-primary bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 active:bg-emerald-800",
  subtle:
    "glass-btn-subtle bg-coral-50 text-coral-800 hover:bg-coral-100",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-sm gap-2.5",
  icon: "h-9 w-9",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "focus-ring inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          BUTTON_VARIANTS[variant],
          BUTTON_SIZES[size],
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

// ---------------- Inputs ----------------
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "glass-input focus-ring h-10 w-full rounded-xl border border-input bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50",
          error && "border-rose-400 focus:ring-rose-400",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "glass-input focus-ring min-h-[80px] w-full rounded-xl border border-input bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400",
          error && "border-rose-400 focus:ring-rose-400",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "glass-input select-caret focus-ring h-10 w-full appearance-none rounded-xl border border-input bg-white px-3.5 pr-9 text-sm text-slate-900 cursor-pointer",
          error && "border-rose-400 focus:ring-rose-400",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
Select.displayName = "Select";

export function Field({
  label,
  required,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span>
          {label} {required && <span className="text-rose-500">*</span>}
        </span>
        {hint && <span className="font-normal text-slate-400">{hint}</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

// ---------------- Card ----------------
export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl border border-border bg-surface shadow-card",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  title,
  description,
  action,
}: {
  className?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "glass-card-header flex items-start justify-between gap-4 rounded-t-2xl border-b border-coral-200/70 bg-gradient-to-r from-coral-50/80 to-surface px-5 py-4",
        className,
      )}
    >
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ---------------- Skeleton ----------------
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} />;
}

// ---------------- Progress ----------------
export function Progress({
  value,
  tone = "brand",
  className,
}: {
  value: number;
  tone?: "brand" | "coral" | "success" | "warning" | "danger";
  className?: string;
}) {
  const colors = {
    brand: "bg-brand-500",
    coral: "bg-coral-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
  };
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-slate-100",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full transition-all", colors[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
