-- CreateTable
CREATE TABLE "lancamentos" (
    "id" TEXT NOT NULL,
    "nutricionistaId" TEXT NOT NULL,
    "pacienteId" TEXT,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "formaPagamento" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lancamentos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_nutricionistaId_fkey" FOREIGN KEY ("nutricionistaId") REFERENCES "nutricionistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
