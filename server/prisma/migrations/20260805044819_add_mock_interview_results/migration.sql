-- CreateTable
CREATE TABLE "MockInterviewResult" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "relevanceScore" INTEGER NOT NULL,
    "clarityScore" INTEGER NOT NULL,
    "structureScore" INTEGER NOT NULL,
    "strengths" TEXT[],
    "improvements" TEXT[],
    "improvedAnswer" TEXT NOT NULL,
    "followUpQuestion" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockInterviewResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MockInterviewResult_userId_idx" ON "MockInterviewResult"("userId");

-- CreateIndex
CREATE INDEX "MockInterviewResult_createdAt_idx" ON "MockInterviewResult"("createdAt");

-- AddForeignKey
ALTER TABLE "MockInterviewResult" ADD CONSTRAINT "MockInterviewResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
