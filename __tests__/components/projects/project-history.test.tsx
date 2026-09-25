import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { ProjectHistory } from '@/components/projects/form/project-history';
import type { AuditAction } from '@/generated/prisma/enums';

function entry(id: number, action: AuditAction) {
  return {
    id,
    action,
    occurredAt: new Date('2026-09-18T12:00:00Z'),
    author: { firstName: 'Test', lastName: 'User' },
  };
}

it('displays project events without showing password audit events', () => {
  render(
    <ProjectHistory
      entries={[
        entry(1, 'creation'),
        entry(2, 'update'),
        entry(3, 'deletion'),
        entry(4, 'passwordChange'),
        entry(5, 'passwordReset'),
      ]}
    />
  );
  expect(screen.getAllByRole('listitem')).toHaveLength(3);
  expect(screen.getByText('Test User creó el proyecto')).toBeDefined();
  expect(screen.getByText('Test User actualizó el proyecto')).toBeDefined();
  expect(screen.getByText('Test User eliminó el proyecto')).toBeDefined();
});

it('shows the empty state when there are no project audit events', () => {
  render(<ProjectHistory entries={[entry(1, 'passwordChange')]} />);
  expect(screen.getByText('Todavía no hay modificaciones registradas.')).toBeDefined();
  expect(screen.queryByRole('list')).toBeNull();
});
