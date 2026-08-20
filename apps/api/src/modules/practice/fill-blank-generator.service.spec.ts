import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { FillBlankGeneratorService } from './fill-blank-generator.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FillBlankGeneratorService', () => {
  let service: FillBlankGeneratorService;

  const mockPrismaService = {
    deck: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FillBlankGeneratorService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FillBlankGeneratorService>(FillBlankGeneratorService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateQuestions', () => {
    const userId = 'user-1';
    const deckId = 'deck-1';

    it('should throw NotFoundException when deck is not found or archived', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue(null);

      await expect(
        service.generateQuestions(userId, { deckId }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user cannot access private deck', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: deckId,
        userId: 'other-user',
        isPublic: false,
        isArchived: false,
        cards: [],
      });

      await expect(
        service.generateQuestions(userId, { deckId }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when deck has no cards', async () => {
      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: deckId,
        userId,
        isPublic: false,
        isArchived: false,
        cards: [],
      });

      await expect(
        service.generateQuestions(userId, { deckId }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should generate questions masking exact base word in sentence (TC-001)', async () => {
      const card = {
        id: 'card-1',
        word: 'discovery',
        meaning: 'sự khám phá, phát hiện',
        phonetic: '/dɪˈskʌv.ər.i/',
        audioUrl: 'https://cdn.example.com/discovery.mp3',
        exampleSentence:
          'The scientist made an important discovery in genetics.',
      };

      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: deckId,
        userId,
        isPublic: false,
        isArchived: false,
        cards: [card],
      });

      const questions = await service.generateQuestions(userId, {
        deckId,
        limit: 5,
      });

      expect(questions).toHaveLength(1);
      expect(questions[0].targetWord).toBe('discovery');
      expect(questions[0].sentenceWithBlank).toBe(
        'The scientist made an important [ _____ ] in genetics.',
      );
      expect(questions[0].sentencePrefix).toBe(
        'The scientist made an important ',
      );
      expect(questions[0].sentenceSuffix).toBe(' in genetics.');
      expect(questions[0].wordLength).toBe(9);
      expect(questions[0].scrambledLetters).toHaveLength(9);
    });

    it('should generate questions masking inflected word in sentence (TC-002)', async () => {
      const card = {
        id: 'card-2',
        word: 'acquire',
        meaning: 'thu được, đạt được',
        phonetic: '/əˈkwaɪər/',
        audioUrl: null,
        exampleSentence: 'The company acquired three new startups last year.',
      };

      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: deckId,
        userId,
        isPublic: false,
        isArchived: false,
        cards: [card],
      });

      const questions = await service.generateQuestions(userId, { deckId });

      expect(questions).toHaveLength(1);
      expect(questions[0].targetWord).toBe('acquire');
      expect(questions[0].targetInflection).toBe('acquired');
      expect(questions[0].sentenceWithBlank).toBe(
        'The company [ _____ ] three new startups last year.',
      );
      expect(questions[0].sentencePrefix).toBe('The company ');
      expect(questions[0].sentenceSuffix).toBe(
        ' three new startups last year.',
      );
    });

    it('should fallback gracefully when exampleSentence is null or missing word (TC-003)', async () => {
      const card = {
        id: 'card-3',
        word: 'ephemeral',
        meaning: 'phù du, ngắn ngủi',
        phonetic: '/ɪˈfem.ər.əl/',
        audioUrl: null,
        exampleSentence: null,
      };

      mockPrismaService.deck.findUnique.mockResolvedValue({
        id: deckId,
        userId,
        isPublic: false,
        isArchived: false,
        cards: [card],
      });

      const questions = await service.generateQuestions(userId, { deckId });

      expect(questions).toHaveLength(1);
      expect(questions[0].targetWord).toBe('ephemeral');
      expect(questions[0].sentenceWithBlank).toContain('phù du, ngắn ngủi');
      expect(questions[0].sentenceWithBlank).toContain('[ _____ ]');
      expect(questions[0].wordLength).toBe(9);
    });

    it('should generate scrambled anagram letters containing all original characters (TC-004)', () => {
      const letters = service.generateAnagram('apple');
      expect(letters).toHaveLength(5);
      expect([...letters].sort()).toEqual(['a', 'e', 'l', 'p', 'p']);
    });
  });
});
