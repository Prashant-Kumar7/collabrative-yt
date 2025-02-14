/*
  Warnings:

  - You are about to drop the column `videoUrl` on the `Video` table. All the data in the column will be lost.
  - Added the required column `thumbnailUrl` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "videoUrl",
ADD COLUMN     "thumbnailUrl" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;
