import { z } from "zod";
import { apiRequest } from "./httpClient";

const googleUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().optional().default(""),
  picture: z.string().optional().default(""),
  provider: z.literal("google"),
});

const verifyResponseSchema = z.object({
  user: googleUserSchema,
});

export type VerifiedGoogleUser = z.infer<typeof googleUserSchema>;

export async function verifyGoogleToken(idToken: string): Promise<VerifiedGoogleUser> {
  const response = await apiRequest<unknown>("/api/auth/google/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
    retryCount: 0,
  });

  return verifyResponseSchema.parse(response).user;
}
