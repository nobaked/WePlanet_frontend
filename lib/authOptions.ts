import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user, account }) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            provider: account?.provider,
            provider_id: account?.providerAccountId,
          }),
        });
      } catch (err) {
        console.error("DB保存失敗:", err);
      }
      return true;
    },

    async redirect({ url, baseUrl }) {
      // Googleログイン成功後に /mypage へ遷移させる
      return `${baseUrl}/mypage`;
    },
  },
};
