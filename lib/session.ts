import { authOptions } from "./authOptions";
import { getServerSession } from "next-auth";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  return session;
}
