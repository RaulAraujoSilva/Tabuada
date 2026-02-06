import { json } from '../_lib/http.js';
import { findUserByNameKey, normalizeName } from '../_lib/profile.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  const name = String(req.query.name || '');
  const nameKey = normalizeName(name);
  if (!nameKey) return json(res, 400, { error: 'Nome inválido' });
  const user = await findUserByNameKey(nameKey);
  return json(res, 200, { exists: Boolean(user) });
}
