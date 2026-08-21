import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddCardModal } from './AddCardModal';
import { aiVocabularyService } from '../../ai-vocabulary/services/aiVocabularyService';

vi.mock('../../ai-vocabulary/services/aiVocabularyService', () => ({
  aiVocabularyService: {
    generateCard: vi.fn(),
  },
}));

describe('AddCardModal Component with AI Auto-Fill (TC-020, TC-021)', () => {
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAiResponse = {
    card: {
      word: 'resilient',
      partOfSpeech: 'adjective',
      phonetic: '/rɪˈzɪl.jənt/',
      meaningVi: 'kiên cường, hồi phục nhanh',
      meaningEn: 'able to recover quickly',
      exampleSentence: 'She is a resilient leader.',
      exampleTranslation: 'Cô ấy là một nhà lãnh đạo kiên cường.',
      collocations: ['highly resilient', 'resilient economy'],
      mnemonic: 'Re (lại) + silent (im lặng) -> kiên cường chịu đựng',
      audioUrl: 'https://example.com/audio.mp3',
    },
    isCached: false,
    source: 'GEMINI_FLASH' as const,
    dailyQuotaRemaining: 28,
    dailyQuotaMax: 30,
  };

  // TC-020
  it('TC-020: should trigger AI auto-fill and populate form inputs when Sparkle button is clicked', async () => {
    vi.mocked(aiVocabularyService.generateCard).mockResolvedValue(mockAiResponse);

    render(
      <AddCardModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        deckTitle="English Core"
      />,
    );

    const wordInput = screen.getByPlaceholderText(/serendipity, resilient/i);
    fireEvent.change(wordInput, { target: { value: 'resilient' } });

    const aiButton = screen.getByTitle(/Tự động điền nghĩa, IPA, ví dụ/i);
    expect(aiButton).toBeDefined();

    fireEvent.click(aiButton);

    await waitFor(() => {
      expect(aiVocabularyService.generateCard).toHaveBeenCalledWith({
        word: 'resilient',
      });
    });

    await waitFor(() => {
      const meaningInput = screen.getByPlaceholderText(/Sự tình cờ may mắn/i) as HTMLInputElement;
      expect(meaningInput.value).toBe('kiên cường, hồi phục nhanh');

      const phoneticInput = screen.getByPlaceholderText(/\/ˌser.ənˈdɪp.ə.ti\//i) as HTMLInputElement;
      expect(phoneticInput.value).toBe('/rɪˈzɪl.jənt/');
    });
  });

  // TC-021
  it('TC-021: should display error message and preserve word input when AI lookup fails', async () => {
    vi.mocked(aiVocabularyService.generateCard).mockRejectedValue({
      response: {
        status: 404,
        data: { message: 'Không tìm thấy dữ liệu từ điển cho từ này.' },
      },
    });

    render(
      <AddCardModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        deckTitle="English Core"
      />,
    );

    const wordInput = screen.getByPlaceholderText(/serendipity, resilient/i) as HTMLInputElement;
    fireEvent.change(wordInput, { target: { value: 'unknownfake999' } });

    const aiButton = screen.getByTitle(/Tự động điền nghĩa, IPA, ví dụ/i);
    fireEvent.click(aiButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Không tìm thấy dữ liệu từ điển cho từ này/i),
      ).toBeDefined();
    });

    // Word input is preserved
    expect(wordInput.value).toBe('unknownfake999');
  });
});
