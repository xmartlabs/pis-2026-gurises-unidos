import { describe, expect, test } from 'vitest';
import { makeUser } from '../../fixtures/user';
import {
  compareUsers,
  formatLastAccess,
  formatUserCount,
  fullName,
  matchesFilters,
} from '@/lib/users/format';

describe('fullName', () => {
  test('joins first and last name', () => {
    expect(fullName(makeUser({ firstName: 'Ada', lastName: 'Lovelace' }))).toBe('Ada Lovelace');
  });
});

describe('formatLastAccess', () => {
  test('returns "Nunca" when there is no last access', () => {
    expect(formatLastAccess(null)).toBe('Nunca');
  });

  test('formats the date as dd/mm/yyyy in the Montevideo timezone', () => {
    expect(formatLastAccess(new Date('2026-03-05T12:00:00.000Z'))).toBe('05/03/2026');
  });
});

describe('formatUserCount', () => {
  test('returns a specific message for zero results', () => {
    expect(formatUserCount(0)).toBe('No hay resultados');
  });

  test('uses singular for one result', () => {
    expect(formatUserCount(1)).toBe('1 usuario');
  });

  test('uses plural for more than one result', () => {
    expect(formatUserCount(5)).toBe('5 usuarios');
  });
});

describe('matchesFilters', () => {
  const user = makeUser({
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    role: 'admin',
    status: 'active',
  });

  test('matches when search, role and status filters are "all"/empty', () => {
    expect(matchesFilters(user, { search: '', roleFilter: 'all', statusFilter: 'all' })).toBe(true);
  });

  test('matches by name search, case-insensitive', () => {
    expect(
      matchesFilters(user, { search: 'lovelace', roleFilter: 'all', statusFilter: 'all' })
    ).toBe(true);
  });

  test('matches by email search', () => {
    expect(
      matchesFilters(user, { search: 'ada@example', roleFilter: 'all', statusFilter: 'all' })
    ).toBe(true);
  });

  test('does not match when search term is not found', () => {
    expect(matchesFilters(user, { search: 'nobody', roleFilter: 'all', statusFilter: 'all' })).toBe(
      false
    );
  });

  test('does not match when role filter differs', () => {
    expect(
      matchesFilters(user, { search: '', roleFilter: 'coordinator', statusFilter: 'all' })
    ).toBe(false);
  });

  test('does not match when status filter differs', () => {
    expect(matchesFilters(user, { search: '', roleFilter: 'all', statusFilter: 'disabled' })).toBe(
      false
    );
  });
});

describe('compareUsers', () => {
  const alice = makeUser({
    firstName: 'Alice',
    lastName: 'Admin',
    role: 'admin',
    status: 'active',
  });
  const bob = makeUser({
    firstName: 'Bob',
    lastName: 'Coordinator',
    role: 'coordinator',
    status: 'disabled',
  });

  test('sorts by name', () => {
    expect(compareUsers(alice, bob, 'name')).toBeLessThan(0);
    expect(compareUsers(bob, alice, 'name')).toBeGreaterThan(0);
  });

  test('sorts by role label', () => {
    expect(compareUsers(alice, bob, 'role')).toBeLessThan(0);
  });

  test('sorts by status label', () => {
    expect(compareUsers(alice, bob, 'status')).toBeLessThan(0);
  });

  test('sorts by lastAccess, most recent first, missing dates last', () => {
    const withAccess = makeUser({ lastAccess: new Date('2026-02-01T00:00:00.000Z') });
    const withoutAccess = makeUser({ lastAccess: null });

    expect(compareUsers(withAccess, withoutAccess, 'lastAccess')).toBeLessThan(0);
    expect(compareUsers(withoutAccess, withAccess, 'lastAccess')).toBeGreaterThan(0);
  });
});
