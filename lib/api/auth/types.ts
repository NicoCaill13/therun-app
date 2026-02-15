import { z } from 'zod';

// ============================================================================
// Request schemas
// ============================================================================

/** POST /api/user/register - request body */
export const RegisterInputSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(1, 'Prenom requis').max(50),
  lastName: z.string().max(80).optional(),
  acceptTerms: z.literal(true, { message: 'Vous devez accepter les conditions' }),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

// ============================================================================
// Response schemas
// ============================================================================

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  isGuest: z.boolean(),
  plan: z.string(),
});

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: AuthUserSchema,
  mergedFromGuest: z.boolean(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
