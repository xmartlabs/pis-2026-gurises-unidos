import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { updateProject } from '@/app/actions/projects';
import prisma from '@/lib/prisma';
import { deleteExtraCatalogs, loadSeedData, type SeedData } from '../fixtures';
import { signInAs } from '../session';

const BENEFICIARY_YEAR = 2024;

let seed: SeedData;
let projectId: number;

function buildFormData(overrides: Record<string, string | string[]> = {}): FormData {
  const fields: Record<string, string | string[]> = {
    name: 'Project under edit',
    status: 'active',
    intensity: 'high',
    startYear: '2020',
    leadCoordinatorId: String(seed.coordinatorId),
    departmentId: String(seed.departmentIds[0]),
    zone: 'rural',
    localityNeighborhood: 'Barrio Sur',
    generalObjective: 'Objective',
    publicDescription: '',
    internalNotes: '',
    topicIds: seed.topicIds.slice(0, 2).map(String),
    year: String(BENEFICIARY_YEAR),
    directChildrenAdolescents: '10',
    indirectChildrenAdolescents: '5',
    youth18To29: '3',
    families: '2',
    coordinatedInstitutions: '1',
    communityLeaders: '4',
    basicServiceStaff: '6',
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    for (const item of [value].flat()) formData.append(key, item);
  }
  return formData;
}

async function createProjectFixture(leadCoordinatorId = seed.coordinatorId) {
  const project = await prisma.project.create({
    data: {
      name: 'Project under edit',
      status: 'active',
      intensity: 'high',
      startYear: 2020,
      leadCoordinatorId,
      departmentId: seed.departmentIds[0],
      zone: 'rural',
      localityNeighborhood: 'Barrio Sur',
      generalObjective: 'Objective',
      createdBy: seed.adminId,
      projectTopics: { create: seed.topicIds.slice(0, 2).map((topicId) => ({ topicId })) },
      projectBeneficiaries: {
        create: {
          year: BENEFICIARY_YEAR,
          directChildrenAdolescents: 10,
          indirectChildrenAdolescents: 5,
          youth18To29: 3,
          families: 2,
          coordinatedInstitutions: 1,
          communityLeaders: 4,
          basicServiceStaff: 6,
          authorId: seed.adminId,
        },
      },
    },
  });
  return project.id;
}

async function deleteProject(id: number) {
  const beneficiaryIds = (
    await prisma.projectBeneficiary.findMany({ where: { projectId: id }, select: { id: true } })
  ).map((beneficiary) => beneficiary.id);
  await prisma.$transaction([
    prisma.auditLog.deleteMany({
      where: {
        OR: [
          { entity: 'project', entityId: id },
          { entity: 'beneficiary', entityId: { in: beneficiaryIds } },
        ],
      },
    }),
    prisma.projectTopic.deleteMany({ where: { projectId: id } }),
    prisma.projectBeneficiary.deleteMany({ where: { projectId: id } }),
    prisma.project.deleteMany({ where: { id } }),
  ]);
}

function loadProject(id: number) {
  return prisma.project.findUniqueOrThrow({
    where: { id },
    include: {
      projectTopics: { orderBy: { topicId: 'asc' } },
      projectBeneficiaries: { orderBy: { year: 'asc' } },
    },
  });
}

async function auditLogsFor(id: number) {
  const beneficiaryIds = (
    await prisma.projectBeneficiary.findMany({ where: { projectId: id }, select: { id: true } })
  ).map((beneficiary) => beneficiary.id);
  return prisma.auditLog.findMany({
    where: {
      OR: [
        { entity: 'project', entityId: id },
        { entity: 'beneficiary', entityId: { in: beneficiaryIds } },
      ],
    },
    orderBy: { id: 'asc' },
  });
}

async function expectRedirectToProject(result: Promise<unknown>, id: number) {
  await expect(result).rejects.toThrow(`NEXT_REDIRECT:/dashboard/projects/${id}`);
}

beforeAll(async () => {
  seed = await loadSeedData();
});

afterAll(async () => {
  await deleteExtraCatalogs();
});

beforeEach(async () => {
  projectId = await createProjectFixture();
});

afterEach(async () => {
  await deleteProject(projectId);
});

