import 'dotenv/config';
import { execSync } from 'node:child_process';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';
import { TABLES } from './fixtures';
import {
  E2E_ACTIVE_PROJECT,
  E2E_ADMIN,
  E2E_BENEFICIARY_YEAR,
  E2E_CLOSED_PROJECT,
  E2E_COORDINATOR,
  E2E_DEPARTMENT,
  E2E_DISABLED_COORDINATOR,
} from './e2e-fixtures';

function databaseName(url: string) {
  try {
    return decodeURIComponent(new URL(url).pathname).replace(/^\/+/, '');
  } catch {
    return url;
  }
}

function e2eDatabaseUrl() {
  const url = process.env.E2E_DATABASE_URL;

  if (!url) {
    throw new Error(
      'E2E_DATABASE_URL environment variable is required: the e2e seed truncates every table and refuses to fall back to DATABASE_URL'
    );
  }

  const developmentUrl = process.env.DATABASE_URL;
  if (developmentUrl && databaseName(url) === databaseName(developmentUrl)) {
    throw new Error(
      `E2E_DATABASE_URL must name a different database than DATABASE_URL, both are "${databaseName(url)}": the e2e seed truncates every table, and the same name on the same server is the same database however the host is spelled`
    );
  }

  return url;
}

async function main() {
  const url = e2eDatabaseUrl();

  const seedPassword = process.env.SEED_USER_PASSWORD;
  if (!seedPassword) {
    throw new Error('SEED_USER_PASSWORD environment variable is required');
  }

  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });

  const passwordHash = await bcrypt.hash(seedPassword, 10);
  const prisma = new PrismaClient({ datasourceUrl: url });

  try {
    await prisma.$transaction(
      async (tx) => {
        const tables = TABLES.map((table) => `"${table}"`).join(',');
        await tx.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);

        const department = await tx.department.create({ data: { name: E2E_DEPARTMENT } });

        const admin = await tx.user.create({ data: { ...E2E_ADMIN, passwordHash } });
        const coordinator = await tx.user.create({
          data: { ...E2E_COORDINATOR, passwordHash, createdBy: admin.id },
        });
        await tx.user.create({
          data: { ...E2E_DISABLED_COORDINATOR, passwordHash, createdBy: admin.id },
        });

        const activeProject = await tx.project.create({
          data: {
            ...E2E_ACTIVE_PROJECT,
            leadCoordinatorId: coordinator.id,
            departmentId: department.id,
            createdBy: admin.id,
          },
        });

        await tx.project.create({
          data: {
            ...E2E_CLOSED_PROJECT,
            leadCoordinatorId: coordinator.id,
            departmentId: department.id,
            createdBy: admin.id,
          },
        });

        await tx.projectBeneficiary.create({
          data: {
            projectId: activeProject.id,
            year: E2E_BENEFICIARY_YEAR,
            directChildrenAdolescents: 50,
            families: 20,
            authorId: coordinator.id,
          },
        });
      },
      { maxWait: 10_000, timeout: 30_000 }
    );
  } finally {
    await prisma.$disconnect();
  }

  console.log('E2E seed completed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
