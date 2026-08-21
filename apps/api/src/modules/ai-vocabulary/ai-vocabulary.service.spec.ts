import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AiVocabularyService } from './ai-vocabulary.service';
import { DictionaryCacheRepository } from './repositories/dictionary-cache.repository';
import { GeminiProvider } from './providers/gemini.provider';
import { FreeDictionaryProvider } from './providers/free-dictionary.provider';
import { AiQuotaService } from './services/ai-quota.service';
import {
  AiGeneratedCardData,
  GlobalDictionaryCacheRecord,
} from '@wordstreak/shared-types';

describe('AiVocabularyService', () => {
  let service: AiVocabularyService;
  let cacheRepository: {
    findByWord: jest.Mock;
    incrementHitCount: jest.Mock;
    saveToCache: jest.Mock;
  };
  let geminiProvider: {
    generate: jest.Mock;
  };
  let freeDictionaryProvider: {
    lookup: jest.Mock;
  };
  let quotaService: {
    getRemainingQuota: jest.Mock;
    checkAndConsume: jest.Mock;
    resetForTesting: jest.Mock;
  };

  const mockGeneratedCard: AiGeneratedCardData = {
    word: 'ineffable',
    partOfSpeech: 'adjective',
    phonetic: '/ɪnˈef.ə.bəl/',
    meaningVi: 'không thể tả xiết, khôn xiết',
    meaningEn: 'too great or beautiful to be described in words',
    exampleSentence: 'The beauty of the sunset was ineffable.',
    exampleTranslation: 'Vẻ đẹp của hoàng hôn thật không thể tả xiết.',
    collocations: ['ineffable joy', 'ineffable beauty'],
    mnemonic: 'In (không) + effable (có thể nói được)',
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
    };

    geminiProvider = {
      generate: jest.fn(),
    };

    freeDictionaryProvider = {
      lookup: jest.fn(),
    };

    quotaService = {
      getRemainingQuota: jest.fn().mockReturnValue({ remaining: 25, max: 30 }),
      checkAndConsume: jest.fn().mockReturnValue({ remaining: 24, max: 30 }),
      resetForTesting: jest.fn(),
    };

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
  it('TC-002: should return cached data <50ms without quota cost on cache hit', async () => {
    cacheRepository.findByWord.mockResolvedValue(mockCachedRecord);

    const result = await service.generateCard(
      { word: 'serendipity' },
      'user-1',
    );

    expect(cacheRepository.findByWord).toHaveBeenCalledWith('serendipity');
    expect(quotaService.checkAndConsume).not.toHaveBeenCalled();
    expect(geminiProvider.generate).not.toHaveBeenCalled();
    expect(cacheRepository.incrementHitCount).toHaveBeenCalledWith('cache-123');

    expect(result.isCached).toBe(true);
    expect(result.source).toBe('GEMINI_FLASH');
    expect(result.card.word).toBe('serendipity');
    expect(result.dailyQuotaRemaining).toBe(25);
  });

  // TC-003
  it('TC-003: should fallback to Free Dictionary API when Gemini fails', async () => {
    cacheRepository.findByWord.mockResolvedValue(null);
    geminiProvider.generate.mockResolvedValue(null);
    freeDictionaryProvider.lookup.mockResolvedValue({
      ...mockGeneratedCard,
      source: 'FREE_DICTIONARY',
    });
    cacheRepository.saveToCache.mockResolvedValue({
      ...mockCachedRecord,
      source: 'FREE_DICTIONARY',
    });

    const result = await service.generateCard({ word: 'ineffable' }, 'user-1');

    expect(geminiProvider.generate).toHaveBeenCalledWith('ineffable');
    expect(freeDictionaryProvider.lookup).toHaveBeenCalledWith('ineffable');
    expect(result.source).toBe('FREE_DICTIONARY');
  });

  // TC-004
  it('TC-004: should throw 404 NotFoundException when word not found in any provider', async () => {
    cacheRepository.findByWord.mockResolvedValue(null);
    geminiProvider.generate.mockResolvedValue(null);
    freeDictionaryProvider.lookup.mockResolvedValue(null);

    await expect(
      service.generateCard({ word: 'unknownwordxyz' }, 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });

  // TC-005
  it('TC-005: should sanitize and trim word before lookup', async () => {
    cacheRepository.findByWord.mockResolvedValue(mockCachedRecord);

    await service.generateCard({ word: '  SERENDIPITY  ' }, 'user-1');

    expect(cacheRepository.findByWord).toHaveBeenCalledWith('serendipity');
  });
});
