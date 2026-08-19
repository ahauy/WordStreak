import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "secondary-pill"
    | "dark-utility"
    | "ghost"
    | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9333ea] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none apple-tap-active";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  }[size];

  const variantStyles = {
    primary:
      "bg-black hover:bg-[#1a1a1a] active:bg-[#090909] text-white font-medium rounded-full shadow-xs active:scale-[0.98]",
    secondary:
      "bg-white hover:bg-[#fafafa] text-black border border-[#d4d4d4] hover:border-black rounded-full font-medium active:scale-[0.98] shadow-none",
    "secondary-pill":
      "bg-transparent hover:bg-[#f3e8ff] text-[#7e22ce] border border-[#d8b4fe] hover:border-[#9333ea] rounded-full font-medium shadow-none",
    "dark-utility":
      "bg-[#171717] hover:bg-[#262626] text-white rounded-full text-xs font-medium shadow-none border border-[#333333]",
    ghost:
      "bg-transparent hover:bg-[#f5f5f5] text-[#737373] hover:text-black rounded-full font-normal shadow-none",
    danger:
      "bg-[#ff5f56] hover:bg-[#dc2626] text-white rounded-full font-medium shadow-none",
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : leftIcon ? (
        <span className="inline-flex items-center" aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="inline-flex items-center" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
};
