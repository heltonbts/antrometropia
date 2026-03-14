-- AlterTable
ALTER TABLE "nutricionistas" ADD COLUMN     "abacateCustomerId" TEXT,
ADD COLUMN     "assinaturaId" TEXT,
ADD COLUMN     "assinaturaStatus" TEXT,
ADD COLUMN     "plano" TEXT NOT NULL DEFAULT 'FREE';
