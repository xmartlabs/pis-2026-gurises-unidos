BEGIN;

LOCK TABLE "Project" IN ACCESS EXCLUSIVE MODE;

UPDATE "Project"
SET "topicId" = (
  SELECT "id"
  FROM "Topic"
  ORDER BY "isActive" DESC, "id" ASC
  LIMIT 1
)
WHERE "topicId" IS NULL;

ALTER TABLE "Project" ALTER COLUMN "topicId" SET NOT NULL;

COMMIT;
