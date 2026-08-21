import { Test, TestingModule } from '@nestjs/testing';
import { AiVocabularyService } from './ai-vocabulary.service';
import { DictionaryCacheRepository } from './repositories/dictionary-cache.repository';
import { GeminiProvider } from './providers/gemini.provider';
import { FreeDictionaryProvider } from './providers/free-dictionary.provider';
import { AiQuotaService } from './services/ai-quota.service';
import { NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { AiGeneratedCardData, GlobalDictionaryCacheRecord } from '@wordstreak/shared-types';

describe('AiVocabularyService', () => {
  let service: AiVocabularyService;
  let cacheRepository: jest.Mocked<DictionaryCacheRepository>;
  let geminiProvider: jest.Mocked<GeminiProvider>;
  let freeDictionaryProvider: jest.Mocked<FreeDictionaryProvider>;
  let quotaService: jest.Mocked<AiQuotaService>;

  const mockGeneratedCard: AiGeneratedCardData = {
    word: 'ineffable',
    partOfSpeech: 'adjective',
    phonetic: '/ɪnˈef.ə.bəl/',
    meaningVi: 'không thể diễn tả bằng lời',
    meaningEn: 'too great or beautiful to be expressed in words',
    exampleSentence: 'The beauty of the sunrise was ineffable.',
    exampleTranslation: 'Vẻ đẹp của bình minh thật không thể diễn tả bằng lời.',
    collocations: ['ineffable beauty', 'ineffable joy'],
    mnemonic: 'In (không) + effable (có thể nói) -> không thể diễn tả bằng lời.',
    audioUrl: null,
  };

  const mockCachedRecord: GlobalDictionaryCacheRecord = {
    id: 'cache-123',
    word: 'serendipity',
    partOfSpeech: 'noun',
    phonetic: '/ˌser.ənˈdɪp.ə.ti/',
    meaningVi: 'sự tình cờ may mắn',
    meaningEn: 'the occurrence of events by chance in a happy way',
    exampleSentence: 'Finding this book was pure serendipity.',
    exampleTranslation: 'Tìm thấy cuốn sách này quả là một sự may mắn tình cờ.',
    collocations: ['pure serendipity', 'by serendipity'],
    mnemonic: 'Serendip (vua Ba Tư may mắn) + ity',
    audioUrl: 'https://example.com/audio.mp3',
    source: 'GEMINI_FLASH',
    hitCount: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    cacheRepository = {
      findByWord: jest.fn(),
      incrementHitCount: jest.fn().mockResolvedValue(undefined),
      saveToCache: jest.fn(),
    } as any;

    geminiProvider = {
      generate: jest.fn(),
    } as any;

    freeDictionaryProvider = {
      lookup: jest.fn(),
    } as any;

    quotaService = {
      getRemainingQuota: jest.fn().mockReturnValue({ remaining: 25, max: 30 }),
      checkAndConsume: jest.fn().mockReturnValue({ remaining: 24, max: 30 }),
      resetForTesting: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiVocabularyService,
        { provide: DictionaryCacheRepository, useValue: cacheRepository },
        { provide: GeminiProvider, useValue: geminiProvider },
        { provide: FreeDictionaryProvider, useValue: freeDictionaryProvider },
        { provide: AiQuotaService, useValue: quotaService },
      ],
    }).compile();

    service = module.get<AiVocabularyService>(AiVocabularyService);
  });

  // TC-001
  it('TC-001: should query Gemini Flash, save to cache, decrement quota on cache miss', async () => {
    cacheRepository.findByWord.mockResolvedValue(null);
    geminiProvider.generate.mockResolvedValue(mockGeneratedCard);
    cacheRepository.saveToCache.mockResolvedValue({
      ...mockCachedRecord,
      word: 'ineffable',
      source: 'GEMINI_FLASH',
    });

    const result = await service.generateCard({ word: 'ineffable' }, 'user-1');

    expect(cacheRepository.findByWord).toHaveBeenCalledWith('ineffable');
    expect(quotaService.checkAndConsume).toHaveBeenCalledWith('user-1');
    expect(geminiProvider.generate).toHaveBeenCalledWith('ineffable');
    expect(cacheRepository.saveToCache).toHaveBeenCalledWith({
      ...mockGeneratedCard,
      word: 'ineffable',
      source: 'GEMINI_FLASH',
    });
    expect(result.isCached).toBe(false);
    expect(result.source).toBe('GEMINI_FLASH');
    expect(result.card.word).toBe('ineffable');
    expect(result.dailyQuotaRemaining).toBe(24);
  });

  // TC-002
  it('TC-002: should return cached entry immediately without consuming quota on cache hit', async () => {
    cacheRepository.findByWord.mockResolvedValue(mockCachedRecord);

    const result = await service.generateCard({ word: '  Serendipity  ' }, 'user-1');

    expect(cacheRepository.findByWord).toHaveBeenCalledWith('serendipity');
    expect(cacheRepository.incrementHitCount).toHaveBeenCalledWith('cache-123');
    expect(quotaService.checkAndConsume).not.toHaveBeenCalled();
    expect(geminiProvider.generate).not.toHaveBeenCalled();
    expect(result.isCached).toBe(true);
    expect(result.card.word).toBe('serendipity');
    expect(result.card.meaningVi).toBe('sự tình cờ may mắn');
    expect(result.dailyQuotaRemaining).toBe(25);
  });

  // TC-003
  it('TC-003: should fallback to Free Dictionary API when Gemini throws or returns null', async () => {
    cacheRepository.findByWord.mockResolvedValue(null);
    geminiProvider.generate.mockRejectedValue(new Error('Gemini API timeout'));
    freeDictionaryProvider.lookup.mockResolvedValue({
      ...mockGeneratedCard,
      word: 'resilience',
      source: 'FREE_DICTIONARY' as any,
    });
    cacheRepository.saveToCache.mockResolvedValue({
      ...mockCachedRecord,
      word: 'resilience',
      source: 'FREE_DICTIONARY',
    });

    const result = await service.generateCard({ word: 'resilience' }, 'user-1');

    expect(geminiProvider.generate).toHaveBeenCalledWith('resilience');
    expect(freeDictionaryProvider.lookup).toHaveBeenCalledWith('resilience');
    expect(cacheRepository.saveToCache).toHaveBeenCalledWith(
      expect.objectContaining({
        word: 'resilience',
        source: 'FREE_DICTIONARY',
      }),
    );
    expect(result.isCached).toBe(false);
    expect(result.source).toBe('FREE_DICTIONARY');
  });

  // TC-004
  it('TC-004: should throw NotFoundException when both Gemini and Free Dictionary fail', async () => {
    cacheRepository.findByWord.mockResolvedValue(null);
    geminiProvider.generate.mockResolvedValue(null);
    freeDictionaryProvider.lookup.mockResolvedValue(null);

    await expect(
      service.generateCard({ word: 'xyzinvalidword99' }, 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });

  // TC-005
  it('TC-005: should throw 429 when quotaService throws daily limit exceeded', async () => {
    cacheRepository.findByWord.mockResolvedValue(null);
    quotaService.checkAndConsume.mockImplementation(() => {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Daily quota exceeded',
          error: 'AI_DAILY_QUOTA_EXCEEDED',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    });

    await expect(
      service.generateCard({ word: 'ephemeral' }, 'user-1'),
    ).rejects.toThrow(HttpException);

    expect(geminiProvider.generate).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException for empty word', async () => {
    await expect(
      service.generateCard({ word: '   ' }, 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });
});
