import { User } from '@/generated/prisma/client';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export async function verifyUserCredentials(email: string, password: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.deletedAt || user.status !== 'active' || !user.passwordHash) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  return isPasswordValid ? user : null;
}

export function toAuthUser(user: User) {
  return {
    id: String(user.id),
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
  };
}
