ALTER TABLE "nutricionistas"
ADD COLUMN "termosAceitosEm" TIMESTAMP(3),
ADD COLUMN "politicaPrivacidadeAceitaEm" TIMESTAMP(3),
ADD COLUMN "termosVersao" TEXT,
ADD COLUMN "politicaPrivacidadeVersao" TEXT;

ALTER TABLE "pacientes"
ADD COLUMN "termosAceitosEm" TIMESTAMP(3),
ADD COLUMN "politicaPrivacidadeAceitaEm" TIMESTAMP(3),
ADD COLUMN "consentiuDadosSaudeEm" TIMESTAMP(3),
ADD COLUMN "termosVersao" TEXT,
ADD COLUMN "politicaPrivacidadeVersao" TEXT,
ADD COLUMN "consentimentoVersao" TEXT;
