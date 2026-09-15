import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ProjectForm } from '@/components/project-form';

it('submits prefilled values and the recorded year, preserves edits on failure, and allows retry', async () => {
  const submitAction = vi.fn().mockResolvedValue({ formError: 'No se pudo guardar' });
  const { container } = render(
    <ProjectForm
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
  fireEvent.submit(container.querySelector('form')!);
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
  fireEvent.submit(container.querySelector('form')!);
  await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(2));
});

it('keeps the original creation appearance separate from edit styling', () => {
  const { container } = render(
    <ProjectForm coordinators={[]} departments={[]} submitAction={vi.fn()} />
  );
  expect(container.querySelector('form')?.classList.contains('bg-muted/30')).toBe(true);
  expect(screen.queryByText('Cobertura')).toBeNull();
  expect(screen.queryByText('Ver vista pública →')).toBeNull();
  expect(screen.getByLabelText('Nombre del proyecto').classList.contains('md:text-sm')).toBe(true);
  expect(
    screen.getByText('Clic para subir imagen (JPG, PNG, máx. 5MB)').closest('label')?.style
      .backgroundImage
  ).toBe('');
  expect(
    screen
      .getByText('Información básica')
      .closest('[data-slot="card"]')
      ?.classList.contains('ring-1')
  ).toBe(true);
  expect(
    screen
      .getByRole('button', { name: 'Guardar borrador' })
      .classList.contains('disabled:opacity-100')
  ).toBe(false);
});
