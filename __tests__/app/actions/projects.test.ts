import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createProject, updateProject } from '@/app/actions/projects';
import { Prisma } from '@/generated/prisma/client';
import {
  projectFormSchema,
  readProjectFormData,
  splitProjectFormData,
} from '@/lib/validation/project-form';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findUser: vi.fn(),
  findCoordinator: vi.fn(),
  findProject: vi.fn(),
  countTopics: vi.fn(),
  transaction: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  createBeneficiary: vi.fn(),
  findBeneficiary: vi.fn(),
  upsertBeneficiary: vi.fn(),
  audit: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@/auth', () => ({ auth: mocks.auth }));
vi.mock('@/lib/prisma', () => ({
  default: { $transaction: mocks.transaction, user: { findUnique: mocks.findUser } },
}));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));

const TX = {
  project: {
    create: mocks.createProject,
    update: mocks.updateProject,
    findUnique: mocks.findProject,
  },
  user: { findFirst: mocks.findCoordinator },
  topic: { count: mocks.countTopics },
  projectBeneficiary: {
    create: mocks.createBeneficiary,
    findUnique: mocks.findBeneficiary,
    upsert: mocks.upsertBeneficiary,
  },
  auditLog: { create: mocks.audit },
};
const VALID_DATA = {
  name: '  Updated project  ',
  status: 'inProgress',
  intensity: 'medium',
  startYear: '2019',
  leadCoordinatorId: '2',
  departmentId: '3',
  zone: 'city',
  localityNeighborhood: 'Neighborhood',
  generalObjective: 'Objective',
  publicDescription: 'Description',
  internalNotes: 'Team notes',
  year: '2024',
  directChildrenAdolescents: '42',
  indirectChildrenAdolescents: '68',
  youth18To29: '15',
  families: '30',
  coordinatedInstitutions: '6',
  communityLeaders: '12',
  basicServiceStaff: '8',
};

function formData(overrides: Record<string, string | undefined> = {}) {
  const data = new FormData();
  Object.entries({ ...VALID_DATA, ...overrides }).forEach(([key, value]) => {
    if (value !== undefined) data.set(key, value);
  });
  return data;
}

