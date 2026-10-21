import { Test, TestingModule } from '@nestjs/testing';
import { ToeicQuizGeneratorService } from './toeic-quiz-generator.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('ToeicQuizGeneratorService (US-LIB-07)', () => {
  let service: ToeicQuizGeneratorService;

  const mockOfficialCards = [
    {
      id: 'card_1',
      headword: 'accommodate',
      pos: 'verb',
      content: {
        word: 'accommodate',
        pos: 'verb',
        meaning_vi: 'đáp ứng, cung cấp chỗ ở',
        definition_en: 'to provide with something desired, needed, or suited',
        example_en: 'The hotel can accommodate up to 500 guests.',
        confusables: [
          { word: 'accumulate', note_vi: 'tích lũy' },
          { word: 'recommend', note_vi: 'khuyên' },
        ],
        word_family: ['accommodation', 'accommodating'],
        ipa_us: '/əˈkɑː.mə.deɪt/',
      },
    },
    {
      id: 'card_2',
      headword: 'beneficial',
      pos: 'adjective',
      content: {
        word: 'beneficial',
        pos: 'adjective',
        meaning_vi: 'có lợi, hữu ích',
        definition_en: 'producing good or helpful results or effects',
        example_en: 'Regular exercise is beneficial to overall health.',
        confusables: [{ word: 'beneficent', note_vi: 'từ tâm' }],
        word_family: ['benefit', 'beneficiary'],
        ipa_us: '/ˌben.əˈfɪʃ.əl/',
      },
    },
    {
      id: 'card_3',
      headword: 'negotiate',
      pos: 'verb',
      content: {
        word: 'negotiate',
        pos: 'verb',
        meaning_vi: 'đàm phán, thương lượng',
        example_en: 'The team will negotiate the final contract terms.',
        confusables: [],
        word_family: ['negotiation', 'negotiable'],
        ipa_us: '/nəˈɡoʊ.ʃi.eɪt/',
      },
    },
    {
      id: 'card_4',
      headword: 'facilitate',
      pos: 'verb',
      content: {
        word: 'facilitate',
        pos: 'verb',
        meaning_vi: 'tạo điều kiện thuận lợi',
        example_en: 'Modern tools facilitate remote communication.',
        confusables: [{ word: 'facility', note_vi: 'cơ sở vật chất' }],
        word_family: ['facilitation', 'facilitator'],
        ipa_us: '/fəˈsɪl.ə.teɪt/',
      },
    },
  ];

  const mockPrismaService = {
    officialDeck: {
      findFirst: jest.fn(),
    },
    officialCard: {
      findMany: jest.fn(),
    },
    deck: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToeicQuizGeneratorService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ToeicQuizGeneratorService>(ToeicQuizGeneratorService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateQuestions (TC-001 & TC-002)', () => {
    it('TC-001: should generate MINI_PART_5 questions with confusables prioritized as distractors', async () => {
      mockPrismaService.officialDeck.findFirst.mockResolvedValue({
        id: 'deck_tsl_1',
        title: 'Office Operations',
        cards: mockOfficialCards.map((c, i) => ({
          cardId: c.id,
          order: i,
          card: c,
        })),
      });

      const result = await service.generateQuestions({
        deckId: 'deck_tsl_1',
        type: 'MINI_PART_5',
        limit: 4,
      });

      expect(result).toHaveLength(4);
      const q1 = result.find((q) => q.cardId === 'card_1');
      expect(q1).toBeDefined();
      expect(q1?.type).toBe('MINI_PART_5');
      expect(q1?.sentence).toContain('______');
      expect(q1?.options).toHaveLength(4);

      const correctOpt = q1?.options?.find((o) => o.isCorrect);
      expect(correctOpt?.text).toBe('accommodate');

      // Verify confusable distractor is included
      const hasConfusable = q1?.options?.some((o) => o.text === 'accumulate');
      expect(hasConfusable).toBe(true);
    });

    it('TC-002: should generate WORD_FAMILY questions using morphological derivations', async () => {
      mockPrismaService.officialDeck.findFirst.mockResolvedValue({
        id: 'deck_tsl_1',
        title: 'Office Operations',
        cards: mockOfficialCards.map((c, i) => ({
          cardId: c.id,
          order: i,
          card: c,
        })),
      });

      const result = await service.generateQuestions({
        deckId: 'deck_tsl_1',
        type: 'WORD_FAMILY',
        limit: 1,
      });

      expect(result).toHaveLength(1);
      const q = result[0];
      expect(q.type).toBe('WORD_FAMILY');
      expect(q.options).toHaveLength(4);
      expect(q.options?.find((o) => o.isCorrect)?.text).toBe(q.targetWord);
    });

    it('should generate PARAPHRASE questions with workplace context', async () => {
      mockPrismaService.officialDeck.findFirst.mockResolvedValue({
        id: 'deck_tsl_1',
        cards: mockOfficialCards.map((c, i) => ({
          cardId: c.id,
          order: i,
          card: c,
        })),
      });

      const result = await service.generateQuestions({
        deckId: 'deck_tsl_1',
        type: 'PARAPHRASE',
        limit: 2,
      });

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('PARAPHRASE');
      expect(result[0].options).toHaveLength(4);
      expect(result[0].options?.find((o) => o.isCorrect)?.text).toBe(
        result[0].vietnameseMeaning,
      );
    });

    it('should throw BadRequestException if deck has no cards', async () => {
      mockPrismaService.officialDeck.findFirst.mockResolvedValue({
        id: 'deck_empty',
        cards: [],
      });

      await expect(
        service.generateQuestions({ deckId: 'deck_empty' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
