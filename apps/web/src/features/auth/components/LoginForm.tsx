import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserCheck, Lock, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
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
    <div className="w-full max-w-md glass-panel rounded-3xl p-8 sm:p-10 relative overflow-hidden border border-white/10 shadow-2xl">
      {/* Decorative accent top glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-sm text-slate-400">
          Sign in to keep your vocabulary streak alive
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm animate-in fade-in duration-200"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          id="login-identifier"
          label="Email or Username"
          type="text"
          autoComplete="username"
          placeholder="you@wordstreak.app or streakmaster"
          required
          leftIcon={<UserCheck className="w-4 h-4" />}
          error={errors.identifier?.message}
          {...register("identifier")}
        />

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
              className="text-slate-400 hover:text-white transition-colors focus:outline-none cursor-pointer p-1"
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

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      {onNavigateToRegister && (
        <div className="text-center mt-6 pt-6 border-t border-slate-800/80">
          <p className="text-sm text-slate-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none focus:underline cursor-pointer"
            >
              Create an account
            </button>
          </p>
        </div>
      )}
    </div>
  );
};
