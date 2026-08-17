import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Input } from "../../../common/components/Input";
import { Button } from "../../../common/components/Button";
import { useAuthStore } from "../../../store/useAuthStore";

const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username cannot exceed 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain alphanumeric characters and underscores",
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least 1 uppercase letter and 1 number",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onNavigateToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onNavigateToLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register: registerUser,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const passwordValue = useWatch({ control, name: "password" }) || "";
  const confirmPasswordValue =
    useWatch({ control, name: "confirmPassword" }) || "";

  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasNumber = /\d/.test(passwordValue);
  const isMatch = Boolean(
    passwordValue &&
    confirmPasswordValue &&
    passwordValue === confirmPasswordValue,
  );

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    try {
      await registerUser({
        email: data.email,
        username: data.username,
        password: data.password,
      });
      onSuccess?.();
    } catch {
      // Handled in store
    }
  };

  return (
    <div className="w-full max-w-md liquid-glass rounded-3xl p-7 sm:p-9 relative border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-2xl">
      {/* Mobile Brand Header */}
      <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#F5A623]/15 border border-[#F5A623]/30 flex items-center justify-center text-[#F5A623]">
          <Sparkles className="w-4 h-4" />
        </div>
        <span
          className="text-2xl font-normal text-white tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          WordStreak
        </span>
      </div>

      <div className="text-center mb-5">
        <h2
          className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Create Account
        </h2>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Start building your vocabulary with spaced repetition
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 p-3 rounded-xl bg-[#321c1c]/80 border border-[#e03e3e]/40 flex items-start gap-2.5 text-[#ff8a8a] text-xs transition-all"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="font-normal">{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3.5"
        noValidate
      >
        <Input
          id="register-email"
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="you@wordstreak.app"
          required
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          id="register-username"
          label="Username"
          type="text"
          autoComplete="username"
          placeholder="streakmaster"
          required
          leftIcon={<User className="w-4 h-4" />}
          error={errors.username?.message}
          {...register("username")}
        />

        <Input
          id="register-password"
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="••••••••"
          required
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-[var(--color-muted-foreground)] hover:text-white transition-colors focus:outline-none cursor-pointer p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
          error={errors.password?.message}
          {...register("password")}
        />

        {/* Real-time Password Strength Criteria Checklist */}
        {passwordValue && (
          <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 space-y-1 text-xs">
            <p className="font-semibold text-white/80 mb-1">
              Password requirements:
            </p>
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`w-3.5 h-3.5 flex-shrink-0 ${
                  hasMinLength ? "text-[#30d158]" : "text-white/30"
                }`}
              />
              <span
                className={
                  hasMinLength
                    ? "text-white font-medium"
                    : "text-[var(--color-muted-foreground)]"
                }
              >
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`w-3.5 h-3.5 flex-shrink-0 ${
                  hasUppercase ? "text-[#30d158]" : "text-white/30"
                }`}
              />
              <span
                className={
                  hasUppercase
                    ? "text-white font-medium"
                    : "text-[var(--color-muted-foreground)]"
                }
              >
                1 uppercase letter (A-Z)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`w-3.5 h-3.5 flex-shrink-0 ${
                  hasNumber ? "text-[#30d158]" : "text-white/30"
                }`}
              />
              <span
                className={
                  hasNumber
                    ? "text-white font-medium"
                    : "text-[var(--color-muted-foreground)]"
                }
              >
                1 number (0-9)
              </span>
            </div>
          </div>
        )}

        <Input
          id="register-confirm-password"
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="••••••••"
          required
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="text-[var(--color-muted-foreground)] hover:text-white transition-colors focus:outline-none cursor-pointer p-1"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
          error={errors.confirmPassword?.message}
          helperText={
            isMatch && !errors.confirmPassword ? "✓ Passwords match" : undefined
          }
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-4"
          isLoading={isLoading}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Create Account
        </Button>
      </form>

      {onNavigateToLogin && (
        <div className="text-center mt-6 pt-5 border-t border-white/10">
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-medium text-[#F5A623] hover:text-[#FFB940] hover:underline transition-colors focus:outline-none cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </div>
      )}
    </div>
  );
};
