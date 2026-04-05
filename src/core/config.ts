import { createRequire } from 'module';
import type { Config } from '../types/config.js';

const require = createRequire(import.meta.url);

// Load settings.cjs and return typed config
export function loadConfig(): Config {
  // Load settings.cjs first (sets global variables)
  require('../../settings.cjs');

  const g = global as any;

  return {
    owner: g.owner || ['6282113821188'],
    author: g.author || 'Foxy Bot',
    botname: g.botname || 'Foxy Bot',
    packname: g.packname || 'Bot WhatsApp',
    timezone: g.timezone || 'Asia/Jakarta',
    locale: g.locale || 'id',
    listprefix: g.listprefix || ['+', '!', '.'],
    listv: g.listv || ['•', '●', '■', '✿', '▲'],
    tempatDB: g.tempatDB || 'database.json',
    tempatStore: g.tempatStore || 'baileys_store.json',
    pairingCode: g.pairing_code !== undefined ? g.pairing_code : true,
    numberBot: g.number_bot || '',
    limit: g.limit || { free: 20, premium: 999, vip: 900 },
    money: g.money || { free: 10000, premium: 1000000, vip: 10000000 },
    mess: g.mess || {},
    apis: g.APIs || { foxy: 'https://api.naze.biz.id', neosantara: 'https://api.neosantara.xyz/v1' },
    apiKeys: g.APIKeys || { 'https://api.naze.biz.id': 'YOUR_API_KEY' },
    jadwalSholat: g.jadwalSholat || {},
    badWords: g.badWords || [],
    chatLength: g.chatLength || 1000,
    fake: g.fake || { anonim: '', thumbnailUrl: '' },
    my: g.my || { yt: '', gh: '', gc: '', ch: '' },
  };
}

// Global config instance (loaded once)
export let config: Config = loadConfig();
