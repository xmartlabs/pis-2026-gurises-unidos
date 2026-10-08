CREATE TYPE "CounterpartyType" AS ENUM ('publicSector', 'privateSector', 'internationalCooperation');

ALTER TABLE "Project" ADD COLUMN "counterpartyType" "CounterpartyType" NOT NULL;
