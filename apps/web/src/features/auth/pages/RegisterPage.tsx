import React from "react";
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "../components/RegisterForm";
import { Sparkles, Flame, Brain, Shield } from "lucide-react";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-mesh-glow flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 relative z-10">
        <div
          className="inline-flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-3xl font-black tracking-tight text-white">
            WordStreak
          </span>
        </div>

        {/* Feature Pills */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Daily Streaks
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span className="flex items-center gap-1">
            <Brain className="w-3.5 h-3.5 text-indigo-400" /> Spaced Repetition
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Multi-Device
          </span>
        </div>
      </div>

      {/* Register Card */}
      <div className="relative z-10 w-full flex justify-center">
        <RegisterForm
          onSuccess={() => navigate("/dashboard", { replace: true })}
          onNavigateToLogin={() => navigate("/login")}
        />
      </div>
    </div>
  );
};
