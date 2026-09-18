import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ProjectFormState } from '@/lib/validation/project';

const { authMock, redirectMock, logAuditMock, transactionMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  redirectMock: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  logAuditMock: vi.fn(),
  transactionMock: vi.fn(),
}));

vi.mock('@/auth', () => ({ auth: authMock }));
vi.mock('next/navigation', () => ({ redirect: redirectMock }));
vi.mock('@/lib/audit-log', () => ({ logAudit: logAuditMock }));
vi.mock('@/lib/prisma', () => ({
  default: {
    $transaction: transactionMock,
    user: {
      findUnique: vi
        .fn()
        .mockResolvedValue({ id: 7, role: 'admin', status: 'active', deletedAt: null }),
    },
  },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { createProject } from '@/app/actions/projects';
import { Prisma } from '@/generated/prisma/client';

const EMPTY_STATE: ProjectFormState = {};

type FormDataInput = Record<string, string | undefined>;

const VALID_FIELDS: FormDataInput = {
  name: 'Community Center',
  status: 'active',
  intensity: 'high',
  startYear: '2020',
  leadCoordinatorId: '1',
  departmentId: '2',
  zone: 'city',
  localityNeighborhood: '',
  generalObjective: '',
  publicDescription: '',
  internalNotes: '',
  year: '2024',
  directChildrenAdolescents: '10',
  indirectChildrenAdolescents: '5',
  youth18To29: '3',
  families: '2',
  coordinatedInstitutions: '1',
  communityLeaders: '4',
  basicServiceStaff: '6',
};

function buildFormData(overrides: FormDataInput = {}): FormData {
  const fields = { ...VALID_FIELDS, ...overrides };
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      formData.append(key, value);
    }
  }
  return formData;
}

function setupTransaction({ projectId = 42, beneficiaryId = 9 } = {}) {
  const projectCreate = vi.fn().mockResolvedValue({ id: projectId });
  const beneficiaryCreate = vi.fn().mockResolvedValue({ id: beneficiaryId });

  transactionMock.mockImplementation(async (callback) =>
    callback({
      user: { findFirst: vi.fn().mockResolvedValue({ id: 1 }) },
      topic: { count: vi.fn().mockResolvedValue(0) },
      project: { create: projectCreate },
      projectBeneficiary: { create: beneficiaryCreate },
    })
  );

  return { projectCreate, beneficiaryCreate };
}

function knownRequestError(code: string, meta: Record<string, unknown>) {
  return new Prisma.PrismaClientKnownRequestError('Prisma request failed', {
    code,
    clientVersion: '6.19.3',
    meta,
  });
}

beforeEach(() => {
  authMock.mockResolvedValue({ user: { id: '7' } });
  redirectMock.mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  });
});

describe('createProject', () => {
  test('redirects to /login and skips the database when there is no session', async () => {
    authMock.mockResolvedValue(null);

    await expect(createProject(EMPTY_STATE, buildFormData())).rejects.toThrow(
      'NEXT_REDIRECT:/login'
    );

    expect(transactionMock).not.toHaveBeenCalled();
  });

  test('returns field errors and skips the database when the form is invalid', async () => {
    const result = await createProject(
      EMPTY_STATE,
      buildFormData({
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
    expect(transactionMock).not.toHaveBeenCalled();
  });

  test('creates the project and its beneficiary record in one transaction, then redirects', async () => {
    const { projectCreate, beneficiaryCreate } = setupTransaction();

    await expect(createProject(EMPTY_STATE, buildFormData())).rejects.toThrow(
      'NEXT_REDIRECT:/dashboard/projects/42'
    );

    expect(projectCreate).toHaveBeenCalledWith({
      data: {
        name: 'Community Center',
        status: 'active',
        intensity: 'high',
        startYear: 2020,
        leadCoordinatorId: 1,
        departmentId: 2,
        zone: 'city',
        localityNeighborhood: null,
        generalObjective: null,
        publicDescription: null,
        internalNotes: null,
        createdBy: 7,
        projectTopics: { create: [] },
      },
    });
    expect(beneficiaryCreate).toHaveBeenCalledWith({
      data: {
        year: 2024,
        directChildrenAdolescents: 10,
        indirectChildrenAdolescents: 5,
        youth18To29: 3,
        families: 2,
        coordinatedInstitutions: 1,
        communityLeaders: 4,
        basicServiceStaff: 6,
        projectId: 42,
        authorId: 7,
      },
    });
    expect(transactionMock).toHaveBeenCalledWith(expect.any(Function), {
      maxWait: 10_000,
      timeout: 30_000,
    });
    expect(logAuditMock).toHaveBeenNthCalledWith(1, expect.anything(), {
      authorId: 7,
      action: 'creation',
      entity: 'project',
      entityId: 42,
    });
    expect(logAuditMock).toHaveBeenNthCalledWith(2, expect.anything(), {
      authorId: 7,
      action: 'creation',
      entity: 'beneficiary',
      entityId: 9,
    });
  });

  test('defaults beneficiary counts to 0 and year to the current year when omitted', async () => {
    const { beneficiaryCreate } = setupTransaction();

    await expect(
      createProject(
        EMPTY_STATE,
        buildFormData({
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
    ).rejects.toThrow('NEXT_REDIRECT:/dashboard/projects/42');

    expect(beneficiaryCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        year: new Date().getFullYear(),
        directChildrenAdolescents: 0,
        indirectChildrenAdolescents: 0,
        youth18To29: 0,
        families: 0,
        coordinatedInstitutions: 0,
        communityLeaders: 0,
        basicServiceStaff: 0,
      }),
    });
  });

  test('reports a message when the coordinator or department foreign key is invalid', async () => {
    transactionMock.mockRejectedValue(
      knownRequestError('P2003', { field_name: 'Project_leadCoordinatorId_fkey (index)' })
    );

    const result = await createProject(EMPTY_STATE, buildFormData());

    expect(result).toEqual({
      formError: 'El coordinador o el departamento seleccionado no existe.',
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  test('reports an invalid session message for other foreign key violations', async () => {
    transactionMock.mockRejectedValue(
      knownRequestError('P2003', { field_name: 'Project_createdBy_fkey (index)' })
    );

    const result = await createProject(EMPTY_STATE, buildFormData());

    expect(result).toEqual({ formError: 'Tu sesión ya no es válida. Iniciá sesión de nuevo.' });
  });

  test('falls back to meta.constraint when field_name is absent', async () => {
    transactionMock.mockRejectedValue(
      knownRequestError('P2003', { constraint: 'Project_leadCoordinatorId_fkey' })
    );

    const result = await createProject(EMPTY_STATE, buildFormData());

    expect(result).toEqual({
      formError: 'El coordinador o el departamento seleccionado no existe.',
    });
  });

  test('reports a generic error message and logs unexpected failures', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const unexpectedError = new Error('connection lost');
    transactionMock.mockRejectedValue(unexpectedError);

    const result = await createProject(EMPTY_STATE, buildFormData());

    expect(result).toEqual({ formError: 'No se pudo crear el proyecto. Intentá de nuevo.' });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create project', unexpectedError);
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
