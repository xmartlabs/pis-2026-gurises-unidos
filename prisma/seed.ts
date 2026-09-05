// prisma/seed.ts
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  // --- Catálogos ---
  const montevideo = await prisma.departments.create({ data: { name: 'Montevideo' } });
  const canelones = await prisma.departments.create({ data: { name: 'Canelones' } });

  const education = await prisma.topics.create({ data: { name: 'Education' } });
  const health = await prisma.topics.create({ data: { name: 'Health' } });

  // --- Usuarios ---
  const admin = await prisma.users.create({
    data: {
      name: 'Ana',
      last_name: 'Admin',
      document_id: '11111111',
      email: 'admin@gurisesunidos.test',
      role: 'admin',
      status: 'active',
      password_hash: 'fake-hash-not-real',
    },
  });

  const coordinator = await prisma.users.create({
    data: {
      name: 'Carlos',
      last_name: 'Coordinator',
      document_id: '22222222',
      email: 'coordinator@gurisesunidos.test',
      role: 'coordinator',
      status: 'active',
      password_hash: 'fake-hash-not-real',
      created_by: admin.id,
    },
  });

  // --- Proyecto de prueba ---
  const project = await prisma.projects.create({
    data: {
      name: 'Test project',
      status: 'active',
      intensity: 'medium',
      start_year: 2025,
      lead_coordinator_id: coordinator.id,
      department_id: montevideo.id,
      zone: 'montevideo',
      created_by: admin.id,
      project_topics: {
        create: [{ topic_id: education.id }, { topic_id: health.id }],
      },
    },
  });

  // --- Beneficiarios ---
  await prisma.project_beneficiaries.create({
    data: {
      project_id: project.id,
      year: 2025,
      direct_children_adolescents: 50,
      families: 20,
      author_id: coordinator.id,
    },
  });

  // --- Métrica de ejemplo ---
  await prisma.metrics.create({
    data: {
      key: 'children_reached',
      name: 'Children reached',
      show_publicly: true,
      sort_order: 1,
      updated_by: admin.id,
    },
  });

  console.log('Seed completed ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
