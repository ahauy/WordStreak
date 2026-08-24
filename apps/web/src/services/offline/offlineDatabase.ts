import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  OfflineDeckEntity,
  OfflineCardEntity,
  ReviewQueueEntity,
  CachedMediaEntity,
  PwaPreferencesEntity,
  ReviewQueueStatus,
} from "@wordstreak/shared-types";

export const DB_NAME = "wordstreak_offline_db";
export const DB_VERSION = 1;
export const LRU_SWEEP_THRESHOLD_BYTES = 45 * 1024 * 1024; // 45MB quota trigger

export interface WordStreakOfflineDBSchema extends DBSchema {
  offline_decks: {
    key: string;
    value: OfflineDeckEntity;
    indexes: {
      "by-userId": string;
    };
  };
  offline_cards: {
    key: string;
    value: OfflineCardEntity;
    indexes: {
      "by-deckId": string;
      "by-nextReviewDate": string;
      "by-status": string;
    };
  };
  review_queue: {
    key: string;
    value: ReviewQueueEntity;
    indexes: {
      "by-userId": string;
      "by-status": ReviewQueueStatus;
      "by-reviewedAt": string;
    };
  };
  cached_media: {
    key: string;
    value: CachedMediaEntity;
    indexes: {
      "by-lastAccessedAt": string;
      "by-byteSize": number;
    };
  };
  pwa_preferences: {
    key: string;
    value: PwaPreferencesEntity;
  };
}

let dbPromise: Promise<IDBPDatabase<WordStreakOfflineDBSchema>> | null = null;

export function getDb(): Promise<IDBPDatabase<WordStreakOfflineDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<WordStreakOfflineDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 1. offline_decks
        if (!db.objectStoreNames.contains("offline_decks")) {
          const deckStore = db.createObjectStore("offline_decks", {
            keyPath: "id",
          });
          deckStore.createIndex("by-userId", "userId");
        }

        // 2. offline_cards
        if (!db.objectStoreNames.contains("offline_cards")) {
          const cardStore = db.createObjectStore("offline_cards", {
            keyPath: "id",
          });
          cardStore.createIndex("by-deckId", "deckId");
          cardStore.createIndex("by-nextReviewDate", "nextReviewDate");
          cardStore.createIndex("by-status", "status");
        }

        // 3. review_queue
        if (!db.objectStoreNames.contains("review_queue")) {
          const reviewStore = db.createObjectStore("review_queue", {
            keyPath: "id",
          });
          reviewStore.createIndex("by-userId", "userId");
          reviewStore.createIndex("by-status", "status");
          reviewStore.createIndex("by-reviewedAt", "reviewedAtClient");
        }

        // 4. cached_media
        if (!db.objectStoreNames.contains("cached_media")) {
          const mediaStore = db.createObjectStore("cached_media", {
            keyPath: "url",
          });
          mediaStore.createIndex("by-lastAccessedAt", "lastAccessedAt");
          mediaStore.createIndex("by-byteSize", "byteSize");
        }

        // 5. pwa_preferences
        if (!db.objectStoreNames.contains("pwa_preferences")) {
          db.createObjectStore("pwa_preferences", {
            keyPath: "key",
          });
        }
      },
    });
  }
  return dbPromise;
}

// ==========================================
// Deck & Card CRUD Helpers
// ==========================================

export async function saveDeckOffline(deck: OfflineDeckEntity): Promise<void> {
  const db = await getDb();
  await db.put("offline_decks", deck);
}

export async function getOfflineDecks(
  userId?: string,
): Promise<OfflineDeckEntity[]> {
  const db = await getDb();
  if (userId) {
    return db.getAllFromIndex("offline_decks", "by-userId", userId);
  }
  return db.getAll("offline_decks");
}

export async function getOfflineDeck(
  deckId: string,
): Promise<OfflineDeckEntity | undefined> {
  const db = await getDb();
  return db.get("offline_decks", deckId);
}

export async function saveCardsOffline(
  cards: OfflineCardEntity[],
): Promise<void> {
  const db = await getDb();
  const tx = db.transaction("offline_cards", "readwrite");
  await Promise.all(cards.map((card) => tx.store.put(card)));
  await tx.done;
}

