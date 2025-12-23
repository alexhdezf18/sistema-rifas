import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Enviamos los datos a TU Backend NestJS
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: "POST",
              body: JSON.stringify({
                email: credentials?.email,
                password: credentials?.password,
              }),
              headers: { "Content-Type": "application/json" },
            }
          );

          const user = await res.json();

          // 2. Si el backend responde con error o sin token, rechazamos
          if (!res.ok || !user.access_token) {
            return null;
          }

          // 3. Si todo bien, retornamos el objeto usuario + el token
          // (NextAuth guardará esto en la cookie encriptada)
          return {
            id: user.user.id || "1",
            name: user.user.name,
            email: user.user.email,
            accessToken: user.access_token, // Guardamos el token de NestJS
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // Estas funciones pasan el token de JWT a la sesión del navegador
    async jwt({ token, user }: any) {
      if (user) {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/login", // Si alguien intenta entrar a admin sin permiso, mándalo aquí
  },
});

export { handler as GET, handler as POST };
