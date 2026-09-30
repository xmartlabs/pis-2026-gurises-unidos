import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { Prisma, PrismaClient } from '../src/generated/prisma/client';
import { PROJECT_PLACEHOLDERS } from '../src/lib/projects/project-placeholders';
import { ADMIN } from './fixtures';

const prisma = new PrismaClient();

const EMPTY_BENEFICIARIES = {
  directChildrenAdolescents: 0,
  indirectChildrenAdolescents: 0,
  youth18To29: 0,
  families: 0,
  coordinatedInstitutions: 0,
  communityLeaders: 0,
  basicServiceStaff: 0,
};

const SEED_PROJECTS = [
  {
    name: 'Playground',
    departmentKey: 'montevideo',
    status: 'active',
    intensity: 'high',
    startYear: 2022,
    zone: 'city',
    localityNeighborhood: 'Cerro Norte',
    publicDescription:
      'Espacios lúdicos seguros para el desarrollo integral de niños y niñas en zonas vulnerables.',
    beneficiaries: [
      {
        year: 2024,
        directChildrenAdolescents: 420,
        indirectChildrenAdolescents: 300,
        families: 150,
        communityLeaders: 8,
      },
      {
        year: 2025,
        directChildrenAdolescents: 610,
        indirectChildrenAdolescents: 420,
        families: 210,
        communityLeaders: 12,
      },
      {
        year: 2026,
        directChildrenAdolescents: 380,
        indirectChildrenAdolescents: 250,
        families: 130,
        communityLeaders: 9,
      },
    ],
  },
  {
    name: 'Apoyo Escolar',
    departmentKey: 'canelones',
    status: 'active',
    intensity: 'medium',
    startYear: 2023,
    zone: 'inland',
    localityNeighborhood: 'Las Piedras',
    publicDescription:
      'Acompañamiento educativo para fortalecer el vínculo con la escuela y mejorar trayectorias.',
    beneficiaries: [
      {
        year: 2024,
        directChildrenAdolescents: 260,
        families: 90,
        coordinatedInstitutions: 6,
        basicServiceStaff: 18,
      },
      {
        year: 2025,
        directChildrenAdolescents: 340,
        families: 120,
        coordinatedInstitutions: 9,
        basicServiceStaff: 25,
      },
      {
        year: 2026,
        directChildrenAdolescents: 210,
        families: 80,
        coordinatedInstitutions: 7,
        basicServiceStaff: 20,
      },
    ],
  },
  {
    name: 'Arte Joven',
    departmentKey: 'montevideo',
    status: 'inProgress',
    intensity: 'low',
    startYear: 2024,
    zone: 'city',
    localityNeighborhood: 'Casavalle',
    publicDescription:
      'Talleres de expresión artística que fortalecen identidad y habilidades socioemocionales.',
    beneficiaries: [
      { year: 2024, directChildrenAdolescents: 90, youth18To29: 40, families: 30 },
      {
        year: 2025,
        directChildrenAdolescents: 140,
        youth18To29: 75,
        families: 55,
        communityLeaders: 4,
      },
      {
        year: 2026,
        directChildrenAdolescents: 110,
        youth18To29: 60,
        families: 40,
        communityLeaders: 3,
      },
    ],
  },
] as const;

type ProjectFixture = Required<
  Omit<
    Prisma.ProjectUncheckedCreateInput,
    'id' | 'createdAt' | 'updatedAt' | 'projectCoordinators' | 'projectBeneficiaries'
  >
>;

