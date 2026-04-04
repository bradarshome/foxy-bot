import toMs from 'ms';
import type { PremiumEntry } from '../types/database.js';
import type { WASocket } from 'baileys';

// Command counter
export function cmdAdd(hit: Record<string, any>): void {
  if (!hit.totalcmd) hit.totalcmd = 0;
  if (!hit.todaycmd) hit.todaycmd = 0;
  hit.totalcmd++;
  hit.todaycmd++;
}

export function cmdDel(hit: Record<string, any>): void {
  if (hit) hit.todaycmd = 0;
}

export function cmdAddHit(hit: Record<string, any>, feature: string): void {
  if (!hit[feature]) hit[feature] = 0;
  hit[feature]++;
}

// Premium/Sewa management
export function addPremium(entry: { id: string; expired: string; url?: string }, dir: PremiumEntry[]): void {
  const existing = dir.find((a) => a.id === entry.id);
  if (existing) {
    existing.expired = existing.expired + toMs(entry.expired);
  } else {
    const { id, expired, ...options } = entry;
    dir.push({ id, expired: Date.now() + toMs(expired), ...options } as PremiumEntry);
  }
}

export function getPosition(id: string, dir: PremiumEntry[]): number {
  return dir.findIndex((a) => a.id === id || (a as any).url === id);
}

export function getStatus(id: string, dir: PremiumEntry[]): PremiumEntry | undefined {
  return dir.find((a) => a.id === id || (a as any).url === id);
}

export function checkStatus(id: string, dir: PremiumEntry[]): boolean {
  return dir.some((a) => a.id === id || (a as any).url === id);
}

export function getAllExpired(dir: PremiumEntry[]): string[] {
  return dir.map((a) => a.id);
}

// Check and remove expired entries
export function checkExpired(dir: PremiumEntry[], conn?: WASocket): void {
  const expired = dir.filter((a) => Date.now() >= a.expired);
  for (const entry of expired) {
    if (conn && entry.id.endsWith('@g.us')) {
      conn.groupLeave(entry.id).catch(() => {});
    }
    console.log(`Expired: ${entry.id}`);
  }
  // Remove expired entries
  const remaining = dir.filter((a) => Date.now() < a.expired);
  dir.length = 0;
  dir.push(...remaining);
}
