-- CreateTable
CREATE TABLE "nutricionistas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutricionistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL,
    "nutricionistaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "sexo" TEXT NOT NULL,
    "raca" TEXT NOT NULL,
    "senhaHash" TEXT,
    "tokenConvite" TEXT,
    "conviteAceito" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "dataAvaliacao" TIMESTAMP(3) NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "altura" DOUBLE PRECISION NOT NULL,
    "dobTricipital" DOUBLE PRECISION,
    "dobSubescapular" DOUBLE PRECISION,
    "dobSuprailiaca" DOUBLE PRECISION,
    "dobAbdominal" DOUBLE PRECISION,
    "dobCoxa" DOUBLE PRECISION,
    "dobPanturrilha" DOUBLE PRECISION,
    "dobBicipital" DOUBLE PRECISION,
    "circCintura" DOUBLE PRECISION,
    "circQuadril" DOUBLE PRECISION,
    "circBraco" DOUBLE PRECISION,
    "circPanturrilha" DOUBLE PRECISION,
    "circCoxa" DOUBLE PRECISION,
    "diamUmero" DOUBLE PRECISION,
    "diamFemur" DOUBLE PRECISION,
    "diamPunho" DOUBLE PRECISION,
    "diamFemurDistal" DOUBLE PRECISION,
    "alturaJoelho" DOUBLE PRECISION,
    "pcse" DOUBLE PRECISION,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultados" (
    "id" TEXT NOT NULL,
    "avaliacaoId" TEXT NOT NULL,
    "imc" DOUBLE PRECISION,
    "classificacaoImc" TEXT,
    "percGorduraFaulkner" DOUBLE PRECISION,
    "percGorduraPetroski" DOUBLE PRECISION,
    "densidadeCorporal" DOUBLE PRECISION,
    "massaGorda" DOUBLE PRECISION,
    "massaMagra" DOUBLE PRECISION,
    "massaOssea" DOUBLE PRECISION,
    "massaMuscular" DOUBLE PRECISION,
    "endomorfia" DOUBLE PRECISION,
    "mesomorfia" DOUBLE PRECISION,
    "ectomorfia" DOUBLE PRECISION,
    "somatocartaX" DOUBLE PRECISION,
    "somatocartaY" DOUBLE PRECISION,
    "biotipo" TEXT,
    "rcq" DOUBLE PRECISION,
    "classificacaoRcq" TEXT,
    "riscoCintura" TEXT,
    "cmb" DOUBLE PRECISION,
    "cmc" DOUBLE PRECISION,
    "soma6Dobras" DOUBLE PRECISION,
    "classificacao6Dobras" TEXT,
    "cpRisco" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resultados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nutricionistas_email_key" ON "nutricionistas"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_tokenConvite_key" ON "pacientes"("tokenConvite");

-- CreateIndex
CREATE UNIQUE INDEX "resultados_avaliacaoId_key" ON "resultados"("avaliacaoId");

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_nutricionistaId_fkey" FOREIGN KEY ("nutricionistaId") REFERENCES "nutricionistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados" ADD CONSTRAINT "resultados_avaliacaoId_fkey" FOREIGN KEY ("avaliacaoId") REFERENCES "avaliacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
