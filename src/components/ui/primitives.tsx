"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/format";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "success";
  size?: "sm" | "md" | "lg";
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
    const base =
      "inline-flex items-center justify-center font-medium transition-all focus-ring disabled:opacity-50 disabled:pointer-events-none rounded-xl cursor-pointer";
    const variants = {
      primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 active:scale-[0.98]",
      secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-[0.98]",
      danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/20 active:scale-[0.98]",
      success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-[0.98]",
      ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    };
    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

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
          "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-ring transition-colors",
          error ? "border-rose-400 focus:ring-rose-400" : "focus:border-brand-500",
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
          "flex w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-ring transition-colors resize-y min-h-[80px]",
          error ? "border-rose-400 focus:ring-rose-400" : "focus:border-brand-500",
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
          "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus-ring transition-colors cursor-pointer",
          error ? "border-rose-400 focus:ring-rose-400" : "focus:border-brand-500",
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

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-card",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
