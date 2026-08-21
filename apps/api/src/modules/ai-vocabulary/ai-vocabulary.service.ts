import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { GenerateCardDto } from './dto/generate-card.dto';
import { DictionaryCacheRepository } from './repositories/dictionary-cache.repository';
import { GeminiProvider } from './providers/gemini.provider';
import { FreeDictionaryProvider } from './providers/free-dictionary.provider';
import { AiQuotaService } from './services/ai-quota.service';
import {
  GenerateCardResponseDto,
  AiGeneratedCardData,
  AiCardSource,
} from '@wordstreak/shared-types';

@Injectable()
export class AiVocabularyService {
  private readonly logger = new Logger(AiVocabularyService.name);

  constructor(
    private readonly cacheRepository: DictionaryCacheRepository,
    private readonly geminiProvider: GeminiProvider,
    private readonly freeDictionaryProvider: FreeDictionaryProvider,
    private readonly quotaService: AiQuotaService,
  ) {}

  async generateCard(
    dto: GenerateCardDto,
    userId: string,
  ): Promise<GenerateCardResponseDto> {
    const rawWord = dto?.word?.trim();
    if (!rawWord) {
      throw new BadRequestException('Vui lòng nhập từ vựng hợp lệ');
    }

    const normalizedWord = rawWord.toLowerCase();

    // 1. Check Global Dictionary Cache (Zero quota cost, < 50ms)
    const cached = await this.cacheRepository.findByWord(normalizedWord);
    if (cached) {
      this.logger.debug(`Cache HIT for word: "${normalizedWord}"`);
      // Increment hit count in background
      this.cacheRepository.incrementHitCount(cached.id).catch(() => {});

      const { remaining, max } = this.quotaService.getRemainingQuota(userId);

      return {
        card: {
          word: cached.word,
          partOfSpeech: cached.partOfSpeech || 'word',
          phonetic: cached.phonetic || '',
          meaningVi: cached.meaningVi,
          meaningEn: cached.meaningEn || '',
          exampleSentence: cached.exampleSentence || '',
          exampleTranslation: cached.exampleTranslation || '',
          collocations: cached.collocations || [],
          mnemonic: cached.mnemonic || '',
          audioUrl: cached.audioUrl || null,
        },
        isCached: true,
        source: cached.source,
        dailyQuotaRemaining: remaining,
        dailyQuotaMax: max,
      };
    }

    this.logger.debug(`Cache MISS for word: "${normalizedWord}"`);

    // 2. Check Daily Quota & Burst Limit (throws 429 if exceeded)
    const { remaining, max } = this.quotaService.checkAndConsume(userId);

    // 3. Multi-tier generation: Primary (Gemini Flash) -> Secondary (Free Dictionary API)
    let cardData: AiGeneratedCardData | null = null;
    let source: AiCardSource = 'GEMINI_FLASH';

    try {
      cardData = await this.geminiProvider.generate(rawWord);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Gemini generation exception: ${msg}`);
    }

    if (!cardData) {
      this.logger.log(`Falling back to Free Dictionary API for "${rawWord}"`);
      try {
        cardData = await this.freeDictionaryProvider.lookup(rawWord);
        if (cardData) {
          source = 'FREE_DICTIONARY';
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Free Dictionary API exception: ${msg}`);
      }
    }

    if (!cardData) {
      throw new NotFoundException({
        statusCode: 404,
        message:
          'Không tìm thấy dữ liệu từ điển cho từ này. Bạn có thể tự nhập thông tin thủ công.',
        error: 'AI_WORD_NOT_FOUND',
      });
    }

    // 4. Persist to Global Dictionary Cache for future queries
    try {
      await this.cacheRepository.saveToCache({
        ...cardData,
        word: normalizedWord,
        source,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to cache word "${normalizedWord}": ${msg}`);
    }

    return {
      card: cardData,
      isCached: false,
      source,
      dailyQuotaRemaining: remaining,
      dailyQuotaMax: max,
    };
  }
}
