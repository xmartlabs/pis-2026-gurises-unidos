import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';
import { ADMIN, TABLES } from './fixtures';

const prisma = new PrismaClient();

async function main() {
  const mode = process.env.CLEAN_MODE;
  if (mode !== 'reset' && mode !== 'wipe') {
    throw new Error("CLEAN_MODE environment variable must be 'reset' or 'wipe'");
  }

  const adminPassword = process.env.SEED_USER_PASSWORD;
  if (mode === 'reset' && !adminPassword) {
    throw new Error('SEED_USER_PASSWORD environment variable is required when CLEAN_MODE is reset');
  }

  const passwordHash = adminPassword ? await bcrypt.hash(adminPassword, 10) : '';

  await prisma.$transaction(
    async (tx) => {
      const tables = TABLES.map((table) => `"${table}"`).join(',');
      await tx.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);

      if (mode === 'reset') {
        await tx.user.create({ data: { ...ADMIN, passwordHash } });
      }
    },
    { maxWait: 20_000, timeout: 120_000 }
  );

  console.log(mode === 'reset' ? 'Database cleaned, admin recreated' : 'Database wiped');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
