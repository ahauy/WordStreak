/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LibraryService } from './library.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LibraryService', () => {
  let service: LibraryService;
  let prisma: {
    officialCard: { findUnique: jest.Mock };
    deck: { findFirst: jest.Mock; create: jest.Mock };
    card: { create: jest.Mock };
  };

  const mockUserId = 'user-123';
  const mockOfficialCardId = 'off-card-456';

  beforeEach(async () => {
    prisma = {
      officialCard: { findUnique: jest.fn() },
      deck: { findFirst: jest.fn(), create: jest.fn() },
      card: { create: jest.fn() },
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
});