describe('updateProject (integration)', () => {
  test('persists changed fields and topics and audits only what changed', async () => {
    signInAs(seed.adminId);
    const newTopicIds = seed.topicIds.slice(1, 3);

    await expectRedirectToProject(
      updateProject(
        projectId,
        {},
        buildFormData({
          name: 'Renamed project',
          zone: 'city',
          departmentId: String(seed.departmentIds[1]),
          topicIds: newTopicIds.map(String),
        })
      ),
      projectId
    );

    const project = await loadProject(projectId);
    expect(project).toMatchObject({
      name: 'Renamed project',
      zone: 'city',
      departmentId: seed.departmentIds[1],
      status: 'active',
      startYear: 2020,
    });
    expect(project.projectTopics.map(({ topicId }) => topicId)).toEqual(newTopicIds);
    expect(await auditLogsFor(projectId)).toEqual([
      expect.objectContaining({
        entity: 'project',
        action: 'update',
        authorId: seed.adminId,
        details: { changedFields: ['name', 'departmentId', 'zone', 'topicIds'] },
      }),
    ]);
  });

  test('writes nothing when the submitted form matches the stored project', async () => {
    signInAs(seed.adminId);
    const before = await loadProject(projectId);

    await expectRedirectToProject(updateProject(projectId, {}, buildFormData()), projectId);

    expect(await loadProject(projectId)).toEqual(before);
    expect(await auditLogsFor(projectId)).toEqual([]);
  });

  test('updates the beneficiaries of an existing year in place', async () => {
    signInAs(seed.adminId);

    await expectRedirectToProject(
      updateProject(projectId, {}, buildFormData({ families: '7', youth18To29: '9' })),
      projectId
    );

    const { projectBeneficiaries } = await loadProject(projectId);
    expect(projectBeneficiaries).toEqual([
      expect.objectContaining({ year: BENEFICIARY_YEAR, families: 7, youth18To29: 9 }),
    ]);
    expect(await auditLogsFor(projectId)).toEqual([
      expect.objectContaining({
        entity: 'beneficiary',
        action: 'update',
        entityId: projectBeneficiaries[0].id,
        details: { year: BENEFICIARY_YEAR, changedFields: ['youth18To29', 'families'] },
      }),
    ]);
  });

  test('adds a beneficiary row for a new year and keeps the previous one', async () => {
    signInAs(seed.adminId);

    await expectRedirectToProject(
      updateProject(projectId, {}, buildFormData({ year: '2025', families: '20' })),
      projectId
    );

    const { projectBeneficiaries } = await loadProject(projectId);
    expect(projectBeneficiaries).toEqual([
      expect.objectContaining({ year: BENEFICIARY_YEAR, families: 2 }),
      expect.objectContaining({ year: 2025, families: 20, authorId: seed.adminId }),
    ]);
    expect(await auditLogsFor(projectId)).toEqual([
      expect.objectContaining({
        entity: 'beneficiary',
        action: 'creation',
        entityId: projectBeneficiaries[1].id,
      }),
    ]);
  });

  test('lets the lead coordinator edit their own project', async () => {
    signInAs(seed.coordinatorId);

    await expectRedirectToProject(
      updateProject(projectId, {}, buildFormData({ name: 'Edited by coordinator' })),
      projectId
    );

    expect((await loadProject(projectId)).name).toBe('Edited by coordinator');
    expect(await auditLogsFor(projectId)).toEqual([
      expect.objectContaining({ entity: 'project', authorId: seed.coordinatorId }),
    ]);
  });

  test('rejects a coordinator who does not lead the project', async () => {
    await deleteProject(projectId);
    projectId = await createProjectFixture(seed.disabledCoordinatorId);
    signInAs(seed.coordinatorId);
    const before = await loadProject(projectId);

    const result = await updateProject(
      projectId,
      {},
      buildFormData({
        name: 'Hijacked',
        leadCoordinatorId: String(seed.disabledCoordinatorId),
      })
    );

    expect(result.formError).toBe('No tenés permiso para editar este proyecto.');
    expect(await loadProject(projectId)).toEqual(before);
    expect(await auditLogsFor(projectId)).toEqual([]);
  });

  test('keeps a lead coordinator who was disabled after being assigned', async () => {
    await deleteProject(projectId);
    projectId = await createProjectFixture(seed.disabledCoordinatorId);
    signInAs(seed.adminId);

    await expectRedirectToProject(
      updateProject(
        projectId,
        {},
        buildFormData({
          name: 'Still led by disabled',
          leadCoordinatorId: String(seed.disabledCoordinatorId),
        })
      ),
      projectId
    );

    expect(await loadProject(projectId)).toMatchObject({
      name: 'Still led by disabled',
      leadCoordinatorId: seed.disabledCoordinatorId,
    });
  });

  test('rejects switching to a disabled lead coordinator', async () => {
    signInAs(seed.adminId);
    const before = await loadProject(projectId);

    const result = await updateProject(
      projectId,
      {},
      buildFormData({ leadCoordinatorId: String(seed.disabledCoordinatorId) })
    );

    expect(result.errors?.leadCoordinatorId).toEqual(['Elegí un coordinador válido']);
    expect(await loadProject(projectId)).toEqual(before);
  });

  test('rejects an unknown topic without touching the project', async () => {
    signInAs(seed.adminId);
    const before = await loadProject(projectId);
    const unknownTopicId = Math.max(0, ...seed.topicIds) + 1000;

    const result = await updateProject(
      projectId,
      {},
      buildFormData({ name: 'Should not persist', topicIds: [String(unknownTopicId)] })
    );

    expect(result.errors?.topicIds).toEqual(['Elegí temáticas válidas']);
    expect(await loadProject(projectId)).toEqual(before);
  });

  test('rolls back every change when the department does not exist', async () => {
    signInAs(seed.adminId);
    const before = await loadProject(projectId);

    const result = await updateProject(
      projectId,
      {},
      buildFormData({ name: 'Should not persist', departmentId: '999999', families: '99' })
    );

    expect(result.formError).toBe('El coordinador o el departamento seleccionado no existe.');
    expect(await loadProject(projectId)).toEqual(before);
    expect(await auditLogsFor(projectId)).toEqual([]);
  });

  test('reports a project that does not exist', async () => {
    signInAs(seed.adminId);

    const result = await updateProject(999_999, {}, buildFormData());

    expect(result.formError).toBe('El proyecto no existe o fue eliminado.');
  });

  test('rejects an invalid project id', async () => {
    signInAs(seed.adminId);

    const result = await updateProject(0, {}, buildFormData());

    expect(result.formError).toBe('El proyecto no es válido.');
  });

  test('redirects to login when the session user is not active', async () => {
    signInAs(seed.disabledCoordinatorId);
    const before = await loadProject(projectId);

    await expect(
      updateProject(projectId, {}, buildFormData({ name: 'Should not persist' }))
    ).rejects.toThrow('NEXT_REDIRECT:/login');
    expect(await loadProject(projectId)).toEqual(before);
  });
});
