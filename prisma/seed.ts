import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { Prisma, PrismaClient } from '../src/generated/prisma/client';
import { PROJECT_PLACEHOLDERS } from '../src/lib/projects/project-placeholders';
import { ADMIN } from './fixtures';

const prisma = new PrismaClient();

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

      await tx.department.upsert({
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
        const project = await tx.project.upsert({
          where: { name_startYear: { name: projectData.name, startYear: projectData.startYear } },
          update: projectData,
          create: projectData,
        });

        const beneficiaryYear = projectData.endYear ?? 2025;

        await tx.projectBeneficiary.upsert({
          where: { projectId_year: { projectId: project.id, year: beneficiaryYear } },
          update: beneficiaryData,
          create: { projectId: project.id, year: beneficiaryYear, ...beneficiaryData },
        });
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
