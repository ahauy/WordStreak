import React, { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, Sparkles } from "lucide-react";
import type { StartingLevel } from "@wordstreak/shared-types";

export interface AdaptiveMiniTestProps {
  isVi: boolean;
  onComplete: (recommendedLevel: StartingLevel) => void;
  onSkip: () => void;
}

interface TestQuestion {
  id: number;
  word: string;
  ipa: string;
  correctAnswer: string;
  options: string[];
}

const QUESTIONS_VI: TestQuestion[] = [
  {
    id: 1,
    word: "time",
    ipa: "/taɪm/",
    correctAnswer: "thời gian",
    options: ["thời gian", "tiền bạc", "con người", "công việc"],
  },
  {
    id: 2,
    word: "water",
    ipa: "/ˈwɔːtər/",
    correctAnswer: "nước uống",
    options: ["ngọn lửa", "nước uống", "mảnh đất", "không khí"],
  },
  {
    id: 3,
    word: "house",
    ipa: "/haʊs/",
    correctAnswer: "ngôi nhà",
    options: ["chiếc xe", "con đường", "ngôi nhà", "bệnh viện"],
  },
  {
    id: 4,
    word: "friend",
    ipa: "/frend/",
    correctAnswer: "người bạn",
    options: ["kẻ thù", "người bạn", "giáo viên", "người lạ"],
  },
  {
    id: 5,
    word: "learn",
    ipa: "/lɜːrn/",
    correctAnswer: "học tập",
    options: ["nghỉ ngơi", "ăn uống", "học tập", "chạy bộ"],
  },
];

const QUESTIONS_EN: TestQuestion[] = [
  {
    id: 1,
    word: "time",
    ipa: "/taɪm/",
    correctAnswer: "a period or moment",
    options: ["a period or moment", "money or cash", "human beings", "office work"],
  },
  {
    id: 2,
    word: "water",
    ipa: "/ˈwɔːtər/",
    correctAnswer: "clear drinkable liquid",
    options: ["hot flame", "clear drinkable liquid", "open ground", "fresh air"],
  },
  {
    id: 3,
    word: "house",
    ipa: "/haʊs/",
    correctAnswer: "a home to live in",
    options: ["a vehicle", "a roadway", "a home to live in", "a hospital"],
  },
  {
    id: 4,
    word: "friend",
    ipa: "/frend/",
    correctAnswer: "a person you like and trust",
    options: ["an enemy", "a person you like and trust", "a teacher", "a stranger"],
  },
  {
    id: 5,
    word: "learn",
    ipa: "/lɜːrn/",
    correctAnswer: "to gain knowledge or skill",
    options: ["to sleep deeply", "to eat food", "to gain knowledge or skill", "to run fast"],
  },
];

