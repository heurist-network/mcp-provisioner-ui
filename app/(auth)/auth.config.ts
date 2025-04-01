import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnChat = nextUrl.pathname.startsWith('/');
      const isOnRegister = nextUrl.pathname.startsWith('/register');
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnApi = nextUrl.pathname.startsWith('/api');
      const isOnAgentsApi = nextUrl.pathname.startsWith('/api/agents');

      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      if (isOnRegister || isOnLogin) {
        return true; // Always allow access to register and login pages
      }

      // Allow unauthenticated users to view the chat page
      if (isOnChat && !isOnApi) {
        return true;
      }

      // Allow unauthenticated users to view the /api/agents 路由
      if (isOnAgentsApi) {
        return true;
      }

      // 其他 API 路由仍然需要认证
      if (isOnApi) {
        if (isLoggedIn) return true;
        return isLoggedIn;
      }

      if (isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
