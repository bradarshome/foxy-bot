import readline from 'readline';
import { exec } from 'child_process';
import { toBuffer } from 'qrcode';
import qrcodeTerminal from 'qrcode-terminal';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import { parsePhoneNumber } from 'awesome-phonenumber';
import NodeCache from 'node-cache';
import cron from 'node-cron';
import moment from 'moment-timezone';
import {
  default as makeWASocket,
  useMultiFileAuthState,
  Browsers,
  makeCacheableSignalKeyStore,
  fetchLatestWaWebVersion,
  jidNormalizedUser,
  type ConnectionState,
} from 'baileys';

import { app, server, PORT, config, initializeDatabase, ensureBotSettings, handleDisconnect } from './core/index.js';
import { createDatabase, cmdDel, checkStatus } from './database/index.js';
import { logger } from './utils/logger.js';
import { setupCustomDns, assertInstalled, printSystemInfo } from './utils/index.js';
import { serializeMessage, handleGroupParticipantsUpdate, handleMessagesUpsert } from './core/serializer.js';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text: string): Promise<string> => new Promise((resolve) => rl.question(text, resolve));

// Global state
let globalDb: any = null;
let globalStore: any = null;
let pairingStarted = false;
let phoneNumber = '';

const pairingCode = process.argv.includes('--qr') ? false : process.argv.includes('--pairing-code') || config.pairingCode;

// Initialize
setupCustomDns();
printSystemInfo();
logger.system('All external dependencies satisfied');

// Start Express server
server.listen(PORT, () => {
  logger.system(`App listened on port ${PORT}`);
});

// Check FFmpeg
try {
  assertInstalled(process.platform === 'win32' ? 'where ffmpeg' : 'command -v ffmpeg', 'FFmpeg', 0);
} catch {
  logger.warn('SYSTEM', 'FFmpeg not found, some features may not work');
}

// Database instances
const database = createDatabase(config.tempatDB);
const storeDB = createDatabase(config.tempatStore);

// Fetch API helper
async function fetchApi(endpoint: string, data: any = {}, options: any = {}): Promise<any> {
  const axios = (await import('axios')).default;
  const apiList = Object.keys(config.apis);
  const apiName = typeof options.api === 'number' ? apiList[options.api - 1] : options.name;
  const base = apiName ? (config.apis[apiName] || apiName) : config.apis.foxy;
  const apikey = config.apiKeys[base] || '';

  const method = (options.method || 'GET').toUpperCase();
  let url = base + endpoint;
  let payload: any = null;
  const headers: Record<string, string> = { 'user-agent': 'Mozilla/5.0 (Linux; Android 15)', ...(options.headers || {}) };

  if (method !== 'GET') {
    payload = { ...data, apikey };
    headers['content-type'] = 'application/json';
  } else {
    url += '?' + new URLSearchParams({ ...data, apikey }).toString();
  }

  const res = await axios({ method, url, data: payload, headers });
  return res.data;
}

// Make globals accessible
(global as any).db = null;
(global as any).store = null;
(global as any).fetchApi = fetchApi;
(global as any).config = config;
(global as any).owner = config.owner;
(global as any).timezone = config.timezone;
(global as any).locale = config.locale;
(global as any).listprefix = config.listprefix;
(global as any).listv = config.listv;
(global as any).badWords = config.badWords;
(global as any).jadwalSholat = config.jadwalSholat;
(global as any).APIs = config.apis;
(global as any).APIKeys = config.apiKeys;
(global as any).limit = config.limit;
(global as any).money = config.money;
(global as any).mess = config.mess;
(global as any).my = config.my;
(global as any).fake = config.fake;
(global as any).chatLength = config.chatLength;
(global as any).number_bot = config.numberBot;
(global as any).pairing_code = config.pairingCode;

