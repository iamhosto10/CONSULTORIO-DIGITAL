import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnPublicRoute = ['/login', '/register'].includes(nextUrl.pathname);

      if (isOnPublicRoute) return true;

      if (isLoggedIn) return true;

      return false;
    },
    jwt({ token, user }) {
      if (user) {
        token.id =
          (user as { _id?: string } & typeof user)._id?.toString() ||
          user.id ||
          '';
        token.especialidad = user.especialidad;
        token.registroMedico = user.registroMedico;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.especialidad = token.especialidad;
        session.user.registroMedico = token.registroMedico;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
