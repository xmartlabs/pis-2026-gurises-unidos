import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  // --- Catalogs ---
  const montevideo = await prisma.department.upsert({
    where: { name: 'Montevideo' },
    update: {},
    create: { name: 'Montevideo' },
  });

  const canelones = await prisma.department.upsert({
    where: { name: 'Canelones' },
    update: {},
    create: { name: 'Canelones' },
  });

  const education = await prisma.topic.upsert({
    where: { name: 'Education' },
    update: {},
    create: { name: 'Education' },
  });

  const health = await prisma.topic.upsert({
    where: { name: 'Health' },
    update: {},
    create: { name: 'Health' },
  });

  // --- Users ---
  const admin = await prisma.user.upsert({
    where: { documentId: '11111111' },
    update: {},
    create: {
      firstName: 'Ana',
      lastName: 'Admin',
      documentId: '11111111',
      email: 'admin@gurisesunidos.test',
      role: 'admin',
      status: 'active',
      passwordHash: 'fake-hash-not-real',
    },
  });

  const coordinator = await prisma.user.upsert({
    where: { documentId: '22222222' },
    update: {},
    create: {
      firstName: 'Carlos',
      lastName: 'Coordinator',
      documentId: '22222222',
      email: 'coordinator@gurisesunidos.test',
      role: 'coordinator',
      status: 'active',
      passwordHash: 'fake-hash-not-real',
      createdBy: admin.id,
    },
  });

  // --- Test project ---
  const project = await prisma.project.create({
    data: {
      name: 'Test project',
      status: 'active',
      intensity: 'medium',
      startYear: 2025,
      leadCoordinatorId: coordinator.id,
      departmentId: montevideo.id,
      zone: 'city',
      createdBy: admin.id,
      projectTopics: {
        create: [{ topicId: education.id }, { topicId: health.id }],
      },
    },
  });

  // --- Beneficiaries ---
  await prisma.projectBeneficiary.create({
    data: {
      projectId: project.id,
      year: 2025,
      directChildrenAdolescents: 50,
      families: 20,
      authorId: coordinator.id,
    },
  });

  // --- Sample metric ---
  await prisma.metric.upsert({
    where: { key: 'children_reached' },
    update: {},
    create: {
      key: 'children_reached',
      name: 'Children reached',
      showPublicly: true,
      sortOrder: 1,
      updatedBy: admin.id,
    },
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