export async function getOfflineCardsByDeck(
  deckId: string,
): Promise<OfflineCardEntity[]> {
  const db = await getDb();
  return db.getAllFromIndex("offline_cards", "by-deckId", deckId);
}

export async function getDueOfflineCards(
  deckId?: string,
  cutoffDate: Date = new Date(),
): Promise<OfflineCardEntity[]> {
  const db = await getDb();
  const allCards = deckId
    ? await db.getAllFromIndex("offline_cards", "by-deckId", deckId)
    : await db.getAll("offline_cards");

  const cutoffIso = cutoffDate.toISOString();
  return allCards.filter((card) => card.nextReviewDate <= cutoffIso);
}

export async function deleteDeckOffline(deckId: string): Promise<void> {
  const db = await getDb();
  const cards = await getOfflineCardsByDeck(deckId);

  const tx = db.transaction(["offline_decks", "offline_cards"], "readwrite");
  await tx.objectStore("offline_decks").delete(deckId);
  await Promise.all(
    cards.map((c) => tx.objectStore("offline_cards").delete(c.id)),
  );
  await tx.done;
}

// ==========================================
// Review Queue CRUD Helpers
// ==========================================

export async function queueOfflineReview(
  review: Omit<ReviewQueueEntity, "id" | "status" | "retryCount"> & {
    id?: string;
  },
): Promise<ReviewQueueEntity> {
  const db = await getDb();
  const entity: ReviewQueueEntity = {
    id: review.id || crypto.randomUUID(),
    userId: review.userId,
    cardId: review.cardId,
    rating: review.rating,
    interval: review.interval,
    easeFactor: review.easeFactor,
    repetitions: review.repetitions,
    reviewedAtClient: review.reviewedAtClient || new Date().toISOString(),
    clientTimezone:
      review.clientTimezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC",
    status: "PENDING",
    retryCount: 0,
  };

  await db.put("review_queue", entity);
  return entity;
}

export async function getPendingReviews(
  userId?: string,
): Promise<ReviewQueueEntity[]> {
  const db = await getDb();
  const all = await db.getAll("review_queue");
  return all.filter((r) => {
    const isPending = r.status === "PENDING" || r.status === "FAILED";
    const matchesUser = !userId || r.userId === userId;
    return isPending && matchesUser;
  });
}

