import { json, parseCookies } from '../_lib/http.js';
import { verifySessionToken } from '../_lib/session.js';
import { getProfile } from '../_lib/profile.js';
import { storeGet } from '../_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  try {
    const cookies = parseCookies(req);
    if (!cookies.tq_session) return json(res, 200, { user: null });

    const payload = await verifySessionToken(cookies.tq_session);
    const userId = String(payload.sub || '');
    if (!userId) return json(res, 200, { user: null });

    const user = await storeGet(`user:${userId}`);
    if (!user) return json(res, 200, { user: null });

    const profile = await getProfile(userId);
    return json(res, 200, { user: { id: user.id, displayName: user.displayName }, profile });
  } catch {
    return json(res, 200, { user: null });
  }
}
