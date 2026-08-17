import React, { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = "",
      required,
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const describedBy = error ? errorId : helperText ? helperId : undefined;

    return (
      <div className="w-full text-left">
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-white/90 uppercase tracking-wider mb-1.5"
        >
          {label}{" "}
          {required && (
            <span className="text-[#F5A623] font-normal" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <div className="relative rounded-xl">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-muted-foreground)]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            required={required}
            className={`w-full rounded-[12px] px-3.5 py-2.5 text-[15px] transition-all duration-150 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
              leftIcon ? "pl-10" : "pl-3.5"
            } ${rightIcon ? "pr-10" : "pr-3.5"} ${
              error
                ? "border border-[#e03e3e] bg-[#321c1c]/60 text-white placeholder:text-white/30 focus:border-[#e03e3e] focus:ring-2 focus:ring-[#e03e3e]/20"
                : "bg-white/[0.04] text-white placeholder:text-white/30 border border-white/10 hover:border-white/20 focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="mt-1 text-xs text-[#e03e3e] flex items-center gap-1.5 font-normal"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-1 text-xs text-[#86868b]">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
