import { SignJWT, jwtVerify } from 'jose';

function getSecret() {
  const raw = process.env.AUTH_SECRET || 'dev-only-secret-change-me';
  return new TextEncoder().encode(raw);
}

export async function createSessionToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret());
}

export async function verifySessionToken(token) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload;
}
