import { randomUUID } from 'node:crypto';
import { storeGet, storeSet } from './store.js';

export function normalizeName(name) {
  return (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function safeDisplayName(name) {
  return (name || '').trim().replace(/\s+/g, ' ').slice(0, 30);
}

export function emptyProfile() {
  return {
    licoesCompletas: 0,
    pontuacaoTotal: 0,
    conquistasDesbloqueadas: {},
    streak: 1,
    rankingCorridas: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function findUserByNameKey(nameKey) {
  const userId = await storeGet(`name:${nameKey}`);
  if (!userId) return null;
  return storeGet(`user:${userId}`);
}

export async function createUser(displayName, nameKey, pinHash) {
  const id = randomUUID();
  const user = {
    id,
    displayName,
    nameKey,
    pinHash,
    createdAt: new Date().toISOString(),
  };
  await storeSet(`user:${id}`, user);
  await storeSet(`name:${nameKey}`, id);
  await storeSet(`profile:${id}`, emptyProfile());
  return user;
}

export async function getProfile(userId) {
  return (await storeGet(`profile:${userId}`)) || emptyProfile();
}

export async function saveProfile(userId, profile) {
  await storeSet(`profile:${userId}`, {
    ...profile,
    updatedAt: new Date().toISOString(),
  });
}
