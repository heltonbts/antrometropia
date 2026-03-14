CREATE TABLE "audit_logs" (
  "id" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "actorTipo" TEXT NOT NULL,
  "acao" TEXT NOT NULL,
  "detalhes" JSONB,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_actorId_actorTipo_criadoEm_idx" ON "audit_logs"("actorId", "actorTipo", "criadoEm");
