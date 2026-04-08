import { NextRequest } from "next/server";
import { getAuthUser, getUserFromDb } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return errorResponse("Unauthorized", 401);

    const user = await getUserFromDb(authUser.userId);
    if (!user) return errorResponse("User not found", 404);

    return successResponse(user);
  } catch (error) {
    console.error("[AUTH/ME]", error);
    return errorResponse("Internal server error", 500);
  }
}