async function main() {
  const seedPassword = process.env.SEED_USER_PASSWORD;
  if (!seedPassword) {
    throw new Error('SEED_USER_PASSWORD environment variable is required');
  }

  const passwordHash = await bcrypt.hash(seedPassword, 10);

  await prisma.$transaction(
    async (tx) => {
      // --- Catalogs ---
      const montevideo = await tx.department.upsert({
        where: { name: 'Montevideo' },
        update: {},
        create: { name: 'Montevideo' },
      });

      const canelones = await tx.department.upsert({
        where: { name: 'Canelones' },
        update: {},
        create: { name: 'Canelones' },
      });

      const education = await tx.topic.upsert({
        where: { name: 'Education' },
        update: {},
        create: { name: 'Education' },
      });

      await tx.topic.upsert({
        where: { name: 'Health' },
        update: {},
        create: { name: 'Health' },
      });

      // --- Users ---
      const admin = await tx.user.upsert({
        where: { documentId: ADMIN.documentId },
        update: { passwordHash },
        create: { ...ADMIN, passwordHash },
      });

      await tx.user.upsert({
        where: { documentId: '33333333' },
        update: { passwordHash },
        create: {
          firstName: 'Bruno',
          lastName: 'Admin',
          documentId: '33333333',
          email: 'admin2@gurisesunidos.test',
          role: 'admin',
          status: 'active',
          passwordHash,
          createdBy: admin.id,
        },
      });

      const coordinator = await tx.user.upsert({
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

      await tx.user.upsert({
        where: { documentId: '44444444' },
        update: { passwordHash },
        create: {
          firstName: 'Diana',
          lastName: 'Coordinator',
          documentId: '44444444',
          email: 'coordinator2@gurisesunidos.test',
          role: 'coordinator',
          status: 'disabled',
          passwordHash,
          createdBy: admin.id,
        },
      });

      // --- Test projects ---
      const baseProject: ProjectFixture = {
        name: 'Test project',
        status: 'active',
        intensity: 'medium',
        startYear: 2025,
        endYear: null,
        leadCoordinatorId: coordinator.id,
        departmentId: montevideo.id,
        topicId: education.id,
        zone: 'city',
        localityNeighborhood: null,
        generalObjective: null,
        publicDescription: null,
        coverPhoto: PROJECT_PLACEHOLDERS[0],
        internalNotes: null,
        createdBy: admin.id,
        deletedAt: null,
        deletedBy: null,
      };

      const projectFixtures: ProjectFixture[] = [
        baseProject,
        {
          ...baseProject,
          name: 'Closed test project',
          status: 'closed',
          intensity: 'low',
          startYear: 2022,
          endYear: 2024,
          zone: 'rural',
        },
        {
          ...baseProject,
          name: 'Paused test project',
          status: 'paused',
          startYear: 2023,
        },
      ];

      const beneficiaryData = {
        directChildrenAdolescents: 50,
        indirectChildrenAdolescents: 0,
        youth18To29: 0,
        families: 20,
        coordinatedInstitutions: 0,
        communityLeaders: 0,
        basicServiceStaff: 0,
        authorId: coordinator.id,
      };

      for (const projectData of projectFixtures) {
        const existing = await tx.project.findFirst({
          where: { name: projectData.name, startYear: projectData.startYear, deletedAt: null },
          select: { id: true },
        });
        const project = existing
          ? await tx.project.update({ where: { id: existing.id }, data: projectData })
          : await tx.project.create({ data: projectData });

        const beneficiaryYear = projectData.endYear ?? 2025;

        await tx.projectBeneficiary.upsert({
          where: { projectId_year: { projectId: project.id, year: beneficiaryYear } },
          update: beneficiaryData,
          create: { projectId: project.id, year: beneficiaryYear, ...beneficiaryData },
        });
      }

      const departmentIds = { montevideo: montevideo.id, canelones: canelones.id };

      for (const { departmentKey, beneficiaries, ...fixture } of SEED_PROJECTS) {
        const seedProject: ProjectFixture = {
          ...fixture,
          leadCoordinatorId: coordinator.id,
          departmentId: departmentIds[departmentKey],
          generalObjective: null,
          coverPhoto: null,
          internalNotes: null,
          createdBy: admin.id,
        };

        const existing = await tx.project.findFirst({
          where: { name: seedProject.name, startYear: seedProject.startYear },
          orderBy: { id: 'asc' },
        });

        const saved = existing
          ? await tx.project.update({ where: { id: existing.id }, data: seedProject })
          : await tx.project.create({ data: seedProject });

        await tx.projectTopic.createMany({
          data: topicIds.map((topicId) => ({ projectId: saved.id, topicId })),
          skipDuplicates: true,
        });

        for (const { year, ...counts } of beneficiaries) {
          const data = { ...EMPTY_BENEFICIARIES, ...counts, authorId: coordinator.id };
          await tx.projectBeneficiary.upsert({
            where: { projectId_year: { projectId: saved.id, year } },
            update: data,
            create: { projectId: saved.id, year, ...data },
          });
        }
      }

      // --- Sample metric ---
      await tx.metric.upsert({
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
    },
    { maxWait: 10_000, timeout: 30_000 }
  );

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
