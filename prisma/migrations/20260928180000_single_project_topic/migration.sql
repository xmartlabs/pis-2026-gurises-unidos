BEGIN;

LOCK TABLE "Project", "ProjectTopic" IN ACCESS EXCLUSIVE MODE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "ProjectTopic"
    GROUP BY "projectId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Resolve projects with multiple topics before migrating';
  END IF;
END $$;

ALTER TABLE "Project" ADD COLUMN "topicId" INTEGER;

UPDATE "Project" p
SET "topicId" = pt."topicId"
FROM "ProjectTopic" pt
WHERE pt."projectId" = p."id";

ALTER TABLE "Project"
ADD CONSTRAINT "Project_topicId_fkey"
FOREIGN KEY ("topicId") REFERENCES "Topic"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

DROP TABLE "ProjectTopic";

COMMIT;
