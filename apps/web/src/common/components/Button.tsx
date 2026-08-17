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
    "inline-flex items-center justify-center font-normal transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(201,100%,13%)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none apple-tap-active";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-[17px] gap-2.5",
  }[size];

  const variantStyles = {
    primary:
      "bg-[#F5A623] hover:bg-[#FFB940] text-[#071220] font-semibold rounded-full active:scale-[0.98] shadow-md shadow-[#F5A623]/15",
    secondary:
      "bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 rounded-full font-normal shadow-none",
    "secondary-pill":
      "bg-transparent hover:bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/60 hover:border-[#F5A623] rounded-full font-normal shadow-none",
    "dark-utility":
      "bg-white/[0.08] hover:bg-white/[0.14] text-white rounded-lg text-xs font-normal shadow-none border border-white/10",
    ghost:
      "bg-transparent hover:bg-white/10 text-[var(--color-muted-foreground)] hover:text-white rounded-full font-normal shadow-none",
    danger:
      "bg-[#e03e3e] hover:bg-[#c93030] text-white rounded-full font-normal shadow-none",
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
