import { kv } from '@vercel/kv';

const mem = globalThis.__tq_mem_store || new Map();
globalThis.__tq_mem_store = mem;

function hasKV() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function storeGet(key) {
  if (hasKV()) return kv.get(key);
  return mem.has(key) ? mem.get(key) : null;
}

export async function storeSet(key, value) {
  if (hasKV()) {
    await kv.set(key, value);
    return;
  }
  mem.set(key, value);
}

export async function storeDel(key) {
  if (hasKV()) {
    await kv.del(key);
    return;
  }
  mem.delete(key);
}
