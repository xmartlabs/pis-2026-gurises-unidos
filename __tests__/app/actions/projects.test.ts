import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createProject, updateProject } from '@/app/actions/projects';
import { Prisma } from '@/generated/prisma/client';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
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
vi.mock('@/lib/prisma', () => ({ default: { $transaction: mocks.transaction } }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));

const TX = {
  project: { create: mocks.createProject, update: mocks.updateProject },
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
  mocks.auth.mockResolvedValue({ user: { id: '7' } });
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
        data: { authorId: 7, action: 'update', entity: 'project', entityId: 10 },
      });
      expect(mocks.audit).toHaveBeenNthCalledWith(2, {
        data: {
          authorId: 7,
          action: exists ? 'update' : 'creation',
          entity: 'beneficiary',
          entityId: 20,
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
