import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Compass,
  GraduationCap,
  Sparkles,
  Target,
  CheckCircle2,
  ArrowRight,
  Flame,
  X,
} from "lucide-react";
import type {
  LearningGoal,
  StartingLevel,
  OnboardingResponse,
} from "@wordstreak/shared-types";
import { userService } from "../../user-profile/services/userService";
import { useAuthStore } from "../../../store/useAuthStore";

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (response: OnboardingResponse) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t, i18n } = useTranslation(["common"]);
  const { updateUser } = useAuthStore();
  const isVi = i18n.language === "vi";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal>("TOEIC");
  const [selectedLevel, setSelectedLevel] = useState<StartingLevel>("BEGINNER");
  const [selectedDailyGoal, setSelectedDailyGoal] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrolledDeckTitle, setEnrolledDeckTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const goals: Array<{
    id: LearningGoal;
    title: string;
    desc: string;
    icon: React.ReactNode;
  }> = [
    {
      id: "TOEIC",
      title: isVi ? "Luyện thi TOEIC" : "TOEIC Mastery",
      desc: isVi
        ? "Tập trung 1.200 từ vựng kinh doanh & văn phòng chuẩn TSL 1.2"
        : "Focus on 1,200 high-frequency business & office words (TSL 1.2)",
      icon: <Target className="w-5 h-5 text-black" />,
    },
    {
      id: "IELTS",
      title: isVi ? "Luyện thi IELTS / Học thuật" : "IELTS & Academic",
      desc: isVi
        ? "Mở rộng vốn từ học thuật chuyên sâu và bài viết luận"
        : "Master academic words for writing and high-band exams",
      icon: <GraduationCap className="w-5 h-5 text-black" />,
    },
    {
      id: "COMMUNICATION",
      title: isVi ? "Giao tiếp hằng ngày" : "Daily Conversation",
      desc: isVi
        ? "Phản xạ giao tiếp tự nhiên và các mẫu câu thông dụng"
        : "Everyday conversation fluency and natural expressions",
      icon: <Compass className="w-5 h-5 text-black" />,
    },
    {
      id: "WORK",
      title: isVi ? "Tiếng Anh công việc & Sự nghiệp" : "Career & Workplace",
      desc: isVi
        ? "Giao tiếp email, thuyết trình và đàm phán quốc tế"
        : "Professional emails, presentations, and team communication",
      icon: <Sparkles className="w-5 h-5 text-black" />,
    },
  ];

  const levels: Array<{
    id: StartingLevel;
    title: string;
    desc: string;
    badge?: string;
  }> = [
    {
      id: "ZERO",
      title: isVi ? "Mất gốc / Bắt đầu từ số 0" : "Starting Fresh / Zero",
      desc: isVi
        ? "Đã lâu không dùng tiếng Anh, cần lộ trình chậm rãi với ví dụ cực kỳ cơ bản."
        : "Haven't practiced in a long time. Needs slow pace & simplified examples.",
      badge: isVi ? "Đề xuất: Chặng Khởi động" : "Recommended: Foundation",
    },
    {
      id: "BEGINNER",
      title: isVi ? "Cơ bản (Sơ cấp)" : "Beginner (Elementary)",
      desc: isVi
        ? "Biết các từ cơ bản, cần xây dựng phản xạ từ vựng cốt lõi."
        : "Knows basic words, wants to build a strong core vocabulary.",
    },
    {
      id: "INTERMEDIATE",
      title: isVi ? "Trung cấp (Đã có nền tảng)" : "Intermediate",
      desc: isVi
        ? "Có thể đọc hiểu đơn giản, muốn mở rộng từ vựng chuyên ngành nhanh."
        : "Can understand simple text, wants to expand specialized vocabulary.",
    },
    {
      id: "ADVANCED",
      title: isVi ? "Nâng cao" : "Advanced",
      desc: isVi
        ? "Ôn luyện các từ vựng khó, collocations và tinh chỉnh độ chuẩn xác."
        : "Fine-tune accuracy, nuances, and rare collocations.",
    },
  ];

  const dailyGoals = [
    {
      count: 5,
      label: isVi ? "5 từ / ngày" : "5 words / day",
      subtext: isVi ? "5 phút thong thả" : "5 mins / day",
    },
    {
      count: 10,
      label: isVi ? "10 từ / ngày" : "10 words / day",
      subtext: isVi ? "Đề xuất tiêu chuẩn (10–15 phút)" : "Standard recommendation",
      isDefault: true,
    },
    {
      count: 20,
      label: isVi ? "20 từ / ngày" : "20 words / day",
      subtext: isVi ? "Tăng tốc ôn thi (20–30 phút)" : "Intensive practice",
    },
  ];

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await userService.completeOnboarding({
        learningGoal: selectedGoal,
        startingLevel: selectedLevel,
        dailyGoal: selectedDailyGoal,
      });

      updateUser(response.user);
      setEnrolledDeckTitle(response.enrolledDeckTitle || "");
      setStep(4);
      onSuccess?.(response);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : isVi
            ? "Không thể hoàn tất onboarding. Vui lòng thử lại."
            : "Failed to complete onboarding. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-wizard-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#e5e5e5] shadow-2xl p-6 sm:p-8 overflow-hidden text-black">
        {/* Close / Skip button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t("actions.close", "Close")}
          className="absolute top-5 right-5 p-2 rounded-full text-[#737373] hover:text-black hover:bg-[#fafafa] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Stepper (Steps 1 to 3) */}
        {step < 4 && (
          <div className="flex items-center gap-2 mb-6">
            <span
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                step >= 1 ? "bg-black" : "bg-[#e5e5e5]"
              }`}
            />
            <span
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                step >= 2 ? "bg-black" : "bg-[#e5e5e5]"
              }`}
            />
            <span
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                step >= 3 ? "bg-black" : "bg-[#e5e5e5]"
              }`}
            />
          </div>
        )}

        {/* Error notification if any */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* STEP 1: Select Goal */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2
                id="onboarding-wizard-title"
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {isVi ? "Mục tiêu học tập của bạn là gì?" : "What is your primary learning goal?"}
              </h2>
              <p className="text-sm text-[#737373]">
                {isVi
                  ? "WordStreak sẽ gợi ý lộ trình và bộ từ tối ưu cho bạn."
                  : "WordStreak will curate the most effective starter deck for you."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goals.map((g) => {
                const isSelected = selectedGoal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGoal(g.id)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "border-black bg-[#fafafa] ring-1 ring-black"
                        : "border-[#e5e5e5] hover:border-[#d4d4d4] bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 rounded-xl bg-white border border-[#e5e5e5]">
                        {g.icon}
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-black" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-black">
                        {g.title}
                      </h3>
                      <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                        {g.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-[#737373] hover:text-black cursor-pointer font-medium"
              >
                {isVi ? "Bỏ qua thiết lập" : "Skip for now"}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <span>{isVi ? "Tiếp tục" : "Next"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Level */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2
                id="onboarding-wizard-title"
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {isVi ? "Trình độ tiếng Anh hiện tại của bạn?" : "What is your current English level?"}
              </h2>
              <p className="text-sm text-[#737373]">
                {isVi
                  ? "Đừng lo lắng! WordStreak sẽ điều chỉnh độ khó phù hợp với bạn."
                  : "No worries! WordStreak will adapt vocabulary difficulty to your level."}
              </p>
            </div>

            <div className="space-y-2.5">
              {levels.map((lvl) => {
                const isSelected = selectedLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setSelectedLevel(lvl.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? "border-black bg-[#fafafa] ring-1 ring-black"
                        : "border-[#e5e5e5] hover:border-[#d4d4d4] bg-white"
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-black">
                          {lvl.title}
                        </span>
                        {lvl.badge && (
                          <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            {lvl.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#737373] leading-relaxed">
                        {lvl.desc}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-[#737373] hover:text-black cursor-pointer font-medium"
              >
                {isVi ? "Quay lại" : "Back"}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <span>{isVi ? "Tiếp tục" : "Next"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Daily Goal */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2
                id="onboarding-wizard-title"
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {isVi ? "Mục tiêu học mỗi ngày của bạn?" : "Your daily study goal?"}
              </h2>
              <p className="text-sm text-[#737373]">
                {isVi
                  ? "Bạn có thể thay đổi mục tiêu này bất kỳ lúc nào trong cài đặt."
                  : "You can adjust this goal anytime in your profile settings."}
              </p>
            </div>

            <div className="space-y-3">
              {dailyGoals.map((dg) => {
                const isSelected = selectedDailyGoal === dg.count;
                return (
                  <button
                    key={dg.count}
                    type="button"
                    onClick={() => setSelectedDailyGoal(dg.count)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "border-black bg-[#fafafa] ring-1 ring-black"
                        : "border-[#e5e5e5] hover:border-[#d4d4d4] bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black text-white font-bold flex items-center justify-center text-sm">
                        {dg.count}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-black">
                            {dg.label}
                          </span>
                          {dg.isDefault && (
                            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-neutral-100 text-neutral-800">
                              {isVi ? "Khuyên dùng" : "Popular"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#737373] mt-0.5">
                          {dg.subtext}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-black" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="text-sm text-[#737373] hover:text-black cursor-pointer font-medium"
              >
                {isVi ? "Quay lại" : "Back"}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isSubmitting
                    ? isVi
                      ? "Đang lưu..."
                      : "Saving..."
                    : isVi
                      ? "Hoàn tất thiết lập"
                      : "Finish Setup"}
                </span>
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Celebration & Enrolled Deck Success */}
        {step === 4 && (
          <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Flame className="w-8 h-8 fill-purple-600" />
            </div>

            <div className="space-y-2">
              <h2
                id="onboarding-wizard-title"
                className="text-2xl font-bold tracking-tight text-black"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {isVi ? "Chào mừng bạn đến với WordStreak!" : "Welcome to WordStreak!"}
              </h2>
              <p className="text-sm text-[#737373] max-w-sm mx-auto">
                {isVi
                  ? "Hồ sơ của bạn đã sẵn sàng. Bộ từ khởi đầu phù hợp nhất đã được tự động thêm vào thư viện của bạn."
                  : "Your profile is set! A personalized starter deck has been enrolled for you."}
              </p>
            </div>

            {enrolledDeckTitle && (
              <div className="p-4 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] max-w-sm mx-auto text-left flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-[#e5e5e5]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-xs text-[#737373] uppercase font-semibold tracking-wider">
                    {isVi ? "Bộ từ khởi đầu" : "Enrolled Deck"}
                  </span>
                  <p className="text-sm font-bold text-black line-clamp-1">
                    {enrolledDeckTitle}
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center w-full max-w-sm px-6 py-3 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors cursor-pointer shadow-md"
            >
              {isVi ? "Bắt đầu học ngay" : "Start Learning Now"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
