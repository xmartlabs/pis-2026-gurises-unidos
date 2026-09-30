import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ProjectForm } from '@/components/projects/form/project-form';
import { notify } from '@/lib/notify';

const { routerPushMock, routerRefreshMock } = vi.hoisted(() => ({
  routerPushMock: vi.fn(),
  routerRefreshMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPushMock, refresh: routerRefreshMock }),
}));

vi.mock('@/lib/notify', () => ({
  notify: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    promise: vi.fn(),
  },
}));

it('submits prefilled values and the recorded year, preserves edits on failure, and allows retry', async () => {
  routerPushMock.mockClear();
  vi.mocked(notify.error).mockClear();
  const submitAction = vi.fn().mockResolvedValue({ formError: 'No se pudo guardar' });
  const { container } = render(
    <ProjectForm
      topics={[]}
      currentYear={2026}
      mode="edit"
      coordinators={[{ id: 2, firstName: 'Test', lastName: 'Coordinator' }]}
      departments={[{ id: 3, name: 'Montevideo' }]}
      initialValues={{
        name: 'Existing project',
        status: 'paused',
        leadCoordinatorId: '2',
        departmentId: '3',
        startYear: '2020',
        year: '2024',
        families: '30',
      }}
      submitAction={submitAction}
      cancelHref="/dashboard/projects/10"
    />
  );
  expect((screen.getByLabelText('Nombre del proyecto') as HTMLInputElement).value).toBe(
    'Existing project'
  );
  expect((screen.getByLabelText('Familias') as HTMLInputElement).value).toBe('30');
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(routerPushMock).toHaveBeenCalledWith('/dashboard/projects/10');
  fireEvent.change(screen.getByLabelText('Nombre del proyecto'), {
    target: { value: 'Edited project' },
  });
  await act(async () => {
    fireEvent.submit(container.querySelector('form')!);
  });
  await waitFor(() => {
    expect(notify.error).toHaveBeenCalledWith({ title: 'No se pudo guardar' });
  });
  expect(submitAction).toHaveBeenCalledTimes(1);
  const submitted = submitAction.mock.calls[0][1] as FormData;
  expect(submitted.get('name')).toBe('Edited project');
  expect(submitted.get('year')).toBe('2024');
  expect(submitted.get('status')).toBe('paused');
  expect(submitted.get('families')).toBe('30');
  expect((screen.getByLabelText('Nombre del proyecto') as HTMLInputElement).value).toBe(
    'Edited project'
  );
  expect(Object.fromEntries(new FormData(container.querySelector('form')!))).toEqual(
    Object.fromEntries(submitted)
  );
  await act(async () => {
    fireEvent.submit(container.querySelector('form')!);
  });
  expect(submitAction).toHaveBeenCalledTimes(2);
  expect(Object.fromEntries(submitAction.mock.calls[1][1] as FormData)).toEqual(
    Object.fromEntries(submitted)
  );
});

it('keeps the original creation appearance separate from edit styling', () => {
  const { container } = render(
    <ProjectForm
      topics={[]}
      currentYear={2026}
      coordinators={[]}
      departments={[]}
      submitAction={vi.fn()}
    />
  );
  expect(container.querySelector('form')?.classList.contains('bg-muted/30')).toBe(true);
  expect(screen.queryByText('Cobertura')).toBeNull();
  expect(screen.queryByText('Ver vista pública →')).toBeNull();
  expect(screen.getByLabelText('Nombre del proyecto').classList.contains('md:text-sm')).toBe(true);
  expect(
    screen.getByLabelText('Foto de portada').closest('[data-slot="field"]')?.hasAttribute('hidden')
  ).toBe(true);
  expect(
    screen
      .getByText('Información básica')
      .closest('[data-slot="card"]')
      ?.classList.contains('ring-1')
  ).toBe(true);
  expect(screen.queryByRole('button', { name: 'Guardar borrador' })).toBeNull();
});

it('shows and submits the selected project placeholder during creation', () => {
  const { container } = render(
    <ProjectForm
      topics={[]}
      currentYear={2026}
      coordinators={[]}
      departments={[]}
      initialValues={{ coverPhotoUrl: '/images/project-placeholders/2.webp' }}
      submitAction={vi.fn()}
    />
  );

  expect(container.querySelector('img')?.getAttribute('src')).toContain(
    'project-placeholders%2F2.webp'
  );
  expect(new FormData(container.querySelector('form')!).get('projectPlaceholder')).toBe(
    '/images/project-placeholders/2.webp'
  );
});

