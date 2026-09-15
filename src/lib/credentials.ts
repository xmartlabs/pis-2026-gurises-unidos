import type { User } from '@/generated/prisma/client';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

const DUMMY_PASSWORD_HASH = '$2b$10$qYzMcJ.E4lnDm6ffrfnKjuksp7QvpqWK1L476sVjmNEqsJyQMuz.O';

export async function verifyUserCredentials(
  documentId: string,
  password: string
): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { documentId: normalizeDocumentId(documentId) },
  });

  if (!user || user.deletedAt || user.status !== 'active') {
    // Compare against dummy password hash to avoid timing attacks
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
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
    role: user.role,
  };
}

/**
 * Normalize the document id by removing all spaces, dots and dashes
 * @example "4.123.456-7" -> "41234567"
 */
function normalizeDocumentId(documentId: string) {
  return documentId.replace(/[ .\-]/g, '');
}
