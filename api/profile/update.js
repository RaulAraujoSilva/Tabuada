import { json, parseCookies, readJson } from '../_lib/http.js';
import { verifySessionToken } from '../_lib/session.js';
import { getProfile, saveProfile } from '../_lib/profile.js';

function mergeConquistas(current, incoming) {
  const merged = { ...(current || {}) };
  Object.keys(incoming || {}).forEach((k) => {
    if (incoming[k]) merged[k] = true;
  });
  return merged;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try {
    const cookies = parseCookies(req);
    if (!cookies.tq_session) return json(res, 401, { error: 'Não autenticado' });
    const payload = await verifySessionToken(cookies.tq_session);
    const userId = String(payload.sub || '');
    if (!userId) return json(res, 401, { error: 'Sessão inválida' });

    const body = await readJson(req);
    const race = body.race || null;
    const incomingConquistas = body.conquistasDesbloqueadas || {};

    const profile = await getProfile(userId);
    const merged = {
      ...profile,
      conquistasDesbloqueadas: mergeConquistas(profile.conquistasDesbloqueadas, incomingConquistas),
    };

    if (race) {
      const licoesCompletas = Number(profile.licoesCompletas || 0) + 1;
      const pontuacaoTotal = Number(profile.pontuacaoTotal || 0) + Number(race.pontos || 0);
      const rankingCorridas = [...(profile.rankingCorridas || []), race]
        .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
        .slice(0, 20);
      Object.assign(merged, { licoesCompletas, pontuacaoTotal, rankingCorridas });
    }

    await saveProfile(userId, merged);
    return json(res, 200, { ok: true, profile: merged });
  } catch {
    return json(res, 500, { error: 'Erro ao salvar perfil' });
  }
}
