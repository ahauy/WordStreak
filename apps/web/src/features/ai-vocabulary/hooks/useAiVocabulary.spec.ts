import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAiVocabulary } from './useAiVocabulary';
import { aiVocabularyService } from '../services/aiVocabularyService';
import type { GenerateCardResponseDto } from '@wordstreak/shared-types';

vi.mock('../services/aiVocabularyService', () => ({
  aiVocabularyService: {
    generateCard: vi.fn(),
  },
}));

describe('useAiVocabulary Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSuccessResponse: GenerateCardResponseDto = {
    card: {
      word: 'ineffable',
      partOfSpeech: 'adjective',
      phonetic: '/ɪnˈef.ə.bəl/',
      meaningVi: 'không thể diễn tả bằng lời',
      meaningEn: 'too great to be expressed in words',
      exampleSentence: 'The beauty was ineffable.',
      exampleTranslation: 'Vẻ đẹp không thể diễn tả bằng lời.',
      collocations: ['ineffable joy'],
      mnemonic: 'In (không) + effable (nói được)',
      audioUrl: null,
    },
    isCached: false,
    source: 'GEMINI_FLASH',
    dailyQuotaRemaining: 29,
    dailyQuotaMax: 30,
  };

  it('should initialize with default states', () => {
    const { result } = renderHook(() => useAiVocabulary());
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.lastResult).toBe(null);
  });

  it('should return error when word is empty string', async () => {
    const { result } = renderHook(() => useAiVocabulary());

    let res: GenerateCardResponseDto | null = null;
    await act(async () => {
      res = await result.current.generateCard('   ');
    });

    expect(res).toBe(null);
    expect(result.current.error).toBe('Vui lòng nhập từ vựng trước khi tạo với AI');
    expect(aiVocabularyService.generateCard).not.toHaveBeenCalled();
  });

  it('should successfully fetch and return generated card data', async () => {
    vi.mocked(aiVocabularyService.generateCard).mockResolvedValue(mockSuccessResponse);

    const { result } = renderHook(() => useAiVocabulary());

    let res: GenerateCardResponseDto | null = null;
    await act(async () => {
      res = await result.current.generateCard('ineffable');
    });

    expect(res).toEqual(mockSuccessResponse);
    expect(result.current.lastResult).toEqual(mockSuccessResponse);
    expect(result.current.error).toBe(null);
    expect(result.current.isGenerating).toBe(false);
  });

  it('should handle 404 word not found gracefully', async () => {
    vi.mocked(aiVocabularyService.generateCard).mockRejectedValue({
      response: { status: 404, data: { message: 'Word not found' } },
    });

    const { result } = renderHook(() => useAiVocabulary());

    let res: GenerateCardResponseDto | null = null;
    await act(async () => {
      res = await result.current.generateCard('xyzfake123');
    });

    expect(res).toBe(null);
    expect(result.current.error).toBe('Word not found');
    expect(result.current.isGenerating).toBe(false);
  });

  it('should handle 429 quota exceeded error gracefully', async () => {
    vi.mocked(aiVocabularyService.generateCard).mockRejectedValue({
      response: {
        status: 429,
        data: { message: 'Bạn đã dùng hết 30 lượt tạo AI hôm nay.' },
      },
    });

    const { result } = renderHook(() => useAiVocabulary());

    let res: GenerateCardResponseDto | null = null;
    await act(async () => {
      res = await result.current.generateCard('ephemeral');
    });

    expect(res).toBe(null);
    expect(result.current.error).toBe('Bạn đã dùng hết 30 lượt tạo AI hôm nay.');
    expect(result.current.isGenerating).toBe(false);
  });
});
