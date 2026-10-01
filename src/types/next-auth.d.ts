import type { DefaultSession } from 'next-auth';
import type { UserRole } from '@/generated/prisma/enums';

declare module 'next-auth' {
  interface User {
    role: UserRole;
    avatarColorIndex: number;
    remember?: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      avatarColorIndex: number;
      remember?: boolean;
    } & DefaultSession['user'];
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role: UserRole;
    avatarColorIndex: number;
    remember?: boolean;
  }
}
