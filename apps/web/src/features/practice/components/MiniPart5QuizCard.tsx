import React, { useState } from "react";
import type { ToeicQuizQuestionDto, QuizOptionDto } from "@wordstreak/shared-types";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface MiniPart5QuizCardProps {
  question: ToeicQuizQuestionDto;
  onSelectAnswer: (option: QuizOptionDto, isCorrect: boolean) => void;
  onNext: () => void;
  currentIndex: number;
  totalQuestions: number;
}

export const MiniPart5QuizCard: React.FC<MiniPart5QuizCardProps> = ({
  question,
  onSelectAnswer,
  onNext,
  currentIndex,
  totalQuestions,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleOptionClick = (option: QuizOptionDto) => {
    if (hasAnswered) return;
    setSelectedOptionId(option.id);
    setHasAnswered(true);
    onSelectAnswer(option, option.isCorrect);
  };

  const getOptionClasses = (option: QuizOptionDto) => {
    if (!hasAnswered) {
      return "border-[#e5e5e5] bg-white hover:border-[#111111] hover:bg-neutral-50 text-[#111111]";
    }
    if (option.isCorrect) {
      return "border-emerald-500 bg-emerald-50 text-emerald-900";
    }
    if (option.id === selectedOptionId && !option.isCorrect) {
      return "border-rose-500 bg-rose-50 text-rose-900";
    }
    return "border-[#e5e5e5] bg-white opacity-40 text-neutral-400";
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-[#e5e5e5] rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* Header & Question Type */}
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 bg-neutral-100 text-[#111111] text-xs font-semibold rounded-full uppercase tracking-wider">
          {question.type === "MINI_PART_5" && "TOEIC Part 5 · Sentence Completion"}
          {question.type === "WORD_FAMILY" && "TOEIC Grammar · Word Form"}
          {question.type === "PARAPHRASE" && "TOEIC Vocabulary · Business Meaning"}
          {question.type === "LISTENING_TYPING" && "TOEIC Listening · Audio Recall"}
        </span>
        <span className="text-xs text-neutral-500 font-mono">
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Prompt & Sentence */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-neutral-500 mb-2 font-['Inter']">
          {question.prompt}
        </h3>
        {question.sentence && (
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 text-lg font-['Nunito'] font-semibold text-[#111111] leading-relaxed">
            {question.sentence}
          </div>
        )}
      </div>

      {/* Options List */}
      <div className="space-y-3 mb-6">
        {question.options?.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              disabled={hasAnswered}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left font-['Inter'] font-medium transition-all duration-150 ${getOptionClasses(
                option,
              )}`}
            >
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-700">
                  {letter}
                </span>
                <span className="text-base">{option.text}</span>
              </div>
              {hasAnswered && option.isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
              {hasAnswered && option.id === selectedOptionId && !option.isCorrect && (
                <XCircle className="w-5 h-5 text-rose-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback & Next Button */}
      {hasAnswered && (
        <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-neutral-600">
            {question.explanation && (
              <p className="font-['Inter']">{question.explanation}</p>
            )}
            {question.vietnameseMeaning && (
              <p className="text-neutral-500 text-xs mt-1">
                Nghĩa: <span className="font-semibold text-neutral-700">{question.vietnameseMeaning}</span>
              </p>
            )}
          </div>
          <button
            onClick={onNext}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#000000] text-white rounded-full font-['Inter'] font-medium text-sm flex items-center justify-center space-x-2 hover:bg-neutral-800 transition-colors"
          >
            <span>Tiếp tục</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
