import * as jose from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error("Critical Configuration Missing: JWT_SECRET environment variable is undefined.");
}

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);
const ALGORITHM = 'HS256';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, SECRET_KEY, {
      algorithms: [ALGORITHM],
    });
    return payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}
