import { useState } from "react";
import {
  Volume2,
  Flame,
  Check,
  Sparkles,
  Shield,
  Layers,
  HelpCircle,
  BarChart2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface WordItem {
  word: string;
  ipa: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  repetition: number;
  intervalDays: number;
  easeFactor: number;
  streak: number;
}

const sampleWords: WordItem[] = [
  {
    word: "serendipity",
    ipa: "/ˌser.ənˈdɪp.ə.ti/",
    partOfSpeech: "noun",
    definition:
      "The occurrence of valuable discoveries by chance in a happy or beneficial way.",
    example:
      "Finding this vocabulary app was pure serendipity for my IELTS preparation.",
    repetition: 4,
    intervalDays: 7,
    easeFactor: 2.5,
    streak: 14,
  },
  {
    word: "ubiquitous",
    ipa: "/juːˈbɪk.wɪ.təs/",
    partOfSpeech: "adjective",
    definition: "Present, appearing, or found everywhere simultaneously.",
    example:
      "Smartphones have made instant English dictionary lookups ubiquitous.",
    repetition: 5,
    intervalDays: 14,
    easeFactor: 2.6,
    streak: 19,
  },
  {
    word: "ephemeral",
    ipa: "/ɪˈfem.ər.əl/",
    partOfSpeech: "adjective",
    definition: "Lasting for a very short time; transitory; fleeting.",
    example: "Memory without spaced repetition is ephemeral and fades in days.",
    repetition: 2,
    intervalDays: 3,
    easeFactor: 2.4,
    streak: 8,
  },
];

export function TerminalPreviewSection() {
  const { t } = useTranslation("landing");
  const [activeTab, setActiveTab] = useState<"srs" | "quiz" | "streak">("srs");
  const [selectedWordIdx, setSelectedWordIdx] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);

  // Quiz state
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(
    null,
  );
  const [quizAnswered, setQuizAnswered] = useState(false);

  // Streak state
  const [streakFreezeActive, setStreakFreezeActive] = useState(true);

  const currentWord = sampleWords[selectedWordIdx];

  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.rate = 0.88;
      utterance.lang = "en-US";
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 900);
    }
  };

  const handleGrade = (rating: string) => {
    setFeedbackGiven(rating);
    setTimeout(() => {
      setFeedbackGiven(null);
      setSelectedWordIdx((prev) => (prev + 1) % sampleWords.length);
    }, 850);
  };

  return (
    <section id="interactive-demo" className="pb-16 sm:pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Section Tag */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6"
        >
          <span className="command-tag-chip mb-3">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-black" />
            {t("sandbox.tag", "Interactive Learning Sandbox")}
          </span>
          <h2 className="heading-lg">
            {t("sandbox.title", "Experience WordStreak in Action")}
          </h2>
          <p className="body-sm mt-1.5">
            {t(
              "sandbox.subtitle",
              "Test the SM-2 algorithm, quiz formats, and daily streak loop right in your browser.",
            )}
          </p>
        </motion.div>

        {/* Terminal / Preview Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="terminal-card-container"
        >
          {/* Card Window Header with macOS Traffic Lights & Mode Tabs */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#e5e5e5] pb-3 mb-4 gap-3">
            <div className="flex items-center gap-2">
              <span className="traffic-dot traffic-dot-red" />
              <span className="traffic-dot traffic-dot-yellow" />
              <span className="traffic-dot traffic-dot-green" />
              <span className="ml-2 text-xs font-mono text-[#a3a3a3] hidden sm:inline">
                {t(
                  "sandbox.liveHeader",
                  "wordstreak-app — live interactive sandbox",
                )}
              </span>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-[#fafafa] p-1 overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setActiveTab("srs")}
                className={`flex items-center gap-1.5 cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  activeTab === "srs"
                    ? "bg-black text-white shadow-xs"
                    : "text-[#737373] hover:text-black"
                }`}
              >
                <Layers className="h-3 w-3" />
                <span>{t("sandbox.tabSrs", "SM-2 Flashcard")}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("quiz")}
                className={`flex items-center gap-1.5 cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  activeTab === "quiz"
                    ? "bg-black text-white shadow-xs"
                    : "text-[#737373] hover:text-black"
                }`}
              >
                <HelpCircle className="h-3 w-3" />
                <span>{t("sandbox.tabQuiz", "Active Quiz")}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("streak")}
                className={`flex items-center gap-1.5 cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  activeTab === "streak"
                    ? "bg-black text-white shadow-xs"
                    : "text-[#737373] hover:text-black"
                }`}
              >
                <BarChart2 className="h-3 w-3" />
                <span>{t("sandbox.tabStreak", "Streak & Heatmap")}</span>
              </button>
            </div>
          </div>

          {/* Mode 1: SM-2 Spaced Repetition Flashcard */}
          {activeTab === "srs" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-2 sm:p-4">
              {/* Flashcard Box */}
              <div className="md:col-span-7 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#a3a3a3]">
                      {t("sandbox.cardHeader", {
                        current: selectedWordIdx + 1,
                        total: sampleWords.length,
                        defaultValue: `Card #${selectedWordIdx + 1} of 3 · Contextual Memory Hook`,
                      })}
                    </span>
                    <h3
                      className="text-2xl font-bold tracking-tight text-black mt-0.5"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {currentWord.word}
                    </h3>
                    <p className="text-xs text-[#737373] mt-0.5">
                      <span className="font-mono">{currentWord.ipa}</span> ·{" "}
                      <span className="italic">{currentWord.partOfSpeech}</span>
                    </p>
                  </div>

                  {/* Audio Button with micro-equalizer */}
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    type="button"
                    onClick={handlePlayAudio}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-black hover:border-black transition-colors cursor-pointer"
                    title={t("hero.playPronunciation", "Play pronunciation")}
                  >
                    {isPlayingAudio ? (
                      <div className="flex items-center gap-0.5 h-3">
                        <span className="w-0.5 h-3 bg-black rounded-full audio-bar-1" />
                        <span className="w-0.5 h-3 bg-black rounded-full audio-bar-2" />
                        <span className="w-0.5 h-3 bg-black rounded-full audio-bar-3" />
                      </div>
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </motion.button>
                </div>

                <p className="mt-3.5 text-xs text-[#525252] leading-relaxed">
                  {currentWord.definition}
                </p>

                <div className="mt-3 rounded-lg border border-[#e5e5e5] bg-white p-2.5 text-xs text-[#737373] italic">
                  &ldquo;{currentWord.example}&rdquo;
                </div>

                {/* Self-Rating Interval Action Buttons */}
                <div className="mt-4 pt-3 border-t border-[#e5e5e5] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#a3a3a3] font-mono">
                    {t("sandbox.rateRecall", "Rate Recall:")}
                  </span>
                  <div className="flex gap-1.5">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleGrade("Hard")}
                      className="cursor-pointer rounded-full border border-[#e5e5e5] bg-white px-2.5 py-1 text-[11px] font-medium text-black hover:bg-[#f0f0f0] transition-colors"
                    >
                      {t("sandbox.rateHard", "Hard (+1d)")}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleGrade("Good")}
                      className="cursor-pointer rounded-full border border-[#e5e5e5] bg-white px-2.5 py-1 text-[11px] font-medium text-black hover:bg-[#f0f0f0] transition-colors"
                    >
                      {t("sandbox.rateGood", {
                        days: currentWord.intervalDays,
                        defaultValue: `Good (+${currentWord.intervalDays}d)`,
                      })}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleGrade("Easy")}
                      className="cursor-pointer rounded-full bg-black px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#1a1a1a] transition-colors"
                    >
                      {t("sandbox.rateEasy", {
                        days: currentWord.intervalDays * 2,
                        defaultValue: `Easy (+${currentWord.intervalDays * 2}d)`,
                      })}
                    </motion.button>
                  </div>
                </div>

                {feedbackGiven && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-center text-xs font-mono text-black font-medium flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 text-[#27c93f]" />
                    {t("sandbox.feedbackSuccess", {
                      grade: feedbackGiven,
                      defaultValue: `Recorded "${feedbackGiven}" — SM-2 schedule recalculated!`,
                    })}
                  </motion.div>
                )}
              </div>

              {/* SM-2 Telemetry */}
              <div className="md:col-span-5 flex flex-col justify-between h-full font-mono text-xs text-[#737373]">
                <div className="space-y-2.5 rounded-xl border border-[#e5e5e5] bg-white p-4">
                  <div className="flex items-center justify-between text-black font-semibold border-b border-[#e5e5e5] pb-2">
                    <span>{t("sandbox.telemetryTitle", "SM-2 SCHEDULER")}</span>
                    <span className="text-[11px] text-[#27c93f] font-bold">
                      {t("sandbox.telemetryOptimal", "OPTIMAL")}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>
                      {t("sandbox.telemetryRepetition", "Repetition Count:")}
                    </span>
                    <span className="text-black font-medium">
                      {currentWord.repetition}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>
                      {t("sandbox.telemetryInterval", "Current Interval:")}
                    </span>
                    <span className="text-black font-medium">
                      {t("sandbox.telemetryIntervalDays", {
                        count: currentWord.intervalDays,
                        defaultValue: `${currentWord.intervalDays} days`,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>
                      {t("sandbox.telemetryEaseFactor", "Ease Factor (EF):")}
                    </span>
                    <span className="text-black font-medium">
                      {currentWord.easeFactor.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>
                      {t("sandbox.telemetryNextReview", "Next Review:")}
                    </span>
                    <span className="text-black font-medium">
                      {t("sandbox.telemetryNextDays", {
                        count: currentWord.intervalDays,
                        defaultValue: `in ${currentWord.intervalDays} days`,
                      })}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-[#a3a3a3]">
                    {t("sandbox.telemetrySelectWord", "SELECT WORD:")}
                  </span>
                  <div className="flex gap-1.5">
                    {sampleWords.map((item, idx) => (
                      <button
                        key={item.word}
                        onClick={() => setSelectedWordIdx(idx)}
                        className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-mono transition-colors ${
                          selectedWordIdx === idx
                            ? "bg-black text-white"
                            : "border border-[#e5e5e5] bg-[#fafafa] text-[#737373] hover:text-black"
                        }`}
                      >
                        {item.word}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Active Recall Quiz Drill */}
          {activeTab === "quiz" && (
            <div className="p-4 sm:p-6">
              <div className="max-w-xl mx-auto rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-6">
                <div className="flex items-center justify-between text-xs text-[#737373] font-mono border-b border-[#e5e5e5] pb-3 mb-4">
                  <span>
                    {t("sandbox.quizTag", "QUIZ MODE · FILL-IN-THE-BLANK")}
                  </span>
                  <span className="text-black font-semibold">+10 XP</span>
                </div>

                <p className="text-sm sm:text-base text-black font-medium leading-relaxed">
                  {t(
                    "sandbox.quizPrompt",
                    "Complete the sentence with the correct vocabulary word:",
                  )}
                </p>

                <div className="my-4 rounded-lg border border-[#e5e5e5] bg-white p-3.5 text-sm sm:text-base text-black font-serif italic">
                  {t("sandbox.quizSentence", {
                    blank:
                      quizAnswered && quizSelectedOption === 1
                        ? "ubiquitous"
                        : "________",
                    defaultValue: `“Smartphones and cloud storage have made digital dictionaries ${
                      quizAnswered && quizSelectedOption === 1
                        ? "ubiquitous"
                        : "________"
                    } in modern education.”`,
                  })}
                </div>

                {/* Quiz Multiple Choice Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { label: "A", word: "ephemeral", correct: false },
                    { label: "B", word: "ubiquitous", correct: true },
                    { label: "C", word: "serendipity", correct: false },
                    { label: "D", word: "resilience", correct: false },
                  ].map((option, idx) => {
                    const isSelected = quizSelectedOption === idx;
                    return (
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        key={option.word}
                        onClick={() => {
                          setQuizSelectedOption(idx);
                          setQuizAnswered(true);
                        }}
                        className={`flex items-center justify-between p-3 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                          isSelected
                            ? option.correct
                              ? "border-[#27c93f] bg-[#27c93f]/10 text-black font-bold"
                              : "border-[#ff5f56] bg-[#ff5f56]/10 text-black font-bold"
                            : "border-[#e5e5e5] bg-white hover:border-[#a3a3a3] text-[#525252]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-[#a3a3a3]">
                            {option.label}.
                          </span>
                          <span className="font-mono">{option.word}</span>
                        </div>
                        {isSelected &&
                          (option.correct ? (
                            <CheckCircle2 className="h-4 w-4 text-[#27c93f]" />
                          ) : (
                            <XCircle className="h-4 w-4 text-[#ff5f56]" />
                          ))}
                      </motion.button>
                    );
                  })}
                </div>

                {quizAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 pt-3 border-t border-[#e5e5e5] flex items-center justify-between text-xs font-mono"
                  >
                    {quizSelectedOption === 1 ? (
                      <span className="text-[#27c93f] font-semibold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" />
                        {t(
                          "sandbox.quizCorrect",
                          "Correct! “Ubiquitous” = present everywhere.",
                        )}
                      </span>
                    ) : (
                      <span className="text-[#ff5f56] font-semibold">
                        {t(
                          "sandbox.quizIncorrect",
                          "Try again! The correct answer is B. ubiquitous.",
                        )}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setQuizSelectedOption(null);
                        setQuizAnswered(false);
                      }}
                      className="cursor-pointer underline text-[#737373] hover:text-black"
                    >
                      {t("sandbox.quizReset", "Reset Quiz")}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Mode 3: Daily Streak & Consistency Heatmap */}
          {activeTab === "streak" && (
            <div className="p-4 sm:p-6">
              <div className="max-w-2xl mx-auto rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-6">
                <div className="flex flex-wrap items-center justify-between border-b border-[#e5e5e5] pb-4 mb-4 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                      <Flame className="h-5 w-5 fill-white" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-black font-mono">
                        {t("sandbox.streakTitle", {
                          count: 18,
                          defaultValue: "18 Days Streak",
                        })}
                      </div>
                      <div className="text-xs text-[#737373]">
                        {t("sandbox.streakCompleted", {
                          count: 12,
                          defaultValue: "12 daily reviews completed today",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Streak Freeze Shield Toggle */}
                  <button
                    type="button"
                    onClick={() => setStreakFreezeActive(!streakFreezeActive)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer ${
                      streakFreezeActive
                        ? "border-[#e5e5e5] bg-white text-black font-medium"
                        : "border-[#e5e5e5] bg-white text-[#a3a3a3]"
                    }`}
                  >
                    <Shield
                      className={`h-3.5 w-3.5 ${streakFreezeActive ? "text-black fill-black" : "text-[#a3a3a3]"}`}
                    />
                    <span>
                      {streakFreezeActive
                        ? t(
                            "sandbox.streakFreezeActive",
                            "Streak Freeze: ACTIVE",
                          )
                        : t("sandbox.streakFreezeOff", "Streak Freeze: OFF")}
                    </span>
                  </button>
                </div>

                {/* Heatmap Grid Demo (16 weeks x 7 days) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#a3a3a3]">
                    <span>
                      {t(
                        "sandbox.heatmapTitle",
                        "CONSISTENCY HEATMAP (PAST 16 WEEKS)",
                      )}
                    </span>
                    <span>
                      {t(
                        "sandbox.heatmapConsistency",
                        "100% Habit Consistency",
                      )}
                    </span>
                  </div>

                  <div className="overflow-x-auto py-2">
                    <div className="grid grid-flow-col grid-rows-7 gap-1 w-max">
                      {Array.from({ length: 112 }).map((_, idx) => {
                        // Level calculation
                        const rand = ((idx * 17 + 7) % 100) / 100;
                        const level =
                          idx > 90
                            ? rand > 0.1
                              ? 3
                              : 2
                            : rand > 0.4
                              ? rand > 0.75
                                ? 3
                                : 2
                              : rand > 0.2
                                ? 1
                                : 0;
                        const bgClass =
                          level === 3
                            ? "bg-black"
                            : level === 2
                              ? "bg-[#525252]"
                              : level === 1
                                ? "bg-[#d4d4d4]"
                                : "bg-[#e5e5e5]";

                        return (
                          <div
                            key={idx}
                            title={`Day ${idx + 1}: ${level * 5 + 3} reviews`}
                            className={`h-3 w-3 rounded-xs ${bgClass} transition-transform hover:scale-125 cursor-pointer`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#737373] pt-2 border-t border-[#e5e5e5]">
                    <span>{t("sandbox.heatmapLess", "Less")}</span>
                    <div className="flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-xs bg-[#e5e5e5]" />
                      <span className="h-2.5 w-2.5 rounded-xs bg-[#d4d4d4]" />
                      <span className="h-2.5 w-2.5 rounded-xs bg-[#525252]" />
                      <span className="h-2.5 w-2.5 rounded-xs bg-black" />
                    </div>
                    <span>{t("sandbox.heatmapMore", "More Reviews")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
