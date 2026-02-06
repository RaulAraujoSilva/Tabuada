export function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(body));
}

export function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').forEach((part) => {
    const [k, ...rest] = part.trim().split('=');
    if (!k) return;
    out[k] = decodeURIComponent(rest.join('=') || '');
  });
  return out;
}

export function setSessionCookie(res, token) {
  const maxAge = 60 * 60 * 24 * 30;
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
  res.setHeader('Set-Cookie', `tq_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; ${secure}Max-Age=${maxAge}`);
}

export function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
  res.setHeader('Set-Cookie', `tq_session=; Path=/; HttpOnly; SameSite=Lax; ${secure}Max-Age=0`);
}

export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}
