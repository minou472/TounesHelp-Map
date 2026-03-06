import { cookies } from "next/headers";
import { verifyAccessToken } from "./jwt";

// Call this inside any API route to get the logged-in user
export async function getAuthUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;
    const payload = verifyAccessToken(token);
    return payload; // { userId, role } or null
}
// Call this to check if the user is an admin
export async function requireAdmin() {
    const user = await getAuthUser();
    if (!user || user.role !== "ADMIN") return null;
    return user;
}