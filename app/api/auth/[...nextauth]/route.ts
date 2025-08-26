import NextAuth, { NextAuthOptions } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// NextAuth ハンドラ
const handler = NextAuth(authOptions as NextAuthOptions);

export { handler as GET, handler as POST };
