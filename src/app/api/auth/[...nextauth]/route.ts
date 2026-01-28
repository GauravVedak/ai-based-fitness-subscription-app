import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { getDb } from "../../../../lib/mongodb";

const providers: any[] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) {
  providers.push(
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: {
        id: process.env.APPLE_KEY_ID,
        secret: process.env.APPLE_PRIVATE_KEY,
        issuer: process.env.APPLE_TEAM_ID,
      } as any,
    })
  );
}

const handler = NextAuth({
  providers,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const db = await getDb("Users");
        const col = db.collection("userdata");
        const email = (user as any).email;
        if (!email) return false;
        await col.updateOne(
          { email },
          {
            $set: {
              name: user.name || profile?.name || "",
              email,
              provider: account?.provider,
              updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date(), fitnessMetrics: {} },
          },
          { upsert: true }
        );
        return true;
      } catch (err) {
        if (process.env.NODE_ENV !== "production") console.error("NextAuth signIn callback error:", err);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.user = { name: user.name, email: (user as any).email };
      }
      return token;
    },

    async session({ session, token }) {
      if (token && (token as any).user) {
        (session as any).user = (token as any).user;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