function databaseError(code: string, meta?: Record<string, unknown>) {
  return new Prisma.PrismaClientKnownRequestError('Database error', {
    code,
    clientVersion: '6',
    meta,
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.auth.mockResolvedValue({ user: { id: '7', role: 'admin' } });
  mocks.findUser.mockResolvedValue({ id: 7, role: 'admin', status: 'active', deletedAt: null });
  mocks.findCoordinator.mockResolvedValue({ id: 2 });
  mocks.findProject.mockResolvedValue({ id: 10, leadCoordinatorId: 2, projectTopics: [] });
  mocks.countTopics.mockResolvedValue(0);
  mocks.redirect.mockImplementation((path: string) => {
    throw new Error(`Redirect: ${path}`);
  });
  mocks.transaction.mockImplementation(async (callback) => callback(TX));
  mocks.createProject.mockResolvedValue({ id: 10 });
  mocks.updateProject.mockResolvedValue({ id: 10 });
  mocks.createBeneficiary.mockResolvedValue({ id: 20 });
  mocks.findBeneficiary.mockResolvedValue({ id: 20 });
  mocks.upsertBeneficiary.mockResolvedValue({ id: 20 });
});

describe.each([
  ['createProject', (data: FormData) => createProject({}, data)],
  ['updateProject', (data: FormData) => updateProject(10, {}, data)],
] as const)('%s', (_name, submit) => {
  it('redirects unauthenticated users before accessing the database', async () => {
    mocks.auth.mockResolvedValue(null);
    await expect(submit(formData())).rejects.toThrow('Redirect: /login');
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it.each([
    ['name', ''],
    ['status', 'invalid'],
    ['departmentId', '0'],
    ['leadCoordinatorId', '0'],
    ['startYear', '1800'],
    ['year', '1800'],
    ['directChildrenAdolescents', '-1'],
    ['families', '1.5'],
    ['publicDescription', 'a'.repeat(301)],
  ])('rejects invalid %s before writing', async (field, value) => {
    const result = await submit(formData({ [field]: value }));
    expect(result.errors?.[field]?.length).toBeGreaterThan(0);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it.each(['leadCoordinatorId', 'departmentId'])(
    'handles an invalid %s reference',
    async (field) => {
      mocks.transaction.mockRejectedValue(databaseError('P2003', { field_name: field }));
      expect(await submit(formData())).toEqual({
        formError: 'El coordinador o el departamento seleccionado no existe.',
      });
      expect(mocks.redirect).not.toHaveBeenCalled();
    }
  );

  it('handles stale session references', async () => {
    mocks.transaction.mockRejectedValue(databaseError('P2003', { constraint: 'authorId' }));
    expect(await submit(formData())).toEqual({
      formError: 'Tu sesión ya no es válida. Iniciá sesión de nuevo.',
    });
  });

  it('returns an error without redirecting or revalidating when an audit write fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.audit.mockRejectedValue(new Error('Audit unavailable'));
    try {
      expect((await submit(formData())).formError).toBeDefined();
      expect(mocks.redirect).not.toHaveBeenCalled();
      expect(mocks.revalidatePath).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });
});

it('creates the project and beneficiaries with audit entries in one transaction', async () => {
  await expect(createProject({}, formData())).rejects.toThrow('Redirect: /dashboard/projects/10');
  expect(mocks.transaction).toHaveBeenCalledTimes(1);
  expect(mocks.createProject).toHaveBeenCalledWith({
    data: expect.objectContaining({ name: 'Updated project', createdBy: 7 }),
  });
  expect(mocks.createBeneficiary).toHaveBeenCalledWith({
    data: expect.objectContaining({ projectId: 10, year: 2024, authorId: 7, families: 30 }),
  });
  expect(mocks.audit).toHaveBeenCalledWith({
    data: { authorId: 7, action: 'creation', entity: 'project', entityId: 10 },
  });
  expect(mocks.audit).toHaveBeenCalledWith({
    data: { authorId: 7, action: 'creation', entity: 'beneficiary', entityId: 20 },
  });
});

describe('updateProject persistence', () => {
  it.each([0, -1, 1.5, NaN, Infinity, 2_147_483_648])(
    'rejects invalid project id %s',
    async (id) => {
      expect(await updateProject(id, {}, formData())).toEqual({
        formError: 'El proyecto no es válido.',
      });
      expect(mocks.transaction).not.toHaveBeenCalled();
    }
  );

  it('reports missing projects', async () => {
    mocks.updateProject.mockRejectedValue(databaseError('P2025'));
    expect(await updateProject(10, {}, formData())).toEqual({
      formError: 'El proyecto no existe o fue eliminado.',
    });
    expect(mocks.upsertBeneficiary).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    'saves project fields and beneficiary counts with existing record: %s',
    async (exists) => {
      mocks.findBeneficiary.mockResolvedValue(exists ? { id: 20 } : null);
      await expect(
        updateProject(10, {}, formData({ createdBy: '999', id: '999' }))
      ).rejects.toThrow('Redirect: /dashboard/projects/10');
      expect(mocks.updateProject).toHaveBeenCalledWith({
        where: { id: 10 },
        data: {
          name: 'Updated project',
          status: 'inProgress',
          intensity: 'medium',
          startYear: 2019,
          leadCoordinatorId: 2,
          departmentId: 3,
          zone: 'city',
          localityNeighborhood: 'Neighborhood',
          generalObjective: 'Objective',
          publicDescription: 'Description',
          internalNotes: 'Team notes',
        },
      });
      const counts = {
        year: 2024,
        directChildrenAdolescents: 42,
        indirectChildrenAdolescents: 68,
        youth18To29: 15,
        families: 30,
        coordinatedInstitutions: 6,
        communityLeaders: 12,
        basicServiceStaff: 8,
      };
      expect(mocks.upsertBeneficiary).toHaveBeenCalledWith({
        where: { projectId_year: { projectId: 10, year: 2024 } },
        create: { ...counts, projectId: 10, authorId: 7 },
        update: { ...counts, authorId: 7, recordedAt: expect.any(Date) },
      });
      expect(mocks.transaction).toHaveBeenCalledTimes(1);
      expect(mocks.transaction).toHaveBeenCalledWith(expect.any(Function), {
        maxWait: 10_000,
        timeout: 30_000,
      });
      expect(mocks.findBeneficiary).toHaveBeenCalledWith({
        where: { projectId_year: { projectId: 10, year: 2024 } },
      });
      expect(mocks.audit).toHaveBeenCalledTimes(2);
      expect(mocks.audit).toHaveBeenNthCalledWith(1, {
        data: {
          authorId: 7,
          action: 'update',
          entity: 'project',
          entityId: 10,
          details: { changedFields: expect.any(Array) },
        },
      });
      expect(mocks.audit).toHaveBeenNthCalledWith(2, {
        data: {
          authorId: 7,
          action: exists ? 'update' : 'creation',
          entity: 'beneficiary',
          entityId: 20,
          details: { year: 2024, changedFields: expect.any(Array) },
        },
      });
      expect(mocks.revalidatePath.mock.calls).toEqual([
        ['/dashboard/projects'],
        ['/dashboard/projects/10'],
        ['/dashboard/projects/10/edit'],
      ]);
    }
  );

  it('clears optional text and resets blank counts to zero', async () => {
    await expect(
      updateProject(
        10,
        {},
        formData({
          generalObjective: '',
          publicDescription: '',
          internalNotes: '',
          localityNeighborhood: '',
          families: '',
        })
      )
    ).rejects.toThrow('Redirect:');
    expect(mocks.updateProject).toHaveBeenCalledWith({
      where: { id: 10 },
      data: expect.objectContaining({
        generalObjective: null,
        publicDescription: null,
        internalNotes: null,
        localityNeighborhood: null,
      }),
    });
    expect(mocks.upsertBeneficiary).toHaveBeenCalledWith(
      expect.objectContaining({ update: expect.objectContaining({ families: 0 }) })
    );
  });

  it('returns specific field errors together without accessing the database', async () => {
    const result = await updateProject(
      10,
      {},
      formData({
        name: '   ',
        status: 'cancelled',
        startYear: '1988',
        leadCoordinatorId: '-50',
        families: '-5',
        year: '1900',
      })
    );

    expect(result.errors).toMatchObject({
      name: ['El nombre es obligatorio'],
      status: expect.any(Array),
      startYear: ['Año inválido'],
      leadCoordinatorId: ['Elegí un coordinador'],
      families: ['No puede ser negativo'],
      year: ['Año inválido'],
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it('defaults omitted counts to zero and the beneficiary year to the current year', async () => {
    const year = new Date().getFullYear();
    await expect(
      updateProject(
        10,
        {},
        formData({
          year: undefined,
          directChildrenAdolescents: undefined,
          indirectChildrenAdolescents: undefined,
          youth18To29: undefined,
          families: undefined,
          coordinatedInstitutions: undefined,
          communityLeaders: undefined,
          basicServiceStaff: undefined,
        })
      )
    ).rejects.toThrow('Redirect: /dashboard/projects/10');

    const counts = {
      year,
      directChildrenAdolescents: 0,
      indirectChildrenAdolescents: 0,
      youth18To29: 0,
      families: 0,
      coordinatedInstitutions: 0,
      communityLeaders: 0,
      basicServiceStaff: 0,
    };
    expect(mocks.findBeneficiary).toHaveBeenCalledWith({
      where: { projectId_year: { projectId: 10, year } },
    });
    expect(mocks.upsertBeneficiary).toHaveBeenCalledWith({
      where: { projectId_year: { projectId: 10, year } },
      create: { ...counts, projectId: 10, authorId: 7 },
      update: { ...counts, authorId: 7, recordedAt: expect.any(Date) },
    });
  });

  it.each(['transaction', 'upsertBeneficiary', 'audit'] as const)(
    'reports and logs unexpected %s failures without redirecting or revalidating',
    async (operation) => {
      const unexpectedError = new Error('Connection lost');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mocks[operation].mockRejectedValue(unexpectedError);

      try {
        expect(await updateProject(10, {}, formData())).toEqual({
          formError: 'No se pudo actualizar el proyecto. Intentá de nuevo.',
        });
        expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(
          'Failed to update project',
          unexpectedError
        );
        expect(mocks.redirect).not.toHaveBeenCalled();
        expect(mocks.revalidatePath).not.toHaveBeenCalled();
      } finally {
        consoleErrorSpy.mockRestore();
      }
    }
  );
});

function unchangedRecords() {
  const { projectData, beneficiaryData } = splitProjectFormData(
    projectFormSchema.parse(readProjectFormData(formData()))
  );
  mocks.findProject.mockResolvedValue({ id: 10, ...projectData, projectTopics: [] });
  mocks.findBeneficiary.mockResolvedValue({ id: 20, ...beneficiaryData });
}

describe('project review regressions', () => {
  it.each([
    { role: 'coordinator', id: 7 },
    { role: 'coordinator', id: 3 },
  ])('rejects an unrelated coordinator $id even with an admin JWT', async (user) => {
    mocks.findUser.mockResolvedValue({ ...user, status: 'active', deletedAt: null });
    expect(await updateProject(10, {}, formData())).toEqual({
      formError: 'No tenés permiso para editar este proyecto.',
    });
    expect(mocks.updateProject).not.toHaveBeenCalled();
    expect(mocks.upsertBeneficiary).not.toHaveBeenCalled();
    expect(mocks.audit).not.toHaveBeenCalled();
  });

  it('allows the current responsible coordinator', async () => {
    mocks.findUser.mockResolvedValue({
      id: 2,
      role: 'coordinator',
      status: 'active',
      deletedAt: null,
    });
    await expect(updateProject(10, {}, formData())).rejects.toThrow(
      'Redirect: /dashboard/projects/10'
    );
    expect(mocks.updateProject).toHaveBeenCalled();
  });

  it.each([
    null,
    { id: 7, role: 'admin', status: 'disabled', deletedAt: null },
    { id: 7, role: 'admin', status: 'active', deletedAt: new Date() },
  ])('rejects inactive or deleted session users', async (user) => {
    mocks.findUser.mockResolvedValue(user);
    await expect(updateProject(10, {}, formData())).rejects.toThrow('Redirect: /login');
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('reports a project missing before the update', async () => {
    mocks.findProject.mockResolvedValue(null);
    expect((await updateProject(10, {}, formData())).formError).toBe(
      'El proyecto no existe o fue eliminado.'
    );
    expect(mocks.updateProject).not.toHaveBeenCalled();
  });

  it('preserves the current coordinator without requiring its previous role', async () => {
    await expect(updateProject(10, {}, formData())).rejects.toThrow('Redirect:');
    expect(mocks.findCoordinator).toHaveBeenCalledWith({ where: { id: 2 }, select: { id: true } });
  });

  it.each([createProject.bind(null, {}), updateProject.bind(null, 10, {})])(
    'rejects invalid replacement coordinators before writing',
    async (submit) => {
      mocks.findCoordinator.mockResolvedValue(null);
      expect(await submit(formData({ leadCoordinatorId: '9' }))).toEqual({
        errors: { leadCoordinatorId: ['Elegí un coordinador válido'] },
      });
      expect(mocks.findCoordinator).toHaveBeenCalledWith({
        where: { id: 9, role: 'coordinator', status: 'active', deletedAt: null },
        select: { id: true },
      });
      expect(mocks.createProject).not.toHaveBeenCalled();
      expect(mocks.updateProject).not.toHaveBeenCalled();
      expect(mocks.upsertBeneficiary).not.toHaveBeenCalled();
    }
  );

  it('does not update timestamps or audit when normalized values are unchanged', async () => {
    unchangedRecords();
    await expect(updateProject(10, {}, formData())).rejects.toThrow('Redirect:');
    expect(mocks.updateProject).not.toHaveBeenCalled();
    expect(mocks.upsertBeneficiary).not.toHaveBeenCalled();
    expect(mocks.audit).not.toHaveBeenCalled();
  });

  it('audits only beneficiary changes with the year and changed fields', async () => {
    unchangedRecords();
    await expect(updateProject(10, {}, formData({ families: '31' }))).rejects.toThrow('Redirect:');
    expect(mocks.updateProject).not.toHaveBeenCalled();
    expect(mocks.audit).toHaveBeenCalledExactlyOnceWith({
      data: {
        authorId: 7,
        action: 'update',
        entity: 'beneficiary',
        entityId: 20,
        details: { year: 2024, changedFields: ['families'] },
      },
    });
  });

  it('creates the selected year without updating another year', async () => {
    unchangedRecords();
    mocks.findBeneficiary.mockResolvedValue(null);
    await expect(updateProject(10, {}, formData({ year: '2026' }))).rejects.toThrow('Redirect:');
    expect(mocks.upsertBeneficiary).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { projectId_year: { projectId: 10, year: 2026 } },
        create: expect.objectContaining({ year: 2026 }),
      })
    );
    expect(mocks.updateProject).not.toHaveBeenCalled();
  });

  it('saves multiple unique topics and audits a topic-only change', async () => {
    unchangedRecords();
    mocks.countTopics.mockResolvedValue(2);
    const data = formData();
    for (const id of ['4', '2', '4']) data.append('topicIds', id);
    await expect(updateProject(10, {}, data)).rejects.toThrow('Redirect:');
    expect(mocks.updateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectTopics: { deleteMany: {}, create: [{ topicId: 2 }, { topicId: 4 }] },
        }),
      })
    );
    expect(mocks.audit).toHaveBeenCalledExactlyOnceWith({
      data: {
        authorId: 7,
        action: 'update',
        entity: 'project',
        entityId: 10,
        details: { changedFields: ['topicIds'] },
      },
    });
    expect(mocks.upsertBeneficiary).not.toHaveBeenCalled();
  });

  it('creates topic relations in the same project write', async () => {
    mocks.countTopics.mockResolvedValue(2);
    const data = formData();
    data.append('topicIds', '2');
    data.append('topicIds', '4');
    await expect(createProject({}, data)).rejects.toThrow('Redirect:');
    expect(mocks.createProject).toHaveBeenCalledWith({
      data: expect.objectContaining({
        projectTopics: { create: [{ topicId: 2 }, { topicId: 4 }] },
      }),
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/dashboard/projects');
  });

  it('rejects a nonexistent topic before any writes', async () => {
    const data = formData();
    data.append('topicIds', '999');
    expect(await updateProject(10, {}, data)).toEqual({
      errors: { topicIds: ['Elegí temáticas válidas'] },
    });
    expect(mocks.updateProject).not.toHaveBeenCalled();
    expect(mocks.upsertBeneficiary).not.toHaveBeenCalled();
  });

  it('removes all topics when none are selected', async () => {
    const { projectData } = splitProjectFormData(
      projectFormSchema.parse(readProjectFormData(formData()))
    );
    mocks.findProject.mockResolvedValue({ ...projectData, projectTopics: [{ topicId: 2 }] });
    await expect(updateProject(10, {}, formData())).rejects.toThrow('Redirect:');
    expect(mocks.updateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ projectTopics: { deleteMany: {}, create: [] } }),
      })
    );
  });

  it('preserves topics regardless of ordering without audit', async () => {
    unchangedRecords();
    const { projectData } = splitProjectFormData(
      projectFormSchema.parse(readProjectFormData(formData()))
    );
    mocks.findProject.mockResolvedValue({
      ...projectData,
      projectTopics: [{ topicId: 4 }, { topicId: 2 }],
    });
    mocks.countTopics.mockResolvedValue(2);
    const data = formData();
    data.append('topicIds', '2');
    data.append('topicIds', '4');
    await expect(updateProject(10, {}, data)).rejects.toThrow('Redirect:');
    expect(mocks.updateProject).not.toHaveBeenCalled();
    expect(mocks.audit).not.toHaveBeenCalled();
  });

  it('ignores forged cover photo updates', async () => {
    await expect(
      updateProject(10, {}, formData({ coverPhoto: 'https://invalid.test/photo.png' }))
    ).rejects.toThrow('Redirect:');
    expect(mocks.updateProject.mock.calls[0][0].data).not.toHaveProperty('coverPhoto');
  });
});
