import prisma from '@/lib/prisma';
import {
  E2E_ADMIN,
  E2E_COORDINATOR,
  E2E_DEPARTMENT,
  E2E_DISABLED_COORDINATOR,
} from '../prisma/e2e-fixtures';

const EXTRA_DEPARTMENT = 'Integration department';
const EXTRA_TOPICS = ['Integration topic A', 'Integration topic B', 'Integration topic C'];

export type SeedData = {
  adminId: number;
  coordinatorId: number;
  disabledCoordinatorId: number;
  departmentIds: number[];
  topicIds: number[];
};

async function userId(documentId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { documentId } });
  return user.id;
}

export async function loadSeedData(): Promise<SeedData> {
  const [adminId, coordinatorId, disabledCoordinatorId, seededDepartment] = await Promise.all([
    userId(E2E_ADMIN.documentId),
    userId(E2E_COORDINATOR.documentId),
    userId(E2E_DISABLED_COORDINATOR.documentId),
    prisma.department.findUniqueOrThrow({ where: { name: E2E_DEPARTMENT } }),
  ]);
  const extraDepartment = await prisma.department.create({ data: { name: EXTRA_DEPARTMENT } });
  const topicIds: number[] = [];
  for (const name of EXTRA_TOPICS) {
    topicIds.push((await prisma.topic.create({ data: { name } })).id);
  }
  return {
    adminId,
    coordinatorId,
    disabledCoordinatorId,
    departmentIds: [seededDepartment.id, extraDepartment.id],
    topicIds,
  };
}

export async function deleteExtraCatalogs() {
  await prisma.topic.deleteMany({ where: { name: { in: EXTRA_TOPICS } } });
  await prisma.department.deleteMany({ where: { name: EXTRA_DEPARTMENT } });
}
