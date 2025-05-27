import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma"; // Import Prisma client
import bcrypt from "bcryptjs"; // Import bcryptjs

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "tu@ejemplo.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          // User not found
          throw new Error("No se encontró un usuario con ese email.");
        }

        // Validate password
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password // Assuming user.password is the hashed password from your DB
        );

        if (!isValidPassword) {
          throw new Error("Contraseña incorrecta.");
        }

        // Return user object if everything is fine
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          // Add any other user properties you want in the JWT/session
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // This callback is called whenever a JWT is created or updated.
      // `user` is only available the first time a user signs in.
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        // Add any other properties from the user object you want in the token
      }
      return token;
    },
    async session({ session, token }) {
      // This callback is called whenever a session is checked.
      // `token` contains the data from the `jwt` callback.
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).email = token.email; // Ensure email is passed
        (session.user as any).name = token.name; // Ensure name is passed
        // Add any other properties you want in the session
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Use the existing login page
    // error: '/auth/error', // Custom error page (optional)
  },
  // Ensure NEXTAUTH_SECRET is set in your .env.local file
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
