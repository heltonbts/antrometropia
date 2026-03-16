/*
  Warnings:

  - You are about to drop the column `abacateCustomerId` on the `nutricionistas` table. All the data in the column will be lost.
  - You are about to drop the column `assinaturaId` on the `nutricionistas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "nutricionistas" DROP COLUMN "abacateCustomerId",
DROP COLUMN "assinaturaId",
ADD COLUMN     "origemCadastro" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "resultados" ADD COLUMN     "percGorduraGuedes" DOUBLE PRECISION,
ADD COLUMN     "percGorduraNovack" DOUBLE PRECISION;
