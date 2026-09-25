import { act, fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ProjectForm } from '@/components/projects/form/project-form';

it('submits prefilled values and the recorded year, preserves edits on failure, and allows retry', async () => {
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
        status: 'inProgress',
        leadCoordinatorId: '2',
        departmentId: '3',
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
  expect(screen.getByText('Cancelar').getAttribute('href')).toBe('/dashboard/projects/10');
  fireEvent.change(screen.getByLabelText('Nombre del proyecto'), {
    target: { value: 'Edited project' },
  });
  await act(async () => {
    fireEvent.submit(container.querySelector('form')!);
  });
  await screen.findByRole('alert');
  expect(submitAction).toHaveBeenCalledTimes(1);
  const submitted = submitAction.mock.calls[0][1] as FormData;
  expect(submitted.get('name')).toBe('Edited project');
  expect(submitted.get('year')).toBe('2024');
  expect(submitted.get('status')).toBe('inProgress');
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
  expect((screen.getByLabelText('Foto de portada') as HTMLInputElement).disabled).toBe(true);
  expect(
    screen
      .getByText('Información básica')
      .closest('[data-slot="card"]')
      ?.classList.contains('ring-1')
  ).toBe(true);
  expect(screen.queryByRole('button', { name: 'Guardar borrador' })).toBeNull();
});

it('sends all checked topics and keeps them after a failed save', async () => {
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
        topicIds: ['1', '2'],
      }}
      submitAction={submitAction}
    />
  );
  await act(async () => {
    fireEvent.submit(container.querySelector('form')!);
  });
  expect(submitAction.mock.calls[0][1].getAll('topicIds')).toEqual(['1', '2']);
  expect((screen.getByLabelText('Education') as HTMLInputElement).checked).toBe(true);
  expect((screen.getByLabelText('Health') as HTMLInputElement).checked).toBe(true);
  fireEvent.click(screen.getByLabelText('Education'));
  expect(new FormData(container.querySelector('form')!).getAll('topicIds')).toEqual(['2']);
});
