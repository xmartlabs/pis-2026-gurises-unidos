import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { Prisma, PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

type ProjectFixture = Required<
  Omit<
    Prisma.ProjectUncheckedCreateInput,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'projectCoordinators'
    | 'projectTopics'
    | 'projectBeneficiaries'
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

      const health = await tx.topic.upsert({
        where: { name: 'Health' },
        update: {},
        create: { name: 'Health' },
      });

      // --- Users ---
      const admin = await tx.user.upsert({
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

      // --- Test project ---
      const projectData: ProjectFixture = {
        name: 'Test project',
        status: 'active',
        intensity: 'medium',
        startYear: 2025,
        leadCoordinatorId: coordinator.id,
        departmentId: montevideo.id,
        zone: 'city',
        localityNeighborhood: null,
        generalObjective: null,
        publicDescription: null,
        coverPhoto: null,
        internalNotes: null,
        createdBy: admin.id,
      };

      // a project is identified by name + startYear, but there is no unique index yet
      const existingProject = await tx.project.findFirst({
        where: { name: projectData.name, startYear: projectData.startYear },
        orderBy: { id: 'asc' },
      });

      const project = existingProject
        ? await tx.project.update({ where: { id: existingProject.id }, data: projectData })
        : await tx.project.create({ data: projectData });

      const topicIds = [education.id, health.id];

      await tx.projectTopic.deleteMany({
        where: { projectId: project.id, topicId: { notIn: topicIds } },
      });

      await tx.projectTopic.createMany({
        data: topicIds.map((topicId) => ({ projectId: project.id, topicId })),
        skipDuplicates: true,
      });

      // --- Beneficiaries ---
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

      await tx.projectBeneficiary.upsert({
        where: { projectId_year: { projectId: project.id, year: projectData.startYear } },
        update: beneficiaryData,
        create: { projectId: project.id, year: projectData.startYear, ...beneficiaryData },
      });

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
