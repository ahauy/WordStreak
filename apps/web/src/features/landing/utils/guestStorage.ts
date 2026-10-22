export interface GuestCard {
  id: string;
  word: string;
  ipa: string;
  pos: string;
  definitionVi: string;
  definitionEn: string;
  exampleEn: string;
  exampleVi: string;
}

export interface GuestReviewRecord {
  cardId: string;
  rating: number;
  timestamp: number;
}

export interface GuestPreviewState {
  currentIndex: number;
  reviewedCards: GuestReviewRecord[];
  isCompleted: boolean;
  completedAt?: number;
}

export const GUEST_SAMPLE_CARDS: GuestCard[] = [
  {
    id: "guest-card-1",
    word: "resilient",
    ipa: "/rɪˈzɪl.jənt/",
    pos: "adj",
    definitionVi: "Có khả năng phục hồi nhanh chóng sau khó khăn.",
    definitionEn: "Able to recover quickly from difficult conditions.",
    exampleEn: "She is remarkably resilient in the face of career challenges.",
    exampleVi: "Cô ấy kiên cường đáng nể khi đối mặt với thử thách sự nghiệp.",
  },
  {
    id: "guest-card-2",
    word: "ubiquitous",
    ipa: "/juːˈbɪk.wɪ.təs/",
    pos: "adj",
    definitionVi: "Có mặt ở khắp mọi nơi, phổ biến rộng rãi.",
    definitionEn: "Present, appearing, or found everywhere simultaneously.",
    exampleEn: "Smartphones have become ubiquitous in modern daily life.",
    exampleVi: "Điện thoại thông minh đã trở nên phổ biến ở khắp mọi nơi.",
  },
  {
    id: "guest-card-3",
    word: "serendipity",
    ipa: "/ˌser.ənˈdɪp.ə.ti/",
    pos: "noun",
    definitionVi: "Sự tình cờ may mắn tìm thấy điều quý giá.",
    definitionEn: "The occurrence of valuable discoveries by chance.",
    exampleEn: "Finding this study platform was pure serendipity.",
    exampleVi: "Tìm thấy nền tảng học tập này là một sự tình cờ đầy may mắn.",
  },
  {
    id: "guest-card-4",
    word: "diligent",
    ipa: "/ˈdɪl.ɪ.dʒənt/",
    pos: "adj",
    definitionVi: "Chăm chỉ, cần mẫn và chu đáo trong công việc.",
    definitionEn: "Having or showing care and conscientiousness in work.",
    exampleEn: "Consistent, diligent daily practice builds lasting vocabulary retention.",
    exampleVi: "Luyện tập chăm chỉ mỗi ngày giúp ghi nhớ từ vựng lâu bền.",
  },
  {
    id: "guest-card-5",
    word: "pragmatic",
    ipa: "/præɡˈmæt.ɪk/",
    pos: "adj",
    definitionVi: "Thực tế, thực dụng, hướng tới giải pháp hiệu quả.",
    definitionEn: "Dealing with things sensibly and realistically based on practical results.",
    exampleEn: "Taking a pragmatic approach ensures measurable study progress.",
    exampleVi: "Cách tiếp cận thực tế đảm bảo tiến độ học tập có thể đo lường được.",
  },
];

export const GUEST_STORAGE_KEY = "wordstreak_guest_preview";

export function getGuestPreviewState(): GuestPreviewState {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        return {
          currentIndex: Number(parsed.currentIndex) || 0,
          reviewedCards: Array.isArray(parsed.reviewedCards) ? parsed.reviewedCards : [],
          isCompleted: Boolean(parsed.isCompleted),
          completedAt: parsed.completedAt,
        };
      }
    }
  } catch {
    // Ignore storage parse error
  }
  return {
    currentIndex: 0,
    reviewedCards: [],
    isCompleted: false,
  };
}

export function saveGuestPreviewState(state: GuestPreviewState): void {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage write error
  }
}

export function recordGuestRating(cardId: string, rating: number): GuestPreviewState {
  const current = getGuestPreviewState();
  const newReviewed = [
    ...current.reviewedCards.filter((r) => r.cardId !== cardId),
    { cardId, rating, timestamp: Date.now() },
  ];

  const nextIndex = current.currentIndex + 1;
  const isCompleted = nextIndex >= GUEST_SAMPLE_CARDS.length;

  const nextState: GuestPreviewState = {
    currentIndex: Math.min(nextIndex, GUEST_SAMPLE_CARDS.length),
    reviewedCards: newReviewed,
    isCompleted,
    completedAt: isCompleted ? (current.completedAt || Date.now()) : undefined,
  };

  saveGuestPreviewState(nextState);
  return nextState;
}

export function clearGuestPreviewState(): void {
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch {
    // Ignore storage error
  }
}
