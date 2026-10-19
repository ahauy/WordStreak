-- Migration: Add official starter library & shared models (US-LIB-02)

-- CreateTable word_lists
CREATE TABLE IF NOT EXISTS "word_lists" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "license" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "attribution" TEXT NOT NULL,
    "entryCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "word_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable word_list_entries
CREATE TABLE IF NOT EXISTS "word_list_entries" (
    "id" TEXT NOT NULL,
    "list_id" TEXT NOT NULL,
    "headword" TEXT NOT NULL,
    "freq_rank" INTEGER,
    "freq_value" DOUBLE PRECISION,
    "level" TEXT,
    "topic" TEXT,
    "card_id" TEXT,

    CONSTRAINT "word_list_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable official_cards
CREATE TABLE IF NOT EXISTS "official_cards" (
    "id" TEXT NOT NULL,
    "headword" TEXT NOT NULL,
    "pos" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "content_version" INTEGER NOT NULL DEFAULT 1,
    "prompt_version" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "official_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable official_decks
CREATE TABLE IF NOT EXISTS "official_decks" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_vi" TEXT NOT NULL,
    "description" TEXT,
    "path_code" TEXT NOT NULL,
    "level" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "list_code" TEXT NOT NULL,
    "card_count" INTEGER NOT NULL DEFAULT 25,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "official_decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable official_deck_cards
CREATE TABLE IF NOT EXISTS "official_deck_cards" (
    "deck_id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "official_deck_cards_pkey" PRIMARY KEY ("deck_id","card_id")
);

-- CreateTable user_deck_enrollments
CREATE TABLE IF NOT EXISTS "user_deck_enrollments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_studied_at" TIMESTAMP(3),

    CONSTRAINT "user_deck_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable user_official_card_progress
CREATE TABLE IF NOT EXISTS "user_official_card_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "ease_factor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "next_review_date" TIMESTAMP(3),
    "last_reviewed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "personal_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_official_card_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable official_card_feedback
CREATE TABLE IF NOT EXISTS "official_card_feedback" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "comment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "official_card_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE UNIQUE INDEX IF NOT EXISTS "word_lists_code_key" ON "word_lists"("code");

CREATE INDEX IF NOT EXISTS "word_list_entries_headword_idx" ON "word_list_entries"("headword");
CREATE UNIQUE INDEX IF NOT EXISTS "word_list_entries_list_id_headword_key" ON "word_list_entries"("list_id", "headword");

CREATE INDEX IF NOT EXISTS "official_cards_headword_idx" ON "official_cards"("headword");
CREATE INDEX IF NOT EXISTS "official_cards_status_idx" ON "official_cards"("status");

CREATE UNIQUE INDEX IF NOT EXISTS "official_decks_slug_key" ON "official_decks"("slug");
CREATE INDEX IF NOT EXISTS "official_decks_path_code_order_idx" ON "official_decks"("path_code", "order");

CREATE INDEX IF NOT EXISTS "user_deck_enrollments_user_id_idx" ON "user_deck_enrollments"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "user_deck_enrollments_user_id_deck_id_key" ON "user_deck_enrollments"("user_id", "deck_id");

CREATE INDEX IF NOT EXISTS "user_official_card_progress_user_id_next_review_date_idx" ON "user_official_card_progress"("user_id", "next_review_date");
CREATE INDEX IF NOT EXISTS "user_official_card_progress_user_id_status_idx" ON "user_official_card_progress"("user_id", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "user_official_card_progress_user_id_card_id_key" ON "user_official_card_progress"("user_id", "card_id");

CREATE INDEX IF NOT EXISTS "official_card_feedback_status_idx" ON "official_card_feedback"("status");

-- AddForeignKeys
ALTER TABLE "word_list_entries" ADD CONSTRAINT "word_list_entries_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "word_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "word_list_entries" ADD CONSTRAINT "word_list_entries_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "official_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "official_deck_cards" ADD CONSTRAINT "official_deck_cards_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "official_decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "official_deck_cards" ADD CONSTRAINT "official_deck_cards_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "official_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_deck_enrollments" ADD CONSTRAINT "user_deck_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_deck_enrollments" ADD CONSTRAINT "user_deck_enrollments_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "official_decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_official_card_progress" ADD CONSTRAINT "user_official_card_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_official_card_progress" ADD CONSTRAINT "user_official_card_progress_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "official_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "official_card_feedback" ADD CONSTRAINT "official_card_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "official_card_feedback" ADD CONSTRAINT "official_card_feedback_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "official_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
