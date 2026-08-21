import { apiClient } from '../../../common/api/axios';
import type {
  GenerateCardRequestDto,
  GenerateCardResponseDto,
} from '@wordstreak/shared-types';

export const aiVocabularyService = {
  async generateCard(dto: GenerateCardRequestDto): Promise<GenerateCardResponseDto> {
    const response = await apiClient.post<GenerateCardResponseDto>(
      '/ai/generate-card',
      dto,
    );
    return response.data;
  },
};
