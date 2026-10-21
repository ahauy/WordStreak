import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FlashcardReviewCard } from '../FlashcardReviewCard';
import type { DueCardItem } from '@wordstreak/shared-types';

describe('FlashcardReviewCard (US-LIB-14)', () => {
  const mockCard: DueCardItem = {
    id: 'prog-1',
    cardId: 'card-1',
    deckId: 'deck-1',
    deckTitle: 'Foundation Deck 1',
    word: 'resilient',
    meaning: 'kiên cường, phục hồi nhanh',
    phonetic: '/rɪˈzɪl.jənt/',
    audioUrl: 'https://audio.url/resilient.mp3',
    exampleSentence: 'She remained resilient in tough times.',
    status: 'LEARNING',
    interval: 1,
    repetitions: 1,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    stressSyllable: 2,
    endingSoundTipVi: 'Bật nhẹ âm /t/ ở cuối từ, không nuốt âm',
  };

  it('renders standard front face with word visible when isAudioFirstMode is false', () => {
    render(
      <FlashcardReviewCard
        card={mockCard}
        isFlipped={false}
        isSubmitting={false}
        onFlip={vi.fn()}
        onRate={vi.fn()}
        isAudioFirstMode={false}
      />
    );

    // Front face has h2 for the word
    expect(screen.getByRole('heading', { level: 2, name: 'resilient' })).toBeInTheDocument();
    expect(screen.queryByTestId('audio-first-front')).not.toBeInTheDocument();
  });

  it('renders Audio-First front face with word hidden when isAudioFirstMode is true', () => {
    render(
      <FlashcardReviewCard
        card={mockCard}
        isFlipped={false}
        isSubmitting={false}
        onFlip={vi.fn()}
        onRate={vi.fn()}
        isAudioFirstMode={true}
      />
    );

    expect(screen.getByTestId('audio-first-front')).toBeInTheDocument();
    expect(screen.getByText(/Nghe phát âm và nhận diện từ/i)).toBeInTheDocument();
    // Front face h2 word should NOT exist
    expect(screen.queryByRole('heading', { level: 2, name: 'resilient' })).not.toBeInTheDocument();
  });

  it('renders ending sound tip badge and phonetic breakdown on back face when flipped', () => {
    render(
      <FlashcardReviewCard
        card={mockCard}
        isFlipped={true}
        isSubmitting={false}
        onFlip={vi.fn()}
        onRate={vi.fn()}
        isAudioFirstMode={true}
      />
    );

    // On back face, word is revealed
    expect(screen.getByText('resilient')).toBeInTheDocument();
    expect(screen.getByText(/kiên cường/i)).toBeInTheDocument();

    // Ending sound tip badge is rendered
    const tipBadge = screen.getByTestId('ending-sound-tip-badge');
    expect(tipBadge).toBeInTheDocument();
    expect(tipBadge).toHaveTextContent(/Bật nhẹ âm \/t\/ ở cuối từ/i);

    // Phonetic word breakdown is rendered
    expect(screen.getByTestId('phonetic-word-breakdown')).toBeInTheDocument();
  });
});
