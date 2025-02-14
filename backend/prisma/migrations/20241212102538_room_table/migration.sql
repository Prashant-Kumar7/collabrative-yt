-- CreateTable
CREATE TABLE "Room" (
    "roomId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "lower" TEXT NOT NULL,
    "medium" TEXT NOT NULL,
    "higher" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("roomId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_videoId_key" ON "Room"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_lower_key" ON "Room"("lower");

-- CreateIndex
CREATE UNIQUE INDEX "Room_medium_key" ON "Room"("medium");

-- CreateIndex
CREATE UNIQUE INDEX "Room_higher_key" ON "Room"("higher");
