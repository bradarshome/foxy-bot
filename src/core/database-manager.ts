import type { WASocket } from 'baileys';
import type { Database, BotSettings, UserData, GroupData, GameState } from '../types/database.js';
import { logger } from '../utils/logger.js';
import { config } from './config.js';

// Default bot settings
const DEFAULT_BOT_SETTINGS: BotSettings = {
  lang: 'id',
  limit: 0,
  money: 0,
  status: 0,
  log: true,
  join: false,
  public: true,
  anticall: true,
  original: true,
  readsw: false,
  autobio: false,
  autoread: true,
  antispam: false,
  autotyping: true,
  grouponly: false,
  multiprefix: false,
  privateonly: false,
  didyoumean: true,
  author: config.author,
  authorPrefix: '',
  autobackup: false,
  botname: config.botname,
  packname: config.packname,
  template: 'documentMessage',
  owner: [...config.owner],
};

// Default user data
function getDefaultUserData(): UserData {
  return {
    vip: false,
    ban: false,
    afkTime: -1,
    afkReason: '',
    register: false,
    limit: config.limit.free,
    money: config.money.free,
    lastclaim: Date.now(),
    lastbegal: Date.now(),
    lastrampok: Date.now(),
  };
}

// Default group data
function getDefaultGroupData(): GroupData {
  return {
    url: '',
    text: {},
    warn: {},
    tagsw: {},
    nsfw: false,
    mute: false,
    leave: false,
    setinfo: false,
    antilink: false,
    demote: false,
    antitoxic: false,
    promote: false,
    welcome: false,
    antivirtex: false,
    antitagsw: false,
    antidelete: false,
    antihidetag: false,
    waktusholat: false,
  };
}

// Default game state
function getDefaultGameState(): GameState {
  return {
    suit: {},
    chess: {},
    chat_ai: {},
    menfes: {},
    tekateki: {},
    tictactoe: {},
    tebaklirik: {},
    kuismath: {},
    blackjack: {},
    tebaklagu: {},
    tebakkata: {},
    family100: {},
    susunkata: {},
    tebakbom: {},
    ulartangga: {},
    tebakkimia: {},
    caklontong: {},
    tebakangka: {},
    tebaknegara: {},
    tebakgambar: {},
    tebakbendera: {},
  };
}

// Initialize database with defaults
export function initializeDatabase(data: Database | null): Database {
  return {
    hit: { totalcmd: 0, todaycmd: 0, ...(data?.hit || {}) },
    set: data?.set || {},
    cmd: data?.cmd || {},
    store: data?.store || {},
    users: data?.users || {},
    game: { ...getDefaultGameState(), ...(data?.game || {}) },
    groups: data?.groups || {},
    database: data?.database || {},
    premium: data?.premium || [],
    sewa: data?.sewa || [],
  };
}

// Ensure bot settings exist for a bot number
export function ensureBotSettings(botNumber: string, db: Database): BotSettings {
  if (!db.set[botNumber]) {
    db.set[botNumber] = { ...DEFAULT_BOT_SETTINGS };
  }
  for (const key of Object.keys(DEFAULT_BOT_SETTINGS)) {
    const k = key as keyof BotSettings;
    if (!(k in db.set[botNumber])) {
      (db.set[botNumber] as any)[k] = (DEFAULT_BOT_SETTINGS as any)[k];
    }
  }
  return db.set[botNumber];
}

// Ensure user data exists
export function ensureUserData(sender: string, db: Database, isPremium = false, isVip = false): UserData {
  if (!db.users[sender]) {
    db.users[sender] = getDefaultUserData();
  }
  const user = db.users[sender];
  const limitDefault = isVip ? config.limit.vip : isPremium ? config.limit.premium : config.limit.free;
  const moneyDefault = isVip ? config.money.vip : isPremium ? config.money.premium : config.money.free;
  if (user.limit === undefined) user.limit = limitDefault;
  if (user.money === undefined) user.money = moneyDefault;
  return user;
}

// Ensure group data exists
export function ensureGroupData(chat: string, db: Database): GroupData | null {
  if (!chat.endsWith('@g.us')) return null;
  if (!db.groups[chat]) {
    db.groups[chat] = getDefaultGroupData();
  }
  return db.groups[chat];
}

// Handle disconnect reasons (using number codes directly from Baileys)
export function handleDisconnect(reasonCode: number, startBot: () => void, socket: WASocket): void {
  // Common Baileys disconnect reason codes
  const RECONNECTABLE = [408, 428, 515]; // timedOut, connectionLost, restartRequired
  const LOGOUT = [401, 403]; // loggedOut, forbidden

  if (RECONNECTABLE.includes(reasonCode)) {
    logger.bot(`Connection issue (code: ${reasonCode}), reconnecting...`);
    startBot();
  } else if (reasonCode === 428) {
    logger.bot('Bad session or connection replaced');
    startBot();
  } else if (LOGOUT.includes(reasonCode)) {
    logger.error('BOT', `Logged out or forbidden (code: ${reasonCode}), clearing session`);
    startBot();
  } else {
    logger.error('BOT', `Unknown DisconnectReason: ${reasonCode}`);
    socket.end(new Error(`Unknown DisconnectReason: ${reasonCode}`));
  }
}