export async function markReviewSynced(reviewIds: string[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction("review_queue", "readwrite");
  await Promise.all(reviewIds.map((id) => tx.store.delete(id)));
  await tx.done;
}

export async function updateReviewQueueStatus(
  reviewId: string,
  status: ReviewQueueStatus,
  lastError?: string,
): Promise<void> {
  const db = await getDb();
  const item = await db.get("review_queue", reviewId);
  if (item) {
    item.status = status;
    if (lastError) item.lastError = lastError;
    if (status === "FAILED") item.retryCount += 1;
    await db.put("review_queue", item);
  }
}

// ==========================================
// Cached Media & LRU Sweep Helpers
// ==========================================

export async function saveCachedMedia(
  url: string,
  mediaBlob: Blob,
  mimeType = "audio/mpeg",
  customAccessedAt?: string,
): Promise<void> {
  const db = await getDb();
  const now = customAccessedAt || new Date().toISOString();
  let buffer: ArrayBuffer;
  try {
    buffer = await mediaBlob.arrayBuffer();
  } catch {
    buffer = new ArrayBuffer(mediaBlob.size || 0);
  }

  const entity = {
    url,
    mediaBlob: new Blob([buffer], { type: mimeType }),
    _rawBuffer: buffer,
    mimeType,
    byteSize: mediaBlob.size || buffer.byteLength,
    lastAccessedAt: now,
    cachedAt: now,
  } as unknown as CachedMediaEntity;

  await db.put("cached_media", entity);
  await runLruMediaSweep();
}

export async function getCachedMedia(url: string): Promise<Blob | null> {
  const db = await getDb();
  const entity = (await db.get("cached_media", url)) as
    (CachedMediaEntity & { _rawBuffer?: ArrayBuffer }) | undefined;
  if (!entity) return null;

  entity.lastAccessedAt = new Date().toISOString();
  await db.put("cached_media", entity as CachedMediaEntity);

  if (entity.mediaBlob instanceof Blob && entity.mediaBlob.size > 0) {
    return entity.mediaBlob;
  }
  if (entity._rawBuffer) {
    return new Blob([entity._rawBuffer], { type: entity.mimeType });
  }
  return entity.mediaBlob || new Blob([], { type: entity.mimeType });
}

export async function runLruMediaSweep(
  targetMaxBytes = LRU_SWEEP_THRESHOLD_BYTES,
): Promise<number> {
  const db = await getDb();
  const allMedia = await db.getAll("cached_media");
  let totalBytes = allMedia.reduce((acc, curr) => acc + curr.byteSize, 0);

  if (totalBytes <= targetMaxBytes) {
    return 0;
  }

  // Sort ascending by lastAccessedAt (oldest first)
  const sorted = allMedia.sort((a, b) => {
    const diff =
      new Date(a.lastAccessedAt).getTime() -
      new Date(b.lastAccessedAt).getTime();
    if (diff !== 0) return diff;
    return a.url.localeCompare(b.url);
  });

  const desiredBytes = targetMaxBytes * 0.8; // drop to 80% to give breathing room
  let purgedCount = 0;
  const toDelete: string[] = [];

  for (const item of sorted) {
    if (totalBytes <= desiredBytes) break;
    toDelete.push(item.url);
    totalBytes -= item.byteSize;
    purgedCount++;
  }

  if (toDelete.length > 0) {
    const tx = db.transaction("cached_media", "readwrite");
    await Promise.all(toDelete.map((url) => tx.store.delete(url)));
    await tx.done;
  }

  return purgedCount;
}

// ==========================================
// Storage Estimate & Purge
// ==========================================

export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
  offlineDeckCount: number;
  offlineCardCount: number;
  pendingReviewCount: number;
  cachedMediaBytes: number;
}> {
  const db = await getDb();
  const [decks, cards, pending, media] = await Promise.all([
    db.getAll("offline_decks"),
    db.getAll("offline_cards"),
    getPendingReviews(),
    db.getAll("cached_media"),
  ]);

  let quota = 50 * 1024 * 1024; // 50MB fallback
  let usage = media.reduce((acc, curr) => acc + curr.byteSize, 0);

  if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.quota) quota = estimate.quota;
      if (estimate.usage) usage = estimate.usage;
    } catch {
      // Ignore browser estimate error and fall back to local sum
    }
  }

  const mediaBytes = media.reduce((acc, curr) => acc + curr.byteSize, 0);
  const percentUsed =
    quota > 0 ? Number(((usage / quota) * 100).toFixed(1)) : 0;

  return {
    usage,
    quota,
    percentUsed,
    offlineDeckCount: decks.length,
    offlineCardCount: cards.length,
    pendingReviewCount: pending.length,
    cachedMediaBytes: mediaBytes,
  };
}

export async function purgeOfflineDatabase(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(
    [
      "offline_decks",
      "offline_cards",
      "review_queue",
      "cached_media",
      "pwa_preferences",
    ],
    "readwrite",
  );
  await Promise.all([
    tx.objectStore("offline_decks").clear(),
    tx.objectStore("offline_cards").clear(),
    tx.objectStore("review_queue").clear(),
    tx.objectStore("cached_media").clear(),
    tx.objectStore("pwa_preferences").clear(),
  ]);
  await tx.done;
}

// ==========================================
// PWA Preferences Helpers
// ==========================================

export async function getOfflinePreference<T>(
  key: string,
  defaultValue: T,
): Promise<T> {
  const db = await getDb();
  const entity = await db.get("pwa_preferences", key);
  if (!entity || entity.value === undefined) {
    return defaultValue;
  }
  return entity.value as T;
}

export async function setOfflinePreference<T>(
  key: string,
  value: T,
): Promise<void> {
  const db = await getDb();
  await db.put("pwa_preferences", {
    key,
    value,
    updatedAt: new Date().toISOString(),
  });
}
