-- AlterTable
ALTER TABLE "users" ADD COLUMN     "learningGoal" TEXT,
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startingLevel" TEXT;
