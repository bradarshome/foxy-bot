// @ts-nocheck
import fs from 'fs-extra';
import path from 'path';
import {
  jidNormalizedUser,
  extractMessageContent,
  downloadContentFromMessage,
  jidDecode,
  getContentType,
  type WASocket,
} from 'baileys';
import axios from 'axios';
import { fileTypeFromBuffer, fileTypeFromFile } from 'file-type';
import { parsePhoneNumber } from 'awesome-phonenumber';
import { logger } from '../utils/logger.js';
import type { ExtendedSocket } from '../types/extended-socket.js';

// Type assertion for extended socket
const ext = (socket: WASocket): ExtendedSocket => socket as unknown as ExtendedSocket;

// Serialize: add helper methods to socket
export async function serializeMessage(socket: WASocket, store: any): Promise<WASocket> {
  const s = ext(socket);

  s.serializeM = async (m: any) => handleMessagesUpsert(socket, m, store);

  // Decode JID
  s.decodeJid = (jid: string): string => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid) as { user?: string; server?: string } | null;
      return (decode?.user && decode?.server && `${decode.user}@${decode.server}`) || jid;
    }
    return jid;
  };

  // Find JID by LID
  s.findJidByLid = (lid: string, _store: any, resolve = false): string | null => {
    const groupMeta = _store?.groupMetadata;
    if (groupMeta) {
      for (const g of Object.values(groupMeta)) {
        const gm = g as any;
        if (!gm?.participants) continue;
        for (const contact of gm.participants) {
          if ((contact?.id?.includes(lid) || contact?.phoneNumber?.includes(lid)) && contact?.phoneNumber) {
            return contact.phoneNumber;
          }
        }
      }
    }
    const contacts = _store?.contacts;
    if (contacts) {
      for (const contact of Object.values(contacts)) {
        const c = contact as any;
        if ((c?.id?.includes(lid) || c?.phoneNumber?.includes(lid)) && c?.phoneNumber) {
          return c.phoneNumber;
        }
      }
    }
    return resolve ? lid : null;
  };

  // Get name
  s.getName = async (jid: string, withoutContact = false): Promise<string> => {
    const id = s.decodeJid(jid);
    if (id.endsWith('@g.us')) {
      const groupInfo = store.contacts[id] || store.groupMetadata[id] || {};
      return groupInfo.name || groupInfo.subject || parsePhoneNumber('+' + id.replace('@g.us', '')).number?.international || id;
    }
    if (id === '0@s.whatsapp.net') return 'WhatsApp';
    const contactInfo = store.contacts[id] || {};
    return withoutContact ? '' : contactInfo.name || contactInfo.subject || contactInfo.verifiedName || parsePhoneNumber('+' + id.replace('@s.whatsapp.net', '')).number?.international || id;
  };

  // Send contact
  s.sendContact = async (jid: string, kon: string[], quoted = '', opts = {}): Promise<any> => {
    const list = [];
    for (const i of kon) {
      const name = await s.getName(i + '@s.whatsapp.net');
      list.push({
        displayName: name,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nFN:${name}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.ADR:;;Indonesia;;;;\nitem2.X-ABLabel:Region\nEND:VCARD`,
      });
    }
    return socket.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted });
  };

  // Profile picture URL
  s.profilePictureUrl = async (jid: string, type = 'image', timeoutMs?: number): Promise<string | undefined> => {
    const result = await socket.query({
      tag: 'iq',
      attrs: {
        target: jidNormalizedUser(jid),
        to: '@s.whatsapp.net',
        type: 'get',
        xmlns: 'w:profile:picture',
      },
      content: [{ tag: 'picture', attrs: { type, query: 'url' } }],
    }, timeoutMs);
    const children = result.content as any[];
    if (Array.isArray(children)) {
      const picture = children.find((c) => c.tag === 'picture');
      return picture?.attrs?.url;
    }
    return undefined;
  };

  // Set status
  s.setStatus = (status: string): void => {
    socket.query({
      tag: 'iq',
      attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'status' },
      content: [{ tag: 'status', attrs: {}, content: Buffer.from(status, 'utf-8') }],
    });
  };

  // Send poll
  s.sendPoll = (jid: string, name: string, values: string[], quoted: any, selectableCount = 1): Promise<any> => {
    return socket.sendMessage(jid, { poll: { name, values, selectableCount } }, { quoted });
  };

  // Send file from URL
  s.sendFileUrl = async (jid: string, url: string, caption: string, quoted: any, options = {}): Promise<any> => {
    try {
      const res = await axios.head(url);
      const mime = res.headers['content-type'];
      if (mime?.includes('gif')) return socket.sendMessage(jid, { video: { url }, caption, gifPlayback: true, ...options }, { quoted });
      if (mime?.includes('application/pdf')) return socket.sendMessage(jid, { document: { url }, mimetype: 'application/pdf', caption, ...options }, { quoted });
      if (mime?.includes('image')) return socket.sendMessage(jid, { image: { url }, caption, ...options }, { quoted });
      if (mime?.includes('video')) return socket.sendMessage(jid, { video: { url }, caption, mimetype: 'video/mp4', ...options }, { quoted });
      if (mime?.includes('audio')) return socket.sendMessage(jid, { audio: { url }, mimetype: 'audio/mpeg', ...options }, { quoted });
      return socket.sendMessage(jid, { document: { url }, caption, mimetype: mime, ...options }, { quoted });
    } catch {
      return socket.sendMessage(jid, { text: url, ...options }, { quoted });
    }
  };

  // Send from owner
  s.sendFromOwner = async (jids: string[], text: string, quoted: any, options = {}): Promise<void> => {
    for (const a of jids) {
      const jid = a.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      await socket.sendMessage(jid, { text, ...options }, { quoted });
    }
  };

  // Download media message
  s.downloadMediaMessage = async (message: any): Promise<Buffer> => {
    const msg = message.msg || message;
    const mime = msg.mimetype || '';
    const messageType = (message.type || mime.split('/')[0]).replace(/Message/gi, '');
    const stream = await downloadContentFromMessage(msg, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };

  // Get file info
  s.getFile = async (PATH: string | Buffer): Promise<{ filename: string; mime: string; ext: string; isTemp: boolean }> => {
    let filename: string;
    let mime = 'application/octet-stream';
    let ext = 'bin';
    let isTemp = false;

    if (Buffer.isBuffer(PATH)) {
      const type = await fileTypeFromBuffer(PATH) || { mime, ext };
      mime = type.mime;
      ext = type.ext;
      filename = path.join(process.cwd(), 'database/temp', `${Date.now()}.${ext}`);
      await fs.writeFile(filename, PATH);
      isTemp = true;
    } else if (typeof PATH === 'string' && /^https?:\/\//.test(PATH)) {
      const res = await axios.get(PATH, { responseType: 'stream' });
      mime = res.headers['content-type'] || 'application/octet-stream';
      ext = mime.split('/')[1]?.split(';')[0] || 'tmp';
      if (ext === 'jpeg') ext = 'jpg';
      filename = path.join(process.cwd(), 'database/temp', `${Date.now()}.${ext}`);
      const writeStream = fs.createWriteStream(filename);
      res.data.pipe(writeStream);
      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', () => resolve());
        writeStream.on('error', (e: Error) => reject(e));
      });
      isTemp = true;
    } else if (typeof PATH === 'string' && fs.existsSync(PATH)) {
      const type = await fileTypeFromFile(PATH) || { mime, ext };
      mime = type.mime;
      ext = type.ext;
      filename = PATH;
      isTemp = false;
    } else {
      throw new Error('Format media tidak didukung');
    }

    return { filename, mime, ext, isTemp };
  };

  // Set public mode
  if (socket.user && socket.user.id) {
    const botNumber = s.decodeJid(socket.user.id);
    const db = (global as any).db;
    s.public = db?.set?.[botNumber]?.public ?? true;
  } else {
    s.public = true;
  }

  return socket;
}

// Handle messages upsert
export async function handleMessagesUpsert(socket: WASocket, message: any, store: any): Promise<void> {
  try {
    const msg = message.messages[0];
    if (!msg) return;

    const remoteJid = msg.key.remoteJid;
    if (!store.messages) store.messages = {};
    if (!store.messages[remoteJid]) store.messages[remoteJid] = { array: [], keyId: new Set() };
    if (!(store.messages[remoteJid].keyId instanceof Set)) {
      store.messages[remoteJid].keyId = new Set(store.messages[remoteJid].array.map((m: any) => m.key.id));
    }
    if (store.messages[remoteJid].keyId.has(msg.key.id)) return;

    store.messages[remoteJid].array.push(msg);
    store.messages[remoteJid].keyId.add(msg.key.id);

    const chatLength = (global as any).chatLength || 250;
    if (store.messages[remoteJid].array.length > chatLength) {
      const removed = store.messages[remoteJid].array.shift();
      store.messages[remoteJid].keyId.delete(removed.key.id);
    }

    if (!store.groupMetadata || Object.keys(store.groupMetadata).length === 0) {
      store.groupMetadata = await socket.groupFetchAllParticipating().catch(() => ({}));
    }

    // Serialize message
    const m = await serializeMessageObject(socket, msg, store);

    const db = (global as any).db;
    const s = ext(socket);
    const botNumber = s.decodeJid(socket.user!.id);
    const settings = db?.set?.[botNumber];

    // Auto read
    if (m.message && remoteJid !== 'status@broadcast') {
      if ((settings?.autoread && (socket as any).public) || m.fromMe) {
        socket.readMessages([m.key]);
      }
    }

    // Filter bot messages
    if (m.isBot) return;

    // Filter banned users
    if (db?.users?.[m.sender]?.ban && !m.fromMe) return;

    // Load plugin handler
    await loadPluginHandler(socket, m, store, db);

  } catch (error) {
    logger.error('MSG', `Error in messages.upsert: ${(error as Error).message}`);
  }
}

// Serialize message object
async function serializeMessageObject(socket: WASocket, msg: any, store: any): Promise<any> {
  const s = ext(socket);
  const botLid = s.decodeJid((socket.user as any)?.lid || '');
  const botNumber = s.decodeJid(socket.user!.id);
  const m = { ...msg };

  if (m.key) {
    m.id = m.key.id;
    m.chat = m.key.remoteJidAlt || m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isBot = ['HSK', 'BAE', 'B1E', '3EB0', 'B24E', 'WA'].some((a) => m.id.startsWith(a) && [12, 16, 20, 22, 40].includes(m.id.length)) || /(.)\1{5,}|[^a-zA-Z0-9]|[^0-9A-F]/.test(m.id);
    m.isGroup = m.chat.endsWith('@g.us');

    if (!m.isGroup && m.chat.endsWith('@lid')) {
      m.chat = s.findJidByLid(m.chat, store) || m.chat;
    }

    m.sender = s.decodeJid((m.fromMe && socket.user!.id) || m.key.participantAlt || m.key.participant || m.chat || '');

    if (m.isGroup) {
      if (!store.groupMetadata) store.groupMetadata = await socket.groupFetchAllParticipating().catch(() => ({}));
      let metadata = store.groupMetadata[m.chat];
      if (!metadata) {
        metadata = await socket.groupMetadata(m.chat).catch(() => ({}));
        store.groupMetadata[m.chat] = metadata;
      }
      m.metadata = metadata;
      m.admins = metadata?.participants?.filter((p: any) => p.admin) || [];
      m.isAdmin = m.admins.some((a: any) => a.id === m.sender || a.phoneNumber === m.sender);
      m.isBotAdmin = m.admins.some((a: any) => [botNumber, botLid].includes(a.id) || [botNumber, botLid].includes(a.phoneNumber));
    }
  }

    if (m.message) {
    m.type = getContentType(m.message) || Object.keys(m.message)[0];
    m.msg = extractMessageContent(m.message[m.type]) || m.message[m.type];
    m.mentionedJid = m.msg?.contextInfo?.mentionedJid?.map((a: string) => s.findJidByLid(a, store, true)) || [];
    m.text = m.msg?.text || m.msg?.caption || m.message?.conversation || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || '';
    m.isMedia = !!m.msg?.mimetype || !!m.msg?.thumbnailDirectPath;

    if (m.isMedia) {
      m.mime = m.msg?.mimetype;
      m.size = m.msg?.fileLength;
    }

    m.quoted = m.msg?.contextInfo?.quotedMessage || null;
    if (m.quoted) {
      const qMsg = JSON.parse(JSON.stringify(m.msg.contextInfo.quotedMessage));
      const qSender = s.decodeJid(m.msg.contextInfo.participant || '');
      m.quoted = {
        ...qMsg,
        message: extractMessageContent(qMsg) || qMsg,
        type: getContentType(qMsg) || Object.keys(qMsg)[0],
        id: m.msg.contextInfo.stanzaId,
        chat: m.msg.contextInfo.remoteJid || m.chat,
        sender: qSender,
        fromMe: qSender === botNumber,
        text: qMsg?.conversation || qMsg?.caption || '',
        download: () => s.downloadMediaMessage(m.quoted),
        delete: () => {
          socket.sendMessage(m.quoted.chat, {
            delete: { remoteJid: m.quoted.chat, fromMe: false, id: m.quoted.id, participant: m.quoted.sender },
          });
        },
      };
    }
  }

  m.download = () => s.downloadMediaMessage(m);
  m.react = (emoji: string) => socket.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
  m.reply = async (content: string | object, options: any = {}) => {
    const chat = options.chat || m.chat;
    const quoted = options.quoted || m;
    const mentions = typeof content === 'string' ? [...content.matchAll(/@(\d{5,16})/g)].map((v) => `${v[1]}@s.whatsapp.net`) : [];
    if (typeof content === 'object') {
      return socket.sendMessage(chat, content as any, { quoted, ...options });
    }
    return socket.sendMessage(chat, { text: content, mentions }, { quoted, ...options });
  };

  return m;
}

// Handle group participants update
export async function handleGroupParticipantsUpdate(socket: WASocket, update: any, store: any): Promise<void> {
  try {
    const { id, participants, action } = update;
    const db = (global as any).db;
    if (!db?.groups?.[id] || !store?.groupMetadata?.[id]) return;

    const metadata = store.groupMetadata[id];

    for (const n of participants) {
      const jid = typeof n === 'string' ? n : n?.phoneNumber || n?.id || '';
      let profile: string;
      try {
        profile = await (ext(socket)).profilePictureUrl(jid, 'image') || 'https://telegra.ph/file/95670d63378f7f4210f03.png';
      } catch {
        profile = 'https://telegra.ph/file/95670d63378f7f4210f03.png';
      }

      let messageText: string | null = null;
      if (action === 'add' && db.groups[id].welcome) {
        messageText = db.groups[id]?.text?.setwelcome || `Welcome to ${metadata.subject}\n@`;
      } else if (action === 'remove' && db.groups[id].leave) {
        messageText = db.groups[id]?.text?.setleave || `@\nLeaving From ${metadata.subject}`;
      } else if (action === 'promote' && db.groups[id].promote) {
        messageText = db.groups[id]?.text?.setpromote || `@\nPromote From ${metadata.subject}\nBy @admin`;
      } else if (action === 'demote' && db.groups[id].demote) {
        messageText = db.groups[id]?.text?.setdemote || `@\nDemote From ${metadata.subject}\nBy @admin`;
      }

      if (messageText && (socket as any).public) {
        await socket.sendMessage(id, {
          text: messageText
            .replace('@subject', metadata.subject)
            .replace(/(?<=\s|^)@(?!\w)/g, `@${jid.split('@')[0]}`),
          contextInfo: {
            mentionedJid: [jid],
            externalAdReply: {
              title: action === 'add' ? 'Welcome' : action === 'remove' ? 'Leaving' : action.charAt(0).toUpperCase() + action.slice(1),
              mediaType: 1,
              thumbnailUrl: profile,
              sourceUrl: (global as any).my?.gh,
            },
          },
        });
      }
    }
  } catch (error) {
    logger.error('GRP', `Error in group-participants.update: ${(error as Error).message}`);
  }
}

// Handle group update
export async function handleGroupUpdate(socket: WASocket, m: any, store: any): Promise<void> {
  if (!m.messageStubType || !m.isGroup) return;

  const db = (global as any).db;
  const metadata = store.groupMetadata?.[m.chat];
  if (!db?.groups?.[m.chat] || !metadata) return;

  const admin = `@${m.sender.split('@')[0]}`;
  const normalizedTarget = JSON.parse(m.messageStubParameters[0]) || m.messageStubParameters[0];
  const type = m.messageStubType;

  const messages: Record<number, string> = {
    1: 'mereset link grup!',
    21: `mengubah Subject Grup menjadi: *${normalizedTarget}*`,
    22: 'telah mengubah icon grup.',
    24: `mengubah deskripsi grup.\n\n${normalizedTarget}`,
    26: `telah *${normalizedTarget === 'on' ? 'menutup' : 'membuka'}* grup!`,
    29: `telah menjadikan @${normalizedTarget?.id?.split('@')?.[0] || normalizedTarget} sebagai admin.`,
    30: `telah memberhentikan @${normalizedTarget?.id?.split('@')?.[0] || normalizedTarget} dari admin.`,
  };

  if ((socket as any).public && db.groups[m.chat].setinfo && messages[type]) {
    await socket.sendMessage(m.chat, { text: `${admin} ${messages[type]}`, mentions: [m.sender] });
  }
}

// Plugin handler - loads and routes commands to plugins
let pluginsLoaded = false;

async function loadPluginHandler(socket: WASocket, m: any, store: any, db: any): Promise<void> {
  // Load plugins once on first message
  if (!pluginsLoaded) {
    pluginsLoaded = true; // Set immediately to prevent race conditions
    try {
      const { loadPlugins, getAllCommands } = await import('./plugin-system.js');

      // Import all plugin categories
      const ownerPlugins = await import('../plugins/owner/index.js');
      const groupPlugins = await import('../plugins/group/index.js');
      const botPlugins = await import('../plugins/bot/index.js');
      const toolsPlugins = await import('../plugins/tools/index.js');
      const aiPlugins = await import('../plugins/ai/index.js');
      const searchPlugins = await import('../plugins/search/index.js');
      const downloaderPlugins = await import('../plugins/downloader/index.js');
      const funPlugins = await import('../plugins/fun/index.js');
      const menuPlugins = await import('../plugins/menu/index.js');

      loadPlugins(ownerPlugins);
      loadPlugins(groupPlugins);
      loadPlugins(botPlugins);
      loadPlugins(toolsPlugins);
      loadPlugins(aiPlugins);
      loadPlugins(searchPlugins);
      loadPlugins(downloaderPlugins);
      loadPlugins(funPlugins);
      loadPlugins(menuPlugins);

      console.log(`[Plugin] Loaded ${getAllCommands().length} commands`);
    } catch (error) {
      console.error('[Plugin] Failed to load plugins:', error);
    }
  }

  // Extract command from message
  const body = m.text || '';
  const prefix = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)?.[0] : '';
  const command = prefix ? body.replace(prefix, '').trim().split(/\s+/)[0]?.toLowerCase() : '';

  if (!command) return;

  // Check if command exists in plugin registry
  const { handleCommand, getCommand } = await import('./plugin-system.js');
  if (!getCommand(command)) return;

  // Determine if sender is creator
  const botNumber = socket.decodeJid(socket.user!.id);
  const ownerList = db?.set?.[botNumber]?.owner || db?.owner || [];
  const isCreator = ownerList.some((o: string) => {
    const ownerJid = o.includes('@') ? o : o + '@s.whatsapp.net';
    const findJid = socket.findJidByLid(ownerJid, store, true);
    return findJid === m.sender;
  });

  const args = body.trim().split(/\s+/).slice(1);
  const text = args.join(' ');

  await handleCommand(socket, m, store, db, prefix, command, args, text, isCreator || m.fromMe);
}
