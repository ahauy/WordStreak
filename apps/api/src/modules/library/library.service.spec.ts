/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LibraryService } from './library.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LibraryService', () => {
  let service: LibraryService;
  let prisma: {
    officialCard: { findUnique: jest.Mock };
    officialDeck: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
    };
    officialDeckCard: { findMany: jest.Mock };
    userOfficialCardProgress: {
      findMany: jest.Mock;
      upsert: jest.Mock;
      count: jest.Mock;
    };
    userDeckEnrollment: { upsert: jest.Mock; findMany: jest.Mock };
    deck: { findFirst: jest.Mock; create: jest.Mock };
    card: { create: jest.Mock };
    user: { findUnique: jest.Mock };
    $transaction: jest.Mock;
  };

  const mockUserId = 'user-123';
  const mockOfficialCardId = 'off-card-456';

  beforeEach(async () => {
    prisma = {
      officialCard: { findUnique: jest.fn() },
      officialDeck: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
      officialDeckCard: { findMany: jest.fn() },
      userOfficialCardProgress: {
        findMany: jest.fn(),
        upsert: jest.fn(),
        count: jest.fn(),
      },
      userDeckEnrollment: { upsert: jest.fn(), findMany: jest.fn() },
      deck: { findFirst: jest.fn(), create: jest.fn() },
      card: { create: jest.fn() },
      user: { findUnique: jest.fn() },
      $transaction: jest.fn((ops) => Promise.all(ops)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LibraryService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<LibraryService>(LibraryService);
  });

  describe('forkCard (TC-ODA-005)', () => {
    it('throws NotFoundException if official card does not exist', async () => {
      prisma.officialCard.findUnique.mockResolvedValue(null);

      await expect(
        service.forkCard(mockUserId, 'non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException if specified target deck is not found or not owned by user', async () => {
      prisma.officialCard.findUnique.mockResolvedValue({
        id: mockOfficialCardId,
        headword: 'negotiate',
        content: { meaning_vi: 'đàm phán' },
      });
      prisma.deck.findFirst.mockResolvedValue(null);

      await expect(
        service.forkCard(mockUserId, mockOfficialCardId, {
          targetDeckId: 'foreign-deck',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('successfully forks an official card into specified target deck', async () => {
      prisma.officialCard.findUnique.mockResolvedValue({
        id: mockOfficialCardId,
        headword: 'negotiate',
        content: {
          meaning_vi: 'đàm phán',
          ipa_us: '/nəˈɡoʊ.ʃi.eɪt/',
          example_en: 'We need to negotiate the contract terms.',
          collocations: ['negotiate terms', 'negotiate successfully'],
          tip_vi: 'Trọng âm rơi vào âm tiết thứ 2',
        },
      });
      prisma.deck.findFirst.mockResolvedValue({
        id: 'target-deck-1',
        userId: mockUserId,
        title: 'Business Deck',
      });
      prisma.card.create.mockResolvedValue({
        id: 'new-card-1',
        deckId: 'target-deck-1',
        word: 'negotiate',
        meaning: 'đàm phán',
      });

      const result = await service.forkCard(mockUserId, mockOfficialCardId, {
        targetDeckId: 'target-deck-1',
      });

      expect(prisma.card.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            deckId: 'target-deck-1',
            word: 'negotiate',
            meaning: 'đàm phán',
            phonetic: '/nəˈɡoʊ.ʃi.eɪt/',
            exampleSentence: 'We need to negotiate the contract terms.',
            collocations: 'negotiate terms, negotiate successfully',
            mnemonic: 'Trọng âm rơi vào âm tiết thứ 2',
          }),
        }),
      );
      expect(result.cardId).toBe('new-card-1');
      expect(result.deckId).toBe('target-deck-1');
      expect(result.status).toBe('NEW');
    });

    it('creates a default deck when user has no existing decks and no targetDeckId provided', async () => {
      prisma.officialCard.findUnique.mockResolvedValue({
        id: mockOfficialCardId,
        headword: 'collaborate',
        content: { meaning_vi: 'hợp tác' },
      });
      prisma.deck.findFirst.mockResolvedValue(null);
      prisma.deck.create.mockResolvedValue({
        id: 'auto-deck-1',
        title: 'My Library Cards',
      });
      prisma.card.create.mockResolvedValue({
        id: 'new-card-2',
        deckId: 'auto-deck-1',
        word: 'collaborate',
        meaning: 'hợp tác',
      });

      const result = await service.forkCard(mockUserId, mockOfficialCardId);

      expect(prisma.deck.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUserId,
            title: 'My Library Cards',
          }),
        }),
      );
      expect(result.deckId).toBe('auto-deck-1');
      expect(result.word).toBe('collaborate');
    });
  });

  describe('getDecks (TC-LIB-03-001 & TC-LIB-03-002)', () => {
    it('returns paginated decks with enrollment and mastery computed', async () => {
      prisma.officialDeck.count.mockResolvedValue(1);
      prisma.officialDeck.findMany.mockResolvedValue([
        {
          id: 'deck-1',
          slug: 'tsl-1a-office',
          title: 'Office Operations',
          titleVi: 'Nghiệp vụ văn phòng',
          description: 'Top words in office context',
          pathCode: 'TOEIC',
          level: 'T1',
          order: 1,
          listCode: 'TSL',
          cardCount: 25,
          enrollments: [{ id: 'enr-1' }],
        },
      ]);
      prisma.userDeckEnrollment.findMany.mockResolvedValue([
        { deckId: 'deck-1' },
      ]);
      prisma.officialDeckCard.findMany.mockResolvedValue([
        { deckId: 'deck-1', cardId: 'card-1' },
      ]);
      prisma.userOfficialCardProgress.findMany.mockResolvedValue([
        { cardId: 'card-1' },
      ]);

      const result = await service.getDecks(mockUserId, {
        pathCode: 'TOEIC',
        level: 'T1',
        page: 1,
        limit: 10,
      });

      expect(prisma.officialDeck.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { pathCode: 'TOEIC', level: 'T1' },
          skip: 0,
          take: 10,
        }),
      );
      expect(result.total).toBe(1);
      expect(result.decks[0].isEnrolled).toBe(true);
      expect(result.decks[0].masteredCount).toBe(1);
    });
  });

  describe('getDeckBySlug (TC-LIB-03-003)', () => {
    it('throws NotFoundException when slug does not exist', async () => {
      prisma.officialDeck.findUnique.mockResolvedValue(null);

      await expect(
        service.getDeckBySlug(mockUserId, 'unknown-slug'),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns deck details with cards and user progress', async () => {
      prisma.officialDeck.findUnique.mockResolvedValue({
        id: 'deck-1',
        slug: 'tsl-1a-office',
        title: 'Office Operations',
        titleVi: 'Nghiệp vụ văn phòng',
        description: 'Office words',
        pathCode: 'TOEIC',
        level: 'T1',
        order: 1,
        listCode: 'TSL',
        cardCount: 25,
        enrollments: [{ id: 'enr-1' }],
        cards: [
          {
            cardId: 'card-1',
            order: 1,
            card: {
              headword: 'agenda',
              pos: 'n',
              content: {
                meaning_vi: 'chương trình nghị sự',
                ipa_us: '/əˈdʒen.də/',
                example_en: 'The next item on the agenda is budget.',
              },
            },
          },
        ],
      });
      prisma.userOfficialCardProgress.findMany.mockResolvedValue([
        { cardId: 'card-1', status: 'MASTERED' },
      ]);

      const result = await service.getDeckBySlug(mockUserId, 'tsl-1a-office');

      expect(result.deck.slug).toBe('tsl-1a-office');
      expect(result.isEnrolled).toBe(true);
      expect(result.masteredCount).toBe(1);
      expect(result.cards.length).toBe(1);
      expect(result.cards[0].headword).toBe('agenda');
      expect(result.cards[0].userStatus).toBe('MASTERED');
    });
  });

  describe('enrollDeck (TC-LIB-03-004)', () => {
    it('throws NotFoundException if deck does not exist', async () => {
      prisma.officialDeck.findUnique.mockResolvedValue(null);

      await expect(
        service.enrollDeck(mockUserId, 'non-existent-deck'),
      ).rejects.toThrow(NotFoundException);
    });

    it('successfully enrolls user in official deck', async () => {
      prisma.officialDeck.findUnique.mockResolvedValue({
        id: 'deck-1',
        title: 'Office Operations',
      });
      const mockStartedAt = new Date();
      prisma.userDeckEnrollment.upsert.mockResolvedValue({
        id: 'enr-1',
        userId: mockUserId,
        deckId: 'deck-1',
        startedAt: mockStartedAt,
      });

      const result = await service.enrollDeck(mockUserId, 'deck-1');

      expect(result.success).toBe(true);
      expect(result.deckId).toBe('deck-1');
      expect(result.enrolledAt).toEqual(mockStartedAt);
    });
  });

  describe('triageDeckCards (TC-LIB-05-001)', () => {
    const mockDeckId = 'deck-123';

    it('throws NotFoundException if deck does not exist', async () => {
      prisma.officialDeck.findUnique.mockResolvedValue(null);

      await expect(
        service.triageDeckCards(mockUserId, 'invalid-deck', {
          items: [{ cardId: 'c1', isKnown: true }],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('triages cards, marks known as KNOWN_SKIPPED and unknown as NEW', async () => {
      prisma.officialDeck.findUnique.mockResolvedValue({
        id: mockDeckId,
        cards: [{ cardId: 'c1' }, { cardId: 'c2' }],
      });
      prisma.userDeckEnrollment.upsert.mockResolvedValue({
        id: 'enr-1',
        userId: mockUserId,
        deckId: mockDeckId,
      });
      prisma.userOfficialCardProgress.upsert.mockResolvedValue({});

      const result = await service.triageDeckCards(mockUserId, mockDeckId, {
        items: [
          { cardId: 'c1', isKnown: true },
          { cardId: 'c2', isKnown: false },
          { cardId: 'c-invalid', isKnown: true }, // Should be ignored as not in deck
        ],
      });

      expect(result.success).toBe(true);
      expect(result.deckId).toBe(mockDeckId);
      expect(result.knownCount).toBe(1);
      expect(result.unknownCount).toBe(1);
      expect(result.totalTriaged).toBe(2);

      expect(prisma.userDeckEnrollment.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId_deckId: { userId: mockUserId, deckId: mockDeckId } },
        }),
      );

      // Verify known card upsert with KNOWN_SKIPPED
      expect(prisma.userOfficialCardProgress.upsert).toHaveBeenCalledWith({
        where: { userId_cardId: { userId: mockUserId, cardId: 'c1' } },
        update: { status: 'KNOWN_SKIPPED', nextReviewDate: null },
        create: {
          userId: mockUserId,
          cardId: 'c1',
          status: 'KNOWN_SKIPPED',
          nextReviewDate: null,
          repetitions: 0,
          interval: 0,
          easeFactor: 2.5,
        },
      });

      // Verify unknown card upsert with NEW
      expect(prisma.userOfficialCardProgress.upsert).toHaveBeenCalledWith({
        where: { userId_cardId: { userId: mockUserId, cardId: 'c2' } },
        update: { status: 'NEW', nextReviewDate: null },
        create: {
          userId: mockUserId,
          cardId: 'c2',
          status: 'NEW',
          nextReviewDate: null,
          repetitions: 0,
          interval: 0,
          easeFactor: 2.5,
        },
      });
    });
  });

  describe('getToeicPathProgress (TC-LIB-06-001)', () => {
    it('calculates coverage percentage (NGSL max 94% + TSL max 4.5%), completed decks, and days remaining', async () => {
      prisma.user.findUnique.mockResolvedValue({ dailyGoal: 10 });
      prisma.officialDeck.findMany.mockResolvedValue([
        {
          id: 'deck-1',
          slug: 'tsl-1a-office',
          title: 'Office Ops',
          titleVi: 'Nghiệp vụ VP',
          level: 'T1',
          order: 1,
          cards: [{ cardId: 'c1' }, { cardId: 'c2' }],
        },
        {
          id: 'deck-2',
          slug: 'tsl-2a-trade',
          title: 'Trade Ops',
          titleVi: 'Thương mại',
          level: 'T2',
          order: 2,
          cards: [{ cardId: 'c3' }, { cardId: 'c4' }],
        },
      ]);

      prisma.userOfficialCardProgress.findMany.mockResolvedValue([
        { cardId: 'c1', status: 'MASTERED' },
        { cardId: 'c2', status: 'KNOWN_SKIPPED' },
        { cardId: 'c3', status: 'LEARNING' },
      ]);

      // Mock user has mastered 1400 NGSL words
      prisma.userOfficialCardProgress.count.mockResolvedValue(1400);

      const result = await service.getToeicPathProgress(mockUserId);

      expect(result.maxEstimatedCoverage).toBe(98.5);
      expect(result.totalDecks).toBe(2);
      expect(result.completedDecks).toBe(1); // deck-1 is completed (c1 MASTERED + c2 KNOWN_SKIPPED)
      expect(result.totalWords).toBe(4);
      expect(result.masteredWords).toBe(1);
      expect(result.knownSkippedWords).toBe(1);
      expect(result.dailyGoal).toBe(10);

      // NGSL: 1400 / 2809 * 94.0 = ~46.8%
      expect(result.ngslCoveragePercent).toBeGreaterThan(45);
      // TSL: 2 / 4 * 4.5 = 2.3%
      expect(result.tslCoveragePercent).toBeCloseTo(2.3, 1);
      // Total coverage should sum NGSL + TSL
      expect(result.coveragePercent).toBe(
        Number(
          (result.ngslCoveragePercent + result.tslCoveragePercent).toFixed(1),
        ),
      );

      // Verify level breakdowns
      expect(result.levels.length).toBe(3);
      const t1 = result.levels.find((l) => l.level === 'T1');
      expect(t1?.completedDecks).toBe(1);
      expect(t1?.totalCards).toBe(2);
      expect(t1?.learnedCards).toBe(2);
      expect(t1?.progressPercent).toBe(100);

      const t2 = result.levels.find((l) => l.level === 'T2');
      expect(t2?.completedDecks).toBe(0);
      expect(t2?.learnedCards).toBe(0);
    });
  });
});
