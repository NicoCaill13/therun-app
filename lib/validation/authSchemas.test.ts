import { signInSchema, signUpSchema, splitDisplayName } from '@/lib/validation/authSchemas';

describe('authSchemas', () => {
  describe('signInSchema', () => {
    it('accepts valid email and non-empty password', () => {
      const r = signInSchema.safeParse({ email: 'a@b.co', password: 'x' });
      expect(r.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const r = signInSchema.safeParse({ email: 'not-an-email', password: 'x' });
      expect(r.success).toBe(false);
    });

    it('rejects empty password', () => {
      const r = signInSchema.safeParse({ email: 'a@b.co', password: '' });
      expect(r.success).toBe(false);
    });
  });

  describe('signUpSchema', () => {
    it('accepts valid payload with terms accepted', () => {
      const r = signUpSchema.safeParse({
        name: 'Jo',
        email: 'jo@example.com',
        password: 'secret',
        acceptTerms: true,
      });
      expect(r.success).toBe(true);
    });

    it('rejects short name', () => {
      const r = signUpSchema.safeParse({
        name: 'J',
        email: 'jo@example.com',
        password: 'secret',
        acceptTerms: true,
      });
      expect(r.success).toBe(false);
    });

    it('rejects short password', () => {
      const r = signUpSchema.safeParse({
        name: 'Jo',
        email: 'jo@example.com',
        password: 'abcde',
        acceptTerms: true,
      });
      expect(r.success).toBe(false);
    });

    it('rejects when terms not accepted', () => {
      const r = signUpSchema.safeParse({
        name: 'Jo',
        email: 'jo@example.com',
        password: 'secret',
        acceptTerms: false,
      });
      expect(r.success).toBe(false);
    });
  });

  describe('splitDisplayName', () => {
    it('returns single firstName when no space', () => {
      expect(splitDisplayName('  Ada  ')).toEqual({ firstName: 'Ada' });
    });

    it('splits first and last name', () => {
      expect(splitDisplayName('Ada Lovelace')).toEqual({
        firstName: 'Ada',
        lastName: 'Lovelace',
      });
    });
  });
});
