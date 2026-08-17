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
          className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wider mb-1.5"
        >
          {label}{" "}
          {required && (
            <span className="text-[#e03e3e] font-normal" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <div className="relative rounded-xl">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868b]">
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
                ? "border border-[#e03e3e] bg-[#fff8f8] text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#e03e3e] focus:ring-2 focus:ring-[#e03e3e]/20 dark:border-[#e03e3e] dark:bg-[#2c1b1b] dark:text-white"
                : "bg-white dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-white placeholder:text-[#86868b] border border-[#d2d2d7] dark:border-[#424245] hover:border-[#a1a1a6] dark:hover:border-[#636366] focus:border-[#0066cc] dark:focus:border-[#2997ff] focus:ring-2 focus:ring-[#0066cc]/20 dark:focus:ring-[#2997ff]/25"
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
