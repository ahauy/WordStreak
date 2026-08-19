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
          className="block text-xs font-semibold text-[#171717] tracking-wider uppercase mb-1.5"
        >
          {label}{" "}
          {required && (
            <span className="text-[#9333ea] font-normal" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <div className="relative rounded-xl">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a3a3a3]">
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
            className={`w-full rounded-xl px-3.5 py-2.5 text-[15px] font-normal transition-all duration-150 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
              leftIcon ? "pl-10" : "pl-3.5"
            } ${rightIcon ? "pr-10" : "pr-3.5"} ${
              error
                ? "border border-[#ff5f56] bg-[#fff5f5] text-black placeholder:text-[#a3a3a3] focus:border-[#ff5f56] focus:ring-3 focus:ring-[#ff5f56]/15"
                : "bg-[#fafafa] text-black placeholder:text-[#a3a3a3] border border-[#e5e5e5] hover:border-[#d4d4d4] focus:bg-white focus:border-[#9333ea] focus:ring-3 focus:ring-[#9333ea]/15"
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
            className="mt-1.5 text-xs text-[#dc2626] flex items-center gap-1.5 font-normal"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-1 text-xs text-[#737373]">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
