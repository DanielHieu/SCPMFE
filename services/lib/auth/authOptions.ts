import { AuthOptions, DefaultSession, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req): Promise<User | null> {
        console.log("Authorization attempt for username:", credentials?.username);
        if (!credentials?.username || !credentials?.password) {
          console.log("Missing credentials, authorization failed");
          return null;
        }

        try {
          console.log(`Attempting to authorize with API: ${process.env.EXTERNAL_API_URL}/Owner/Authorize`);
          // POST /api/Owner/Login
          const loginRes = await fetch(`${process.env.EXTERNAL_API_URL}/Owner/Authorize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          if (!loginRes.ok) {
            console.error(
              "Login failed:",
              loginRes.status,
              await loginRes.text(),
            );

            return null;
          }

          console.log("Login response received, processing data");
          const loginData = await loginRes.json();

          if (loginData && loginData.accessToken) {
            console.log("Authorization successful for user:", loginData?.username);
            return {
              id: loginData?.id,
              name: loginData?.username,
              email: loginData?.email,
              // role: loginData?.role,
              accessToken: loginData?.accessToken,
            };
          } else {
            console.error("Login response missing expected data:", loginData);
            return null;
          }
        } catch (error) {
          console.error("Error during authorization", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
      }
      // TODO: Add logic here later to handle token refresh
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.accessToken = token.accessToken as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

declare module "next-auth" {
  interface Session {
    user: {
      id?: string | number | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string | number;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string | number;
  }
}
