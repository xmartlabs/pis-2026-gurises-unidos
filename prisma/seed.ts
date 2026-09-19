import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { Prisma, PrismaClient } from '../src/generated/prisma/client';
import { ADMIN } from './fixtures';

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

type BeneficiaryFixture = Omit<
  Prisma.ProjectBeneficiaryUncheckedCreateInput,
  'projectId' | 'year' | 'authorId'
>;

type ProjectSeed = {
  data: ProjectFixture;
  topicIds: number[];
  beneficiariesByYear: Record<number, BeneficiaryFixture>;
};

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

      const artigas = await tx.department.upsert({
        where: { name: 'Artigas' },
        update: {},
        create: { name: 'Artigas' },
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
          status: 'pendingInvitation',
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

      // --- Projects ---
      const projectFixtures: ProjectSeed[] = [
        {
          data: {
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
          },
          topicIds: [education.id, health.id],
          beneficiariesByYear: {
            2025: {
              directChildrenAdolescents: 50,
              indirectChildrenAdolescents: 0,
              youth18To29: 0,
              families: 20,
              coordinatedInstitutions: 0,
              communityLeaders: 0,
              basicServiceStaff: 0,
            },
          },
        },
        {
          data: {
            name: 'Centro Educativo El Sol',
            status: 'active',
            intensity: 'high',
            startYear: 2024,
            leadCoordinatorId: coordinator.id,
            departmentId: montevideo.id,
            zone: 'city',
            localityNeighborhood: 'Casavalle',
            generalObjective: 'Acompañamiento educativo para NNA en situación de vulnerabilidad.',
            publicDescription:
              'Centro socioeducativo de atención diaria para niñas, niños y adolescentes.',
            coverPhoto: null,
            internalNotes: null,
            createdBy: admin.id,
          },
          topicIds: [education.id],
          beneficiariesByYear: {
            2023: {
              directChildrenAdolescents: 95,
              indirectChildrenAdolescents: 30,
              youth18To29: 6,
              families: 48,
              coordinatedInstitutions: 2,
              communityLeaders: 4,
              basicServiceStaff: 6,
            },
            2024: {
              directChildrenAdolescents: 120,
              indirectChildrenAdolescents: 40,
              youth18To29: 10,
              families: 60,
              coordinatedInstitutions: 3,
              communityLeaders: 5,
              basicServiceStaff: 8,
            },
            2025: {
              directChildrenAdolescents: 145,
              indirectChildrenAdolescents: 55,
              youth18To29: 15,
              families: 72,
              coordinatedInstitutions: 4,
              communityLeaders: 6,
              basicServiceStaff: 9,
            },
          },
        },
        {
          data: {
            name: 'Programa Salud Rural',
            status: 'inProgress',
            intensity: 'medium',
            startYear: 2024,
            leadCoordinatorId: coordinator.id,
            departmentId: canelones.id,
            zone: 'rural',
            localityNeighborhood: null,
            generalObjective: 'Promoción de salud y prevención en zonas rurales.',
            publicDescription: null,
            coverPhoto: null,
            internalNotes: 'Pendiente renovar convenio con policlínica local.',
            createdBy: coordinator.id,
          },
          topicIds: [health.id],
          beneficiariesByYear: {
            2023: {
              directChildrenAdolescents: 22,
              indirectChildrenAdolescents: 15,
              youth18To29: 18,
              families: 32,
              coordinatedInstitutions: 1,
              communityLeaders: 3,
              basicServiceStaff: 5,
            },
            2024: {
              directChildrenAdolescents: 30,
              indirectChildrenAdolescents: 20,
              youth18To29: 25,
              families: 40,
              coordinatedInstitutions: 2,
              communityLeaders: 4,
              basicServiceStaff: 6,
            },
            2025: {
              directChildrenAdolescents: 38,
              indirectChildrenAdolescents: 22,
              youth18To29: 28,
              families: 45,
              coordinatedInstitutions: 2,
              communityLeaders: 5,
              basicServiceStaff: 7,
            },
          },
        },
        {
          data: {
            name: 'Red de Apoyo Fronterizo',
            status: 'archived',
            intensity: 'low',
            startYear: 2023,
            leadCoordinatorId: coordinator.id,
            departmentId: artigas.id,
            zone: 'border',
            localityNeighborhood: null,
            generalObjective: 'Sensibilización y prevención con referentes de la zona de frontera.',
            publicDescription: null,
            coverPhoto: null,
            internalNotes: 'Proyecto archivado por falta de financiamiento.',
            createdBy: admin.id,
          },
          topicIds: [education.id, health.id],
          beneficiariesByYear: {
            2023: {
              directChildrenAdolescents: 15,
              indirectChildrenAdolescents: 10,
              youth18To29: 5,
              families: 12,
              coordinatedInstitutions: 1,
              communityLeaders: 3,
              basicServiceStaff: 2,
            },
            2024: {
              directChildrenAdolescents: 12,
              indirectChildrenAdolescents: 8,
              youth18To29: 4,
              families: 10,
              coordinatedInstitutions: 1,
              communityLeaders: 2,
              basicServiceStaff: 2,
            },
            2025: {
              directChildrenAdolescents: 9,
              indirectChildrenAdolescents: 6,
              youth18To29: 3,
              families: 8,
              coordinatedInstitutions: 1,
              communityLeaders: 2,
              basicServiceStaff: 1,
            },
          },
        },
        {
          data: {
            name: 'Formación Docente 2023',
            status: 'completed',
            intensity: 'medium',
            startYear: 2023,
            leadCoordinatorId: coordinator.id,
            departmentId: canelones.id,
            zone: 'inland',
            localityNeighborhood: null,
            generalObjective: 'Capacitación a docentes y educadores en detección temprana.',
            publicDescription: null,
            coverPhoto: null,
            internalNotes: null,
            createdBy: admin.id,
          },
          topicIds: [education.id],
          beneficiariesByYear: {
            2023: {
              directChildrenAdolescents: 0,
              indirectChildrenAdolescents: 90,
              youth18To29: 0,
              families: 0,
              coordinatedInstitutions: 6,
              communityLeaders: 0,
              basicServiceStaff: 35,
            },
            2024: {
              directChildrenAdolescents: 0,
              indirectChildrenAdolescents: 65,
              youth18To29: 0,
              families: 0,
              coordinatedInstitutions: 4,
              communityLeaders: 0,
              basicServiceStaff: 22,
            },
            2025: {
              directChildrenAdolescents: 0,
              indirectChildrenAdolescents: 40,
              youth18To29: 0,
              families: 0,
              coordinatedInstitutions: 3,
              communityLeaders: 0,
              basicServiceStaff: 14,
            },
          },
        },
      ];

      for (const fixture of projectFixtures) {
        // a project is identified by name + startYear, but there is no unique index yet
        const existingProject = await tx.project.findFirst({
          where: { name: fixture.data.name, startYear: fixture.data.startYear },
          orderBy: { id: 'asc' },
        });

        const project = existingProject
          ? await tx.project.update({ where: { id: existingProject.id }, data: fixture.data })
          : await tx.project.create({ data: fixture.data });

        await tx.projectTopic.deleteMany({
          where: { projectId: project.id, topicId: { notIn: fixture.topicIds } },
        });

        await tx.projectTopic.createMany({
          data: fixture.topicIds.map((topicId) => ({ projectId: project.id, topicId })),
          skipDuplicates: true,
        });

        for (const [year, beneficiaries] of Object.entries(fixture.beneficiariesByYear)) {
          const beneficiaryData = { ...beneficiaries, authorId: coordinator.id };

          await tx.projectBeneficiary.upsert({
            where: { projectId_year: { projectId: project.id, year: Number(year) } },
            update: beneficiaryData,
            create: { projectId: project.id, year: Number(year), ...beneficiaryData },
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
