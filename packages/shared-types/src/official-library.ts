/**
 * Official Vocabulary & Starter Library Data Contracts
 */

export interface OfficialCardContent {
  word: string;
  pos: string;
  ipa_us?: string;
  meaning_vi: string;
  definition_en?: string;
  example_en?: string;
  example_vi?: string;
  context_type?: string;
  collocations?: string[];
  word_family?: string[];
  confusables?: Array<{ word: string; note_vi: string }>;
  topic?: string;
  level?: string;
  freqRank?: number;
  tip_vi?: string | null;
  example_easy_en?: string | null;
  example_easy_vi?: string | null;
  stress_syllable?: number | null;
  ending_sound_tip_vi?: string | null;
}

export interface OfficialDeckDto {
  id: string;
  slug: string;
  title: string;
  titleVi: string;
  description?: string | null;
  pathCode: string;
  level?: string | null;
  order: number;
  listCode: string;
  cardCount: number;
  isEnrolled?: boolean;
  masteredCount?: number;
}

export interface OfficialCardDto {
  id: string;
  headword: string;
  pos: string;
  content: OfficialCardContent;
  status: string;
  contentVersion: number;
  promptVersion?: string | null;
}

export interface ForkOfficialCardDto {
  targetDeckId?: string;
}

export interface ForkOfficialCardResponse {
  cardId: string;
  deckId: string;
  word: string;
  meaning: string;
  status: string;
}

export interface GetOfficialDecksQuery {
  pathCode?: string;
  level?: string;
  topic?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedOfficialDecksResponse {
  decks: OfficialDeckDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OfficialDeckCardItemDto {
  cardId: string;
  order: number;
  headword: string;
  pos: string;
  content: OfficialCardContent;
  userStatus?: string | null;
}

export interface OfficialDeckDetailResponse {
  deck: OfficialDeckDto;
  cards: OfficialDeckCardItemDto[];
  isEnrolled: boolean;
  masteredCount: number;
  totalCards: number;
}

export interface EnrollOfficialDeckResponse {
  success: boolean;
  deckId: string;
  enrolledAt: string | Date;
}

export interface TriageCardItemDto {
  cardId: string;
  isKnown: boolean;
}

export interface TriageDeckCardsDto {
  items: TriageCardItemDto[];
}

export interface TriageDeckCardsResponse {
  success: boolean;
  deckId: string;
  knownCount: number;
  unknownCount: number;
  totalTriaged: number;
}

export interface ToeicDeckProgressDto {
  deckId: string;
  slug: string;
  title: string;
  titleVi: string;
  level: string;
  order: number;
  totalCards: number;
  masteredCount: number;
  knownSkippedCount: number;
  learningCount: number;
  isCompleted: boolean;
}

export interface ToeicLevelProgressDto {
  level: string;
  title: string;
  totalDecks: number;
  completedDecks: number;
  totalCards: number;
  learnedCards: number;
  progressPercent: number;
  decks: ToeicDeckProgressDto[];
}

export interface ToeicPathProgressResponse {
  coveragePercent: number;
  ngslCoveragePercent: number;
  tslCoveragePercent: number;
  maxEstimatedCoverage: number;
  totalDecks: number;
  completedDecks: number;
  totalWords: number;
  masteredWords: number;
  knownSkippedWords: number;
  estimatedDaysRemaining: number;
  dailyGoal: number;
  levels: ToeicLevelProgressDto[];
}

export type OfficialCardFeedbackReason =
  | 'WRONG_MEANING'
  | 'TYPO'
  | 'AUDIO_ERROR'
  | 'EXAMPLE_UNNATURAL'
  | 'OTHER';

export type OfficialCardFeedbackStatus = 'OPEN' | 'RESOLVED' | 'REJECTED';

export interface CreateCardFeedbackDto {
  reason: OfficialCardFeedbackReason;
  comment?: string;
}

export interface CardFeedbackResponse {
  id: string;
  cardId: string;
  userId: string;
  reason: OfficialCardFeedbackReason;
  comment?: string | null;
  status: OfficialCardFeedbackStatus;
  createdAt: string | Date;
}

export interface GetOfficialCardFeedbacksQuery {
  status?: OfficialCardFeedbackStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedOfficialCardFeedbacksResponse {
  feedbacks: Array<
    CardFeedbackResponse & {
      cardHeadword?: string;
      userEmail?: string;
    }
  >;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateOfficialCardDto {
  headword?: string;
  pos?: string;
  content?: Partial<OfficialCardContent>;
  status?: string;
}

export interface UpdateOfficialCardResponse {
  id: string;
  headword: string;
  pos: string;
  content: OfficialCardContent;
  status: string;
  contentVersion: number;
  updatedAt: string | Date;
}

export interface LibraryDeckAnalyticsDto {
  deckId: string;
  slug: string;
  title: string;
  pathCode: string;
  level?: string | null;
  totalEnrolledUsers: number;
  firstValueCompletionRate: number; // % users completing >= 10 cards
  avgTriageKnownRate: number; // % cards marked known
  feedbackCount: number;
  day1RetentionRate: number;
  day7RetentionRate: number;
}

export interface LibraryAnalyticsSummaryResponse {
  totalEnrolledUsers: number;
  activationRate: number;
  firstValueRate: number;
  avgTriageKnownRate: number;
  totalFeedbacks: number;
  deckStats: LibraryDeckAnalyticsDto[];
}



