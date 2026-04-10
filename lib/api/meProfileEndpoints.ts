import { apiGetJsonAuth } from "@/lib/api/authClient";
import type { MeProfileResponse } from "@/lib/api/meProfileTypes";

export async function getMeProfile(accessToken: string): Promise<MeProfileResponse> {
  return apiGetJsonAuth<MeProfileResponse>("/api/me", accessToken);
}
