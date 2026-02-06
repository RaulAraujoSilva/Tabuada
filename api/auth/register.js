import bcrypt from 'bcryptjs';
import { json, readJson, setSessionCookie } from '../_lib/http.js';
import { createSessionToken } from '../_lib/session.js';
import { createUser, findUserByNameKey, getProfile, normalizeName, safeDisplayName } from '../_lib/profile.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try {
    const body = await readJson(req);
    const displayName = safeDisplayName(body.name);
    const nameKey = normalizeName(displayName);
    const pin = String(body.pin || '').trim();

    if (!nameKey || displayName.length < 2) return json(res, 400, { error: 'Nome inválido' });
    if (!/^\d{4,6}$/.test(pin)) return json(res, 400, { error: 'PIN deve ter 4 a 6 dígitos' });

    const exists = await findUserByNameKey(nameKey);
    if (exists) return json(res, 409, { error: 'Nome já existe' });

    const pinHash = await bcrypt.hash(pin, 10);
    const user = await createUser(displayName, nameKey, pinHash);
    const profile = await getProfile(user.id);
    const token = await createSessionToken({ sub: user.id, name: user.displayName });
    setSessionCookie(res, token);
    return json(res, 200, { user: { id: user.id, displayName: user.displayName }, profile });
  } catch {
    return json(res, 500, { error: 'Erro no cadastro' });
  }
}
