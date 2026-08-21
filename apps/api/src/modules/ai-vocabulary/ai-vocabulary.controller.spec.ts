import { Test, TestingModule } from '@nestjs/testing';
import { AiVocabularyController } from './ai-vocabulary.controller';
import { AiVocabularyService } from './ai-vocabulary.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GenerateCardResponseDto, JwtPayload } from '@wordstreak/shared-types';

describe('AiVocabularyController', () => {
  let controller: AiVocabularyController;
  let service: {
    generateCard: jest.Mock;
  };

  const mockResponse: GenerateCardResponseDto = {
    card: {
      word: 'eloquent',
      partOfSpeech: 'adjective',
      phonetic: '/ˈel.ə.kwənt/',
      meaningVi: 'có tài hùng biện, lưu loát',
      meaningEn: 'fluent or persuasive in speaking or writing',
      exampleSentence: 'An eloquent speech moved the audience to tears.',
      exampleTranslation:
        'Một bài phát biểu hùng biện đã khiến khán giả xúc động rơi nước mắt.',
      collocations: ['eloquent speech', 'eloquent speaker'],
      mnemonic: 'E (ra ngoài) + loqu (nói) -> nói lưu loát truyền cảm hứng.',
      audioUrl: null,
    },
    isCached: false,
    source: 'GEMINI_FLASH',
    dailyQuotaRemaining: 29,
    dailyQuotaMax: 30,
  };

  beforeEach(async () => {
    service = {
      generateCard: jest.fn().mockResolvedValue(mockResponse),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiVocabularyController],
      providers: [{ provide: AiVocabularyService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AiVocabularyController>(AiVocabularyController);
  });

  // TC-010
  it('TC-010: should call service.generateCard with user ID and return GenerateCardResponseDto', async () => {
    const user: JwtPayload = {
      sub: 'user-123',
      email: 'test@example.com',
      sessionId: 'sess-1',
    };
    const dto = { word: 'eloquent' };

    const result = await controller.generateCard(user, dto);

    expect(service.generateCard).toHaveBeenCalledWith(dto, 'user-123');
    expect(result).toEqual(mockResponse);
    expect(result.card.word).toBe('eloquent');
    expect(result.dailyQuotaRemaining).toBe(29);
  });
});
