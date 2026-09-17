import NextAuth from 'next-auth';
import { encode } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import { toAuthUser, verifyUserCredentials } from './lib/credentials';
import prisma from './lib/prisma';

const SESSION_MAX_AGE = 12 * 60 * 60; // 12 hours
const REMEMBER_ME_MAX_AGE = 30* 24 * 60 * 60

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: REMEMBER_ME_MAX_AGE, // cookie ceiling; jwt.encode sets the real maxAge of the session
    updateAge: 0,
  },
  jwt: {
    encode: async ({ token, secret, salt}) =>
      encode({
        token,
        secret,
        salt,
        maxAge: token?.remember ? REMEMBER_ME_MAX_AGE : SESSION_MAX_AGE,
      }),
  },
  providers: [
    Credentials({
      credentials: {
        documentId: {},
        password: {},
        remember: {},
      },
      authorize: async (credentials) => {
        const documentId = credentials?.documentId;
        const password = credentials?.password;

        if (typeof documentId !== 'string' || typeof password !== 'string') {
          return null;
        }

        const user = await verifyUserCredentials(documentId, password);

        return user ? { ...toAuthUser(user), remember: credentials?.remember === 'true' } : null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.remember = user.remember;
        return token;
      }

      if (!token.sub || !token.iat) {
        return token;
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: Number(token.sub) },
        select: { passwordChangedAt: true },
      });

      if (
        currentUser?.passwordChangedAt &&
        currentUser.passwordChangedAt.getTime() > token.iat * 1000
      ) {
        return null;
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
