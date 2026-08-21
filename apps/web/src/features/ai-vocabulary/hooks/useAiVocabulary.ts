import { useState, useCallback } from 'react';
import { aiVocabularyService } from '../services/aiVocabularyService';
import type { GenerateCardResponseDto } from '@wordstreak/shared-types';

export interface UseAiVocabularyReturn {
  isGenerating: boolean;
  error: string | null;
  lastResult: GenerateCardResponseDto | null;
  generateCard: (word: string) => Promise<GenerateCardResponseDto | null>;
  clearError: () => void;
}

export function useAiVocabulary(): UseAiVocabularyReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<GenerateCardResponseDto | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const generateCard = useCallback(async (word: string): Promise<GenerateCardResponseDto | null> => {
    const trimmed = word.trim();
    if (!trimmed) {
      setError('Vui lòng nhập từ vựng trước khi tạo với AI');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await aiVocabularyService.generateCard({ word: trimmed });
      setLastResult(result);
      return result;
    } catch (err: any) {
      const errorResponse = err.response?.data;
      const message =
        errorResponse?.message ||
        (err.response?.status === 404
          ? 'Không tìm thấy thông tin từ vựng cho từ này. Bạn có thể nhập thông tin thủ công.'
          : err.response?.status === 429
          ? 'Bạn đã đạt giới hạn tạo AI hôm nay. Các từ trong bộ nhớ đệm vẫn dùng được.'
          : 'Không thể kết nối dịch vụ AI. Vui lòng thử lại sau.');
      
      setError(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    error,
    lastResult,
    generateCard,
    clearError,
  };
}
