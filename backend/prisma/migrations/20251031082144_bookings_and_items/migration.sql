/*
  Warnings:

  - You are about to drop the column `date` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `slotId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `totalPrice` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_slotId_fkey";

-- DropIndex
DROP INDEX "public"."Booking_date_idx";

-- DropIndex
DROP INDEX "public"."Booking_mentorId_date_startTime_idx";

-- DropIndex
DROP INDEX "public"."Booking_slotId_key";

-- DropIndex
DROP INDEX "public"."Booking_studentId_date_startTime_idx";

-- DropIndex
DROP INDEX "public"."Slot_mentorId_date_status_idx";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "date",
DROP COLUMN "endTime",
DROP COLUMN "price",
DROP COLUMN "slotId",
DROP COLUMN "startTime",
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "BookingItem" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingItem_slotId_key" ON "BookingItem"("slotId");

-- CreateIndex
CREATE INDEX "BookingItem_bookingId_idx" ON "BookingItem"("bookingId");

-- CreateIndex
CREATE INDEX "BookingItem_slotId_idx" ON "BookingItem"("slotId");

-- CreateIndex
CREATE INDEX "BookingItem_mentorId_idx" ON "BookingItem"("mentorId");

-- AddForeignKey
ALTER TABLE "BookingItem" ADD CONSTRAINT "BookingItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItem" ADD CONSTRAINT "BookingItem_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
