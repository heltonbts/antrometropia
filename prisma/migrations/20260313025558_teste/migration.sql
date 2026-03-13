/*
  Warnings:

  - You are about to drop the column `circBraco` on the `avaliacoes` table. All the data in the column will be lost.
  - You are about to drop the column `circCoxa` on the `avaliacoes` table. All the data in the column will be lost.
  - You are about to drop the column `dobSuprailiaca` on the `avaliacoes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "avaliacoes" DROP COLUMN "circBraco",
DROP COLUMN "circCoxa",
DROP COLUMN "dobSuprailiaca",
ADD COLUMN     "circAbdomen" DOUBLE PRECISION,
ADD COLUMN     "circBracoContraido" DOUBLE PRECISION,
ADD COLUMN     "circBracoRelaxado" DOUBLE PRECISION,
ADD COLUMN     "circCoxaMedia" DOUBLE PRECISION,
ADD COLUMN     "dobCristaIliaca" DOUBLE PRECISION,
ADD COLUMN     "dobSupraespinal" DOUBLE PRECISION;
