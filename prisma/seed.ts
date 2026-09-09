import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { Prisma, PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  const seedPassword = process.env.SEED_USER_PASSWORD;
  if (!seedPassword) {
    throw new Error('SEED_USER_PASSWORD environment variable is required');
  }

  const passwordHash = await bcrypt.hash(seedPassword, 10);

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
    update: { passwordHash },
    create: {
      firstName: 'Ana',
      lastName: 'Admin',
      documentId: '11111111',
      email: 'admin@gurisesunidos.test',
      role: 'admin',
      status: 'active',
      passwordHash,
    },
  });

  const coordinator = await prisma.user.upsert({
    where: { documentId: '22222222' },
    update: { passwordHash },
    create: {
      firstName: 'Carlos',
      lastName: 'Coordinator',
      documentId: '22222222',
      email: 'coordinator@gurisesunidos.test',
      role: 'coordinator',
      status: 'active',
      passwordHash,
      createdBy: admin.id,
    },
  });

  // --- Test project ---
  const projectData = {
    name: 'Test project',
    status: 'active',
    intensity: 'medium',
    startYear: 2025,
    leadCoordinatorId: coordinator.id,
    departmentId: montevideo.id,
    zone: 'city',
    createdBy: admin.id,
  } satisfies Prisma.ProjectUncheckedCreateInput;

  // a project is identified by name + startYear, but there is no unique index yet
  const existingProject = await prisma.project.findFirst({
    where: { name: projectData.name, startYear: projectData.startYear },
  });

  const project = existingProject
    ? await prisma.project.update({ where: { id: existingProject.id }, data: projectData })
    : await prisma.project.create({ data: projectData });

  for (const topic of [education, health]) {
    await prisma.projectTopic.upsert({
      where: { projectId_topicId: { projectId: project.id, topicId: topic.id } },
      update: {},
      create: { projectId: project.id, topicId: topic.id },
    });
  }

  // --- Beneficiaries ---
  await prisma.projectBeneficiary.upsert({
    where: { projectId_year: { projectId: project.id, year: 2025 } },
    update: {
      directChildrenAdolescents: 50,
      families: 20,
      authorId: coordinator.id,
    },
    create: {
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
