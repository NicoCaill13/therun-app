import { RegisterInputSchema, AuthResponseSchema } from '../types';

describe('RegisterInputSchema', () => {
  it('should validate correct input', () => {
    const result = RegisterInputSchema.safeParse({
      email: 'test@example.com',
      password: 'secureP@ss1',
      firstName: 'John',
      lastName: 'Doe',
      acceptTerms: true,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = RegisterInputSchema.safeParse({
      email: 'invalid',
      password: 'secureP@ss1',
      firstName: 'John',
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty firstName', () => {
    const result = RegisterInputSchema.safeParse({
      email: 'test@example.com',
      password: 'secureP@ss1',
      firstName: '',
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it('should reject acceptTerms false', () => {
    const result = RegisterInputSchema.safeParse({
      email: 'test@example.com',
      password: 'secureP@ss1',
      firstName: 'John',
      acceptTerms: false,
    });
    expect(result.success).toBe(false);
  });

  it('should allow optional lastName', () => {
    const result = RegisterInputSchema.safeParse({
      email: 'test@example.com',
      password: 'secureP@ss1',
      firstName: 'John',
      acceptTerms: true,
    });
    expect(result.success).toBe(true);
  });

  it('should reject password shorter than 8 characters', () => {
    const result = RegisterInputSchema.safeParse({
      email: 'test@example.com',
      password: 'short',
      firstName: 'John',
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing password', () => {
    const result = RegisterInputSchema.safeParse({
      email: 'test@example.com',
      firstName: 'John',
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });
});

describe('AuthResponseSchema', () => {
  it('should validate a complete auth response', () => {
    const result = AuthResponseSchema.safeParse({
      accessToken: 'jwt.token.here',
      user: {
        id: '123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isGuest: false,
        plan: 'FREE',
      },
      mergedFromGuest: false,
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing accessToken', () => {
    const result = AuthResponseSchema.safeParse({
      user: { id: '123', email: null, firstName: 'Guest', lastName: null, isGuest: true, plan: 'FREE' },
      mergedFromGuest: false,
    });
    expect(result.success).toBe(false);
  });
});
