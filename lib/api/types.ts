export interface ApiEnvelope<T> {
  statusCode: number;
  path: string;
  data: T;
  timestamp: string;
}

export interface AuthSuccessPayload {
  accessToken: string;
  user: {
    id: string;
    email: string | null;
    firstName: string;
    lastName: string | null;
    isGuest: boolean;
    plan: string;
  };
  mergedFromGuest?: boolean;
}

export interface RegisterRequestBody {
  email: string;
  firstName: string;
  lastName?: string;
  password: string;
  acceptTerms: boolean;
}
