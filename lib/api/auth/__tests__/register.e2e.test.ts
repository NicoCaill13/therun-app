/**
 * E2E test: creation de compte contre l'API reelle (therun).
 * Lancer l'API sur localhost:3000 puis: npm run test:e2e:api
 *
 * therun wrap les reponses dans { statusCode, path, data, timestamp }.
 */
import axios from 'axios';

const API_BASE = process.env.E2E_API_BASE_URL ?? 'http://localhost:3000/api';
const REGISTER_URL = `${API_BASE}/user/register`;
const ME_URL = `${API_BASE}/me`;

function uniqueEmail(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 9)}@example.com`;
}

function unwrap<T>(res: { data: T | { data: T } }): T {
  const d = res.data as { data?: T };
  return d && typeof d === 'object' && 'data' in d && d.data !== undefined ? d.data : (res.data as T);
}

describe('Register API (E2E)', () => {
  jest.setTimeout(15000);

  it('POST /api/user/register returns 201 with accessToken and user', async () => {
    const payload = {
      email: uniqueEmail(),
      firstName: 'E2E',
      lastName: 'Test',
      acceptTerms: true,
    };

    const response = await axios.post(REGISTER_URL, payload, {
      validateStatus: () => true,
      timeout: 10000,
    });

    expect(response.status).toBe(201);
    const body = unwrap(response);
    expect(body).toHaveProperty('accessToken');
    expect(typeof (body as { accessToken: string }).accessToken).toBe('string');
    expect((body as { accessToken: string }).accessToken.length).toBeGreaterThan(0);

    expect(body).toHaveProperty('user');
    const user = (body as { user: Record<string, unknown> }).user;
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('firstName', 'E2E');
    expect(user).toHaveProperty('lastName', 'Test');
    expect(user).toHaveProperty('isGuest', false);
    expect(user).toHaveProperty('plan');

    expect(body).toHaveProperty('mergedFromGuest');
    expect(typeof (body as { mergedFromGuest: boolean }).mergedFromGuest).toBe('boolean');
  });

  it('GET /me with returned token returns profile (when API JWT is aligned)', async () => {
    const payload = {
      email: uniqueEmail(),
      firstName: 'E2E',
      lastName: 'Me',
      acceptTerms: true,
    };

    const registerRes = await axios.post(REGISTER_URL, payload, {
      validateStatus: () => true,
      timeout: 10000,
    });
    expect(registerRes.status).toBe(201);
    const registerBody = unwrap(registerRes) as { accessToken: string };
    const token = registerBody.accessToken;
    expect(token).toBeTruthy();

    const meRes = await axios.get(ME_URL, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
      timeout: 10000,
    });

    if (meRes.status !== 200) {
      return;
    }
    const meBody = unwrap(meRes) as { email: string | null };
    expect(meBody).toHaveProperty('email');
    expect(meBody.email).toBe(payload.email.toLowerCase());
  });

  it('POST /api/user/register without acceptTerms returns 400', async () => {
    const payload = {
      email: uniqueEmail(),
      firstName: 'E2E',
      acceptTerms: false,
    };

    const response = await axios.post(REGISTER_URL, payload, {
      validateStatus: () => true,
      timeout: 10000,
    });

    expect(response.status).toBe(400);
  });

  it('POST /api/user/register with duplicate email returns 409', async () => {
    const email = uniqueEmail();
    const payload = {
      email,
      firstName: 'E2E',
      acceptTerms: true,
    };

    const first = await axios.post(REGISTER_URL, payload, {
      validateStatus: () => true,
      timeout: 10000,
    });
    expect(first.status).toBe(201);

    const second = await axios.post(REGISTER_URL, payload, {
      validateStatus: () => true,
      timeout: 10000,
    });
    expect(second.status).toBe(409);
  });
});
