import bcrypt from 'bcryptjs';
import { json, readJson, setSessionCookie } from '../_lib/http.js';
import { createSessionToken } from '../_lib/session.js';
import { findUserByNameKey, getProfile, normalizeName } from '../_lib/profile.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try {
    const body = await readJson(req);
    const nameKey = normalizeName(body.name);
    const pin = String(body.pin || '').trim();
    if (!nameKey || !pin) return json(res, 400, { error: 'Credenciais inválidas' });

    const user = await findUserByNameKey(nameKey);
    if (!user) return json(res, 404, { error: 'Usuário não encontrado' });

    const ok = await bcrypt.compare(pin, user.pinHash);
    if (!ok) return json(res, 401, { error: 'PIN incorreto' });

    const profile = await getProfile(user.id);
    const token = await createSessionToken({ sub: user.id, name: user.displayName });
    setSessionCookie(res, token);
    return json(res, 200, { user: { id: user.id, displayName: user.displayName }, profile });
  } catch {
    return json(res, 500, { error: 'Erro no login' });
  }
}
