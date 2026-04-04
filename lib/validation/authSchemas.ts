import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  acceptTerms: z.boolean().refine((v) => v === true, 'You must accept the terms'),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export function splitDisplayName(rawName: string): { firstName: string; lastName?: string } {
  const trimmed = rawName.trim();
  const spaceIdx = trimmed.indexOf(' ');
  if (spaceIdx === -1) {
    return { firstName: trimmed };
  }
  const firstName = trimmed.slice(0, spaceIdx).trim();
  const lastName = trimmed.slice(spaceIdx + 1).trim();
  return {
    firstName,
    ...(lastName.length > 0 ? { lastName } : {}),
  };
}
