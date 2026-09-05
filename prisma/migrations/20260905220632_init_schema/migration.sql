-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'coordinator');

-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('active', 'pending_invitation', 'disabled');

-- CreateEnum
CREATE TYPE "project_status" AS ENUM ('active', 'in_progress', 'completed', 'archived');

-- CreateEnum
CREATE TYPE "intensity" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "zone" AS ENUM ('city', 'inland', 'border', 'rural');

-- CreateEnum
CREATE TYPE "audit_action" AS ENUM ('creation', 'update', 'deletion');

-- CreateEnum
CREATE TYPE "audit_entity" AS ENUM ('user', 'project', 'beneficiary', 'metric');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "user_role" NOT NULL,
    "status" "user_status" NOT NULL,
    "password_hash" TEXT NOT NULL,
    "last_access" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" "project_status" NOT NULL,
    "intensity" "intensity" NOT NULL,
    "start_year" INTEGER NOT NULL,
    "lead_coordinator_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,
    "locality_neighborhood" TEXT,
    "zone" "zone" NOT NULL,
    "general_objective" TEXT,
    "public_description" VARCHAR(300),
    "cover_photo" TEXT,
    "internal_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_coordinators" (
    "project_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "project_coordinators_pkey" PRIMARY KEY ("project_id","user_id")
);

-- CreateTable
CREATE TABLE "project_topics" (
    "project_id" INTEGER NOT NULL,
    "topic_id" INTEGER NOT NULL,

    CONSTRAINT "project_topics_pkey" PRIMARY KEY ("project_id","topic_id")
);

-- CreateTable
CREATE TABLE "project_beneficiaries" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "direct_children_adolescents" INTEGER NOT NULL DEFAULT 0,
    "indirect_children_adolescents" INTEGER NOT NULL DEFAULT 0,
    "youth_18_29" INTEGER NOT NULL DEFAULT 0,
    "families" INTEGER NOT NULL DEFAULT 0,
    "coordinated_institutions" INTEGER NOT NULL DEFAULT 0,
    "community_leaders" INTEGER NOT NULL DEFAULT 0,
    "basic_service_staff" INTEGER NOT NULL DEFAULT 0,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author_id" INTEGER NOT NULL,

    CONSTRAINT "project_beneficiaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "show_publicly" BOOLEAN NOT NULL DEFAULT false,
    "show_publicly_draft" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "generated_by" INTEGER NOT NULL,
    "period_year" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "action" "audit_action" NOT NULL,
    "entity" "audit_entity" NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "details" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_document_id_key" ON "users"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "topics_name_key" ON "topics"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "project_beneficiaries_project_id_year_key" ON "project_beneficiaries"("project_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "metrics_key_key" ON "metrics"("key");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_lead_coordinator_id_fkey" FOREIGN KEY ("lead_coordinator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_coordinators" ADD CONSTRAINT "project_coordinators_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_coordinators" ADD CONSTRAINT "project_coordinators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_topics" ADD CONSTRAINT "project_topics_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_topics" ADD CONSTRAINT "project_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_beneficiaries" ADD CONSTRAINT "project_beneficiaries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_beneficiaries" ADD CONSTRAINT "project_beneficiaries_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
