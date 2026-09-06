import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { toAuthUser, verifyUserCredentials } from './lib/credentials';
import prisma from './lib/prisma';

const SESSION_MAX_AGE = 12 * 60 * 60; // 12 hours

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE,
    updateAge: 0,
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== 'string' || typeof password !== 'string') {
          return null;
        }

        const user = await verifyUserCredentials(email, password);

        return user ? toAuthUser(user) : null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.id) {
        return;
      }

      try {
        await prisma.user.update({
          where: { id: Number(user.id) },
          data: { lastAccess: new Date() },
        });
      } catch (error) {
        console.error('Failed to record lastAccess', error);
      }
    },
  },
});