async function startFoxyBot(): Promise<void> {
  try {
    // Load databases
    const dbData = await database.read();
    const storeData = await storeDB.read();

    globalDb = initializeDatabase(dbData);
    globalStore = storeData || {
      contacts: {},
      presences: {},
      messages: {},
      groupMetadata: {},
    };

    (global as any).db = globalDb;
    (global as any).store = globalStore;

    // Load message helper
    (global as any).loadMessage = (remoteJid: string, id: string) => {
      const messages = globalStore?.messages?.[remoteJid]?.array;
      if (!messages) return null;
      return messages.find((msg: any) => msg?.key?.id === id) || null;
    };

    // Auto-save interval
    if (!(global as any)._dbInterval) {
      (global as any)._dbInterval = setInterval(async () => {
        if (globalDb) await database.write(globalDb);
        if (globalStore) await storeDB.write(globalStore);
      }, 30 * 1000);
    }
  } catch (error) {
    logger.error('DB', 'Failed to initialize database', error instanceof Error ? error : undefined);
    process.exit(1);
  }

  // Baileys setup
  const level = pino.default ? pino.default({ level: 'silent' }) : (pino as any)({ level: 'silent' });
  const { version } = await fetchLatestWaWebVersion();
  const { state, saveCreds } = await useMultiFileAuthState('foxy-session');
  const msgRetryCounterCacheInstance = new NodeCache();

  const getMessage = async (key: any): Promise<any> => {
    if (globalStore) {
      const msg = await (global as any).loadMessage(key.remoteJid, key.id);
      return msg?.message || '';
    }
    return { conversation: 'Halo Saya Foxy Bot' };
  };

  const socket = makeWASocket({
    version,
    logger: level,
    getMessage,
    syncFullHistory: false,
    maxMsgRetryCount: 15,
    msgRetryCounterCache: msgRetryCounterCacheInstance,
    retryRequestDelayMs: 10,
    defaultQueryTimeoutMs: 0,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 30000,
    browser: Browsers.ubuntu('Chrome'),
    generateHighQualityLinkPreview: false,
    transactionOpts: {
      maxCommitRetries: 10,
      delayBetweenTriesMs: 10,
    },
    appStateMacVerification: {
      patch: true,
      snapshot: true,
    },
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, level),
    },
  });

  // Pairing code logic
  if (pairingCode && !socket.authState.creds.registered) {
    if (!phoneNumber) {
      phoneNumber = config.numberBot || await question('Please type your WhatsApp number (e.g. 628xxx): ');
      phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
      while (!parsePhoneNumber('+' + phoneNumber).valid || phoneNumber.length < 6) {
        console.log('Start with your Country WhatsApp code, Example: 62xxx');
        phoneNumber = await question('Please type your WhatsApp number: ');
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
      }
    }
    logger.bot('Requesting Pairing Code...');
    const code = await socket.requestPairingCode(phoneNumber);
    console.log(`Your Pairing Code: ${code} (Expires in 15 seconds)`);
  }

  // Apply serializer (adds helper methods to socket)
  await serializeMessage(socket, globalStore);

  // Event: creds update
  socket.ev.on('creds.update', saveCreds);

  // Event: connection state
  socket.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
    const { qr, connection, lastDisconnect, isNewLogin, receivedPendingNotifications } = update;

    // Pairing code request
    if ((connection === 'connecting' || qr) && pairingCode && phoneNumber && !socket.authState.creds.registered && !pairingStarted) {
      pairingStarted = true;
      setTimeout(async () => {
        logger.bot('Requesting Pairing Code...');
        const code = await socket.requestPairingCode(phoneNumber);
        console.log(`Your Pairing Code: ${code} (Expires in 15 seconds)`);
      }, 3000);
    }

    // Connection closed
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      handleDisconnect(reason, startFoxyBot, socket);
    }

    // Connected
    if (connection === 'open') {
      logger.bot(`Connected as: ${JSON.stringify(socket.user, null, 2)}`);
      const botNumber = jidNormalizedUser(socket.user!.id);
      const settings = ensureBotSettings(botNumber, globalDb);

      // Join newsletter channel
      if (!settings.join && typeof config.my.ch === 'string' && config.my.ch.includes('@newsletter')) {
        try {
          await (socket as any).newsletterMsg?.(config.my.ch, { type: 'follow' });
          settings.join = true;
        } catch {
          // Ignore newsletter join errors
        }
      }
    }

    // QR code
    if (qr) {
      if (!pairingCode) qrcodeTerminal.generate(qr, { small: true });
      app.use('/qr', async (_req: any, res: any) => {
        res.setHeader('content-type', 'image/png');
        res.end(await toBuffer(qr));
      });
    }

    if (isNewLogin) logger.bot('New device login detected');
    if (receivedPendingNotifications) {
      logger.bot('Please wait about 1 minute...');
      socket.ev.flush();
    }
  });

  // Event: calls
  socket.ev.on('call', async (calls: any[]) => {
    const botNumber = jidNormalizedUser(socket.user!.id);
    if (globalDb?.set?.[botNumber]?.anticall) {
      for (const call of calls) {
        if (call.status === 'offer') {
          const callType = call.isVideo ? 'Video' : 'Suara';
          await socket.sendMessage(call.from, {
            text: `Saat Ini, Kami Tidak Dapat Menerima Panggilan ${callType}.\nJika @${call.from.split('@')[0]} Memerlukan Bantuan, Silakan Hubungi Owner :)`,
            mentions: [call.from],
          });
          await socket.rejectCall(call.id, call.from);
        }
      }
    }
  });

  // Event: messages
  socket.ev.on('messages.upsert', async (message: any) => {
    await handleMessagesUpsert(socket, message, globalStore);
  });

  // Event: group participants
  socket.ev.on('group-participants.update', async (update: any) => {
    await handleGroupParticipantsUpdate(socket, update, globalStore);
  });

  // Event: groups update
  socket.ev.on('groups.update', (updates: any[]) => {
    for (const n of updates) {
      if (globalStore.groupMetadata[n.id]) {
        Object.assign(globalStore.groupMetadata[n.id], n);
      } else {
        globalStore.groupMetadata[n.id] = n;
      }
    }
  });

  // Event: presence update
  socket.ev.on('presence.update', ({ id, presences }: any) => {
    globalStore.presences[id] = globalStore.presences?.[id] || {};
    Object.assign(globalStore.presences[id], presences);
  });

  // Cron: Reset limit & backup daily
  cron.schedule('00 00 * * *', async () => {
    if (globalDb?.hit) cmdDel(globalDb.hit);
    logger.bot('Reset daily command limit');

    // Reset user limits
    for (const jid of Object.keys(globalDb.users)) {
      const user = globalDb.users[jid];
      const isVip = user.vip;
      const isPremium = checkStatus(jid, globalDb.premium);
      const limitDefault = isVip ? config.limit.vip : isPremium ? config.limit.premium : config.limit.free;
      if (user.limit < limitDefault) user.limit = limitDefault;
    }

    // Auto backup
    const botNumber = jidNormalizedUser(socket.user!.id);
    if (globalDb?.set?.[botNumber]?.autobackup) {
      logger.bot('Running auto backup...');
    }
  }, { scheduled: true, timezone: config.timezone });

  // Prayer time notifications
  const waktuSholat: Record<string, string> = {};
  setInterval(async () => {
    const sekarang = moment.tz(config.timezone);
    const jamSholat = sekarang.format('HH:mm');
    const hariIni = sekarang.format('YYYY-MM-DD');
    const detik = sekarang.format('ss');

    if (detik !== '00') return;

    for (const [sholat, waktu] of Object.entries(config.jadwalSholat)) {
      if (jamSholat === waktu && waktuSholat[sholat] !== hariIni) {
        waktuSholat[sholat] = hariIni;
        for (const [idnya, settings] of Object.entries(globalDb.groups)) {
          if ((settings as any).waktusholat) {
            await socket.sendMessage(idnya, {
              text: `Waktu *${sholat}* telah tiba, ambilah air wudhu dan segeralah shalat.\n\n*${waktu.slice(0, 5)}*\n_untuk wilayah ${config.timezone} dan sekitarnya._`,
            }).catch(() => {});
          }
        }
      }
    }
  }, 60000);

  // Presence update (available)
  if (!(global as any)._dbPresence) {
    (global as any)._dbPresence = setInterval(async () => {
      if (socket?.user?.id) {
        await socket.sendPresenceUpdate('available', jidNormalizedUser(socket.user.id)).catch(() => {});
      }
    }, 10 * 60 * 1000);
  }

  logger.bot('Foxy Bot started successfully');
}

// Process cleanup
const cleanup = async (signal: string) => {
  logger.system(`Received ${signal}. Saving database...`);
  if (globalDb) await database.write(globalDb);
  if (globalStore) await storeDB.write(globalStore);
  server.close(() => {
    logger.system('Server closed. Exiting...');
    process.exit(0);
  });
};

process.on('SIGINT', () => cleanup('SIGINT'));
process.on('SIGTERM', () => cleanup('SIGTERM'));
process.on('uncaughtException', (error) => {
  logger.error('FATAL', `Uncaught exception: ${error.message}`, error);
});
process.on('unhandledRejection', (reason) => {
  logger.error('FATAL', `Unhandled rejection: ${reason}`);
});

// Start the bot
startFoxyBot();
