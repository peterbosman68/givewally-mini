-- AlterTable: kolommen eerst optioneel toevoegen, bestaande rijen opvullen,
-- dan verplicht maken — zo faalt de migratie niet als er al cadeaus bestaan.
ALTER TABLE "Gift" ADD COLUMN     "giverName" TEXT;
ALTER TABLE "Gift" ADD COLUMN     "greeting" TEXT;

UPDATE "Gift" SET "giverName" = 'Onbekend' WHERE "giverName" IS NULL;
UPDATE "Gift" SET "greeting" = 'Voor jou!' WHERE "greeting" IS NULL;

ALTER TABLE "Gift" ALTER COLUMN "giverName" SET NOT NULL;
ALTER TABLE "Gift" ALTER COLUMN "greeting" SET NOT NULL;
