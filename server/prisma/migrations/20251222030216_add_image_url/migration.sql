/*
  Warnings:

  - You are about to drop the column `isActive` on the `Raffle` table. All the data in the column will be lost.
  - You are about to drop the column `opportunities` on the `Raffle` table. All the data in the column will be lost.
  - Made the column `description` on table `Raffle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endDate` on table `Raffle` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Raffle" DROP COLUMN "isActive",
DROP COLUMN "opportunities",
ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "ticketPrice" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "startDate" DROP DEFAULT,
ALTER COLUMN "endDate" SET NOT NULL;