export const AdaptiveMiniTest: React.FC<AdaptiveMiniTestProps> = ({
  isVi,
  onComplete,
  onSkip,
}) => {
  const questions = isVi ? QUESTIONS_VI : QUESTIONS_EN;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [consecutiveMistakes, setConsecutiveMistakes] = useState(0);
  const [isEarlyStopped, setIsEarlyStopped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (selectedOption !== null || isFinished) return;
    setSelectedOption(opt);

    const isCorrect = opt === currentQ.correctAnswer;
    const nextCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    const nextConsecutiveMistakes = isCorrect ? 0 : consecutiveMistakes + 1;

    setCorrectCount(nextCorrectCount);
    setConsecutiveMistakes(nextConsecutiveMistakes);

    setTimeout(() => {
      // Early stopping condition: 3 consecutive mistakes
      if (nextConsecutiveMistakes >= 3) {
        setIsEarlyStopped(true);
        setIsFinished(true);
        return;
      }

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        setIsFinished(true);
      }
    }, 400);
  };

  const recommendedLevel: StartingLevel =
    isEarlyStopped || correctCount < 3 ? "ZERO" : "BEGINNER";

  if (isFinished) {
    return (
      <div className="space-y-6 py-2" data-testid="mini-test-result">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3
            className="text-xl font-bold tracking-tight text-black"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            {isVi ? "Kết quả đánh giá nhanh" : "Quick Assessment Result"}
          </h3>
          <p className="text-sm text-[#737373]">
            {isEarlyStopped
              ? isVi
                ? "Bài test tự động dừng sớm để không làm bạn mất thời gian."
                : "The test stopped early to save your time and energy."
              : isVi
              ? `Bạn đã trả lời đúng ${correctCount}/${questions.length} từ nền tảng.`
              : `You scored ${correctCount}/${questions.length} foundational words.`}
          </p>
        </div>

        {recommendedLevel === "ZERO" ? (
          <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                {isVi ? "Đề xuất: Chặng Khởi động (Foundation)" : "Recommended: Foundation Stage"}
              </span>
            </div>
            <p className="text-sm font-semibold text-black">
              {isVi
                ? "Đừng lo lắng! Bắt đầu lại từ con số 0 là điều hoàn toàn bình thường."
                : "No worries! Starting fresh from zero is completely normal."}
            </p>
            <p className="text-xs text-[#525252] leading-relaxed">
              {isVi
                ? "WordStreak đã chuẩn bị sẵn Chặng Khởi động với 300 từ sinh tồn cốt lõi, ví dụ cực ngắn và tốc độ 5 từ/ngày để bạn học thật nhẹ nhàng."
                : "WordStreak has prepared the Foundation Stage with 300 core survival words, short examples, and 5 words/day pace."}
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                {isVi ? "Đề xuất: Sơ cấp (Beginner)" : "Recommended: Elementary / Beginner"}
              </span>
            </div>
            <p className="text-sm font-semibold text-black">
              {isVi
                ? "Nền tảng của bạn rất tiềm năng!"
                : "Your foundational recall is strong!"}
            </p>
            <p className="text-xs text-[#525252] leading-relaxed">
              {isVi
                ? "Bạn đã ghi nhớ tốt các từ cơ bản. Hãy bắt đầu ngay với bộ từ thông dụng để tăng tốc từ vựng."
                : "You already know basic words. Let's start with high-frequency decks to expand your vocabulary."}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-[#737373] hover:text-black cursor-pointer font-medium"
          >
            {isVi ? "Tự chọn trình độ khác" : "Choose manually"}
          </button>
          <button
            type="button"
            onClick={() => onComplete(recommendedLevel)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <span>{isVi ? "Áp dụng & Tiếp tục" : "Apply & Continue"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="adaptive-mini-test">
      {/* Header & Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-black text-white">
            {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-xs text-[#737373]">
            {isVi ? "Đánh giá nhanh 60s" : "60s Quick Check"}
          </span>
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-[#737373] hover:text-black cursor-pointer font-medium underline"
        >
          {isVi ? "Bỏ qua test" : "Skip test"}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#f5f5f5] h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-black h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-5 rounded-2xl border border-[#e5e5e5] bg-white text-center space-y-2">
        <span className="text-xs uppercase tracking-wider text-[#737373] font-semibold">
          {isVi ? "Từ này có nghĩa là gì?" : "What does this word mean?"}
        </span>
        <h4
          className="text-3xl font-extrabold text-black tracking-tight"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          {currentQ.word}
        </h4>
        <span
          className="inline-block text-xs text-[#737373] font-mono"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          {currentQ.ipa}
        </span>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {currentQ.options.map((opt) => {
          const isChosen = selectedOption === opt;
          const isCorrect = opt === currentQ.correctAnswer;
          let btnStyle = "border-[#e5e5e5] hover:border-black bg-white text-black";

          if (selectedOption !== null) {
            if (isChosen) {
              btnStyle = isCorrect
                ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold"
                : "border-rose-400 bg-rose-50 text-rose-900 font-semibold";
            } else if (isCorrect) {
              btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
            } else {
              btnStyle = "border-[#e5e5e5] bg-[#fafafa] text-[#a3a3a3] opacity-60";
            }
          }

          return (
            <button
              key={opt}
              type="button"
              disabled={selectedOption !== null}
              onClick={() => handleSelectOption(opt)}
              className={`p-3.5 rounded-xl border text-sm text-left transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
            >
              <span>{opt}</span>
              {selectedOption !== null && isChosen && (
                isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
