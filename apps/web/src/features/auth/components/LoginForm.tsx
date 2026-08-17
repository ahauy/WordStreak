import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Input } from "../../../common/components/Input";
import { Button } from "../../../common/components/Button";
import { useAuthStore } from "../../../store/useAuthStore";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onNavigateToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onNavigateToRegister,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { login, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    try {
      await login({
        identifier: data.identifier,
        password: data.password,
      });
      onSuccess?.();
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="w-full max-w-md apple-card p-6 sm:p-8 relative">
      {/* Mobile Brand Header */}
      <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#1d1d1f] dark:bg-white flex items-center justify-center text-white dark:text-[#1d1d1f]">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="text-lg font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
          WordStreak
        </span>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-1.5">
          Sign In
        </h2>
        <p className="text-sm text-[#86868b]">
          Sign in to keep your vocabulary streak alive
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 p-3 rounded-[12px] bg-[#fff2f2] border border-[#e03e3e]/25 dark:bg-[#321c1c] dark:border-[#e03e3e]/40 flex items-start gap-2.5 text-[#e03e3e] dark:text-[#ff8a8a] text-xs transition-all"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="font-normal">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          id="login-identifier"
          label="Email or Username"
          type="text"
          autoComplete="username"
          placeholder="you@wordstreak.app or streakmaster"
          required
          leftIcon={<User className="w-4 h-4" />}
          error={errors.identifier?.message}
          {...register("identifier")}
        />

        <div className="space-y-1">
          <Input
            id="login-password"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            required
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-colors focus:outline-none cursor-pointer p-1"
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

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-[#86868b] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-[4px] border-[#d2d2d7] text-[#0066cc] focus:ring-[#0066cc] cursor-pointer accent-[#0066cc]"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() =>
                alert("Password reset instructions will be sent to your email.")
              }
              className="text-xs font-normal text-[#0066cc] dark:text-[#2997ff] hover:underline transition-colors focus:outline-none cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-3"
          isLoading={isLoading}
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      {onNavigateToRegister && (
        <div className="text-center mt-5 pt-5 border-t border-[#f0f0f0] dark:border-white/10">
          <p className="text-xs text-[#86868b]">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="font-semibold text-[#0066cc] dark:text-[#2997ff] hover:underline transition-colors focus:outline-none cursor-pointer"
            >
              Create an account
            </button>
          </p>
        </div>
      )}
    </div>
  );
};