it('sends one selected topic and preserves it after a failed save', async () => {
  const submitAction = vi.fn().mockResolvedValue({ formError: 'No se pudo guardar' });
  const { container } = render(
    <ProjectForm
      currentYear={2026}
      topics={[
        { id: 1, name: 'Education' },
        { id: 2, name: 'Health' },
      ]}
      coordinators={[{ id: 2, firstName: 'Test', lastName: 'Coordinator' }]}
      departments={[{ id: 3, name: 'Montevideo' }]}
      initialValues={{
        name: 'Project',
        leadCoordinatorId: '2',
        departmentId: '3',
        topicId: '1',
      }}
      submitAction={submitAction}
    />
  );
  await act(async () => {
    fireEvent.submit(container.querySelector('form')!);
  });
  expect(submitAction.mock.calls[0][1].getAll('topicId')).toEqual(['1']);
  expect(screen.getByLabelText('Temática').textContent).toContain('Education');
  fireEvent.click(screen.getByLabelText('Temática'));
  fireEvent.keyDown(await screen.findByRole('option', { name: 'Health' }), { key: 'Enter' });
  await act(async () => {
    fireEvent.submit(container.querySelector('form')!);
  });
  expect(submitAction.mock.calls[1][1].getAll('topicId')).toEqual(['2']);
  expect(screen.getByLabelText('Temática').textContent).toContain('Health');
  fireEvent.click(screen.getByLabelText('Temática'));
  fireEvent.keyDown(await screen.findByRole('option', { name: 'Sin temática' }), { key: 'Enter' });
  await act(async () => {
    fireEvent.submit(container.querySelector('form')!);
  });
  expect(submitAction.mock.calls[2][1].getAll('topicId')).toEqual(['']);
});

function renderFormWith(initialValues: Record<string, string>) {
  return render(
    <ProjectForm
      topics={[]}
      currentYear={2026}
      coordinators={[{ id: 2, firstName: 'Test', lastName: 'Coordinator' }]}
      departments={[{ id: 3, name: 'Montevideo' }]}
      initialValues={{
        name: 'Project',
        leadCoordinatorId: '2',
        departmentId: '3',
        ...initialValues,
      }}
      submitAction={vi.fn()}
    />
  );
}

it('disables the end year unless the project is closed', () => {
  renderFormWith({ status: 'active' });
  expect((screen.getByLabelText('Año de fin') as HTMLButtonElement).disabled).toBe(true);
  cleanup();
  renderFormWith({ status: 'closed', startYear: '2020', endYear: '2022' });
  const endYear = screen.getByLabelText('Año de fin') as HTMLButtonElement;
  expect(endYear.disabled).toBe(false);
  expect(endYear.textContent).toContain('2022');
});

it('submits the end year of a closed project', async () => {
  const submitAction = vi.fn().mockResolvedValue({});
  const { container } = render(
    <ProjectForm
      topics={[]}
      currentYear={2026}
      coordinators={[{ id: 2, firstName: 'Test', lastName: 'Coordinator' }]}
      departments={[{ id: 3, name: 'Montevideo' }]}
      initialValues={{
        name: 'Project',
        leadCoordinatorId: '2',
        departmentId: '3',
        status: 'closed',
        startYear: '2020',
        endYear: '2022',
      }}
      submitAction={submitAction}
    />
  );
  await act(async () => {
    fireEvent.submit(container.querySelector('form')!);
  });
  expect(submitAction.mock.calls[0][1].get('endYear')).toBe('2022');
});

it('refreshes the topic list after a selected topic becomes invalid', async () => {
  const submitAction = vi.fn().mockResolvedValue({
    errors: { topicId: ['Elegí una temática válida'] },
  });
  const { container } = render(
    <ProjectForm
      currentYear={2026}
      topics={[{ id: 1, name: 'Education' }]}
      coordinators={[{ id: 2, firstName: 'Test', lastName: 'Coordinator' }]}
      departments={[{ id: 3, name: 'Montevideo' }]}
      initialValues={{
        name: 'Project',
        leadCoordinatorId: '2',
        departmentId: '3',
        topicId: '1',
      }}
      submitAction={submitAction}
    />
  );
  await act(async () => {
    fireEvent.submit(container.querySelector('form')!);
  });

  expect(routerRefreshMock).toHaveBeenCalledOnce();
});
