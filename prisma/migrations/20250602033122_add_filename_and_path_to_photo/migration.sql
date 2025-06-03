/*
  Warnings:

  - Added the required column `filename` to the `photos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `photos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "photos" ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL;
