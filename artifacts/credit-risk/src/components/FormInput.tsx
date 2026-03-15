import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          {label}
        </label>
        <div className="relative relative-group">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-xl border-2 bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
              icon ? "pl-10" : "",
              error ? "border-destructive focus:border-destructive focus:ring-destructive/10" : "border-border hover:border-border/80",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-destructive font-medium animate-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormInput.displayName = "FormInput";

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "appearance-none w-full rounded-xl border-2 bg-background px-4 py-2.5 text-sm text-foreground transition-all duration-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
              error ? "border-destructive focus:border-destructive focus:ring-destructive/10" : "border-border hover:border-border/80",
              className
            )}
            {...props}
          >
            <option value="" disabled>Select an option</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-destructive font-medium animate-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormSelect.displayName = "FormSelect";
