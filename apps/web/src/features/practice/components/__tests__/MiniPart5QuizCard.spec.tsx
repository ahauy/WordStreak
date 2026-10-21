import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MiniPart5QuizCard } from '../MiniPart5QuizCard';
import type { ToeicQuizQuestionDto } from '@wordstreak/shared-types';

describe('MiniPart5QuizCard (US-LIB-07 TC-006)', () => {
  const mockQuestion: ToeicQuizQuestionDto = {
    id: 'q1',
    cardId: 'c1',
    type: 'MINI_PART_5',
    prompt: 'Complete the sentence with the most appropriate word:',
    sentence: 'The hotel can ______ up to 500 guests.',
    targetWord: 'accommodate',
    vietnameseMeaning: 'đáp ứng, chứa được',
    explanation: '"accommodate" (verb) means to provide lodging or space.',
    options: [
      { id: 'opt_1', text: 'accommodate', isCorrect: true },
      { id: 'opt_2', text: 'accumulate', isCorrect: false },
      { id: 'opt_3', text: 'recommend', isCorrect: false },
      { id: 'opt_4', text: 'beneficial', isCorrect: false },
    ],
  };

  it('renders prompt, sentence with blank, and all 4 options', () => {
    render(
      <MiniPart5QuizCard
        question={mockQuestion}
        onSelectAnswer={vi.fn()}
        onNext={vi.fn()}
        currentIndex={0}
        totalQuestions={10}
      />
    );

    expect(screen.getByText(/TOEIC Part 5/i)).toBeInTheDocument();
    expect(screen.getByText('1 / 10')).toBeInTheDocument();
    expect(screen.getByText(/The hotel can ______ up to 500 guests./i)).toBeInTheDocument();
    expect(screen.getByText('accommodate')).toBeInTheDocument();
    expect(screen.getByText('accumulate')).toBeInTheDocument();
    expect(screen.getByText('recommend')).toBeInTheDocument();
    expect(screen.getByText('beneficial')).toBeInTheDocument();
  });

  it('handles option selection and triggers callback with correctness', () => {
    const handleSelect = vi.fn();
    const handleNext = vi.fn();

    render(
      <MiniPart5QuizCard
        question={mockQuestion}
        onSelectAnswer={handleSelect}
        onNext={handleNext}
        currentIndex={0}
        totalQuestions={10}
      />
    );

    const correctButton = screen.getByText('accommodate').closest('button');
    expect(correctButton).toBeInTheDocument();

    fireEvent.click(correctButton!);
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'accommodate', isCorrect: true }),
      true
    );

    // After selection, explanation and Next button should appear
    expect(screen.getByText(/Nghĩa:/i)).toBeInTheDocument();
    const nextBtn = screen.getByText(/Tiếp tục/i);
    expect(nextBtn).toBeInTheDocument();

    fireEvent.click(nextBtn);
    expect(handleNext).toHaveBeenCalledTimes(1);
  });
});
