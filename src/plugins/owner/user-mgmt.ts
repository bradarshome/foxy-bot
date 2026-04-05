// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';
import fs from 'fs';
import path from 'path';

export const commands: PluginCommand[] = [
  {
    name: 'ban',
    aliases: ['banned'],
    description: 'Ban a user',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, text, db, store }) => {
      if (!text) return message.reply(`Kirim/tag Nomernya!\nExample:\n${message.prefix + message.command} 62xxx`);
      const findJid = socket.findJidByLid(text.replace(/[^0-9]/g, '') + '@lid', store);
      const klss = text.replace(/[^0-9]/g, '') + (findJid ? '@lid' : '@s.whatsapp.net');
      const nmrnya = socket.findJidByLid(klss, store, true);
      if (db.users[nmrnya] && !db.users[nmrnya].ban) {
        db.users[nmrnya].ban = true;
        message.reply('Selesai!');
      } else message.reply('User tidak terdaftar di database!');
    },
  },
  {
    name: 'unban',
    aliases: ['unbanned'],
    description: 'Unban a user',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, text, db, store }) => {
      if (!text) return message.reply(`Kirim/tag Nomernya!\nExample:\n${message.prefix + message.command} 62xxx`);
      const findJid = socket.findJidByLid(text.replace(/[^0-9]/g, '') + '@lid', store);
      const klss = text.replace(/[^0-9]/g, '') + (findJid ? '@lid' : '@s.whatsapp.net');
      const nmrnya = socket.findJidByLid(klss, store, true);
      if (db.users[nmrnya] && db.users[nmrnya].ban) {
        db.users[nmrnya].ban = false;
        message.reply('Selesai!');
      } else message.reply('User tidak terdaftar di database!');
    },
  },
  {
    name: 'mute',
    description: 'Mute bot in current group',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, db }) => {
      if (!message.isGroup) return message.reply('Khusus Grup!');
      db.groups[message.chat].mute = true;
      message.reply('Bot Telah Di Mute Di Grup Ini!');
    },
  },
  {
    name: 'unmute',
    description: 'Unmute bot in current group',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, db }) => {
      if (!message.isGroup) return message.reply('Khusus Grup!');
      db.groups[message.chat].mute = false;
      message.reply('Selesai! Unmute');
    },
  },
  {
    name: 'addowner',
    description: 'Add a new owner',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, text, db, store }) => {
      if (!text) return message.reply(`Kirim/tag Nomernya!\nExample:\n${message.prefix + message.command} 62xxx`);
      const nmrnya = socket.findJidByLid(text.replace(/[^0-9]/g, ''), store, true);
      const onWa = await socket.onWhatsApp(nmrnya);
      if (!onWa.length > 0) return message.reply('Nomor tersebut tidak terdaftar di WhatsApp!');
      const set = db.set[socket.decodeJid(socket.user!.id)];
      if (set?.owner) {
        if (set.owner.find((a: string) => nmrnya.includes(a))) return message.reply('Nomer Tersebut Sudah Ada Di Owner!');
        set.owner.push(nmrnya.split('@')[0]);
        const settingsPath = path.join(process.cwd(), 'settings.cjs');
        const { updateSettings } = await import('../../../lib/function.js');
        await updateSettings({ filePath: settingsPath, owner: set.owner });
      }
      message.reply('Selesai!');
    },
  },
  {
    name: 'delowner',
    description: 'Remove an owner',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, text, db, store }) => {
      if (!text) return message.reply(`Kirim/tag Nomernya!\nExample:\n${message.prefix + message.command} 62xxx`);
      const nmrnya = socket.findJidByLid(text.replace(/[^0-9]/g, ''), store, true);
      const onWa = await socket.onWhatsApp(nmrnya);
      if (!onWa.length > 0) return message.reply('Nomor tersebut tidak terdaftar di WhatsApp!');
      const botNumber = socket.decodeJid(socket.user!.id);
      if (botNumber === nmrnya) return message.reply('Nomer Bot Tidak Boleh dihapus dari owner!');
      const set = db.set[botNumber];
      const list = set.owner;
      const index = list.findIndex((o: string) => o === nmrnya.split('@')[0]);
      if (index === -1) return message.reply('Owner tidak ditemukan di daftar!');
      list.splice(index, 1);
      const settingsPath = path.join(process.cwd(), 'settings.cjs');
      const { updateSettings } = await import('../../../lib/function.js');
      await updateSettings({ filePath: settingsPath, owner: set.owner });
      message.reply('Selesai!');
    },
  },
  {
    name: 'adduang',
    aliases: ['addmoney'],
    description: 'Add money to a user',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, args, db, store }) => {
      if (!args[0] || !args[1] || isNaN(Number(args[1]))) return message.reply(`Kirim/tag Nomernya!\nExample:\n${message.prefix + message.command} 62xxx 1000`);
      if (args[1].length > 15) return message.reply('Jumlah Money Maksimal 15 digit angka!');
      const findJid = socket.findJidByLid(args[0].replace(/[^0-9]/g, '') + '@lid', store);
      const klss = args[0].replace(/[^0-9]/g, '') + (findJid ? '@lid' : '@s.whatsapp.net');
      const nmrnya = socket.findJidByLid(klss, store, true);
      const onWa = await socket.onWhatsApp(nmrnya);
      if (!onWa.length > 0) return message.reply('Nomor tersebut tidak terdaftar di WhatsApp!');
      if (db.users[nmrnya] && db.users[nmrnya].money >= 0) {
        const { addMoney } = await import('../../../lib/game.js');
        addMoney(args[1], nmrnya, db);
        message.reply('Selesai!');
      } else message.reply('User tidak terdaftar di database!');
    },
  },
  {
    name: 'addlimit',
    description: 'Add limit to a user',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, args, db, store }) => {
      if (!args[0] || !args[1] || isNaN(Number(args[1]))) return message.reply(`Kirim/tag Nomernya!\nExample:\n${message.prefix + message.command} 62xxx 10`);
      if (args[1].length > 10) return message.reply('Jumlah Limit Maksimal 10 digit angka!');
      const findJid = socket.findJidByLid(args[0].replace(/[^0-9]/g, '') + '@lid', store);
      const klss = args[0].replace(/[^0-9]/g, '') + (findJid ? '@lid' : '@s.whatsapp.net');
      const nmrnya = socket.findJidByLid(klss, store, true);
      const onWa = await socket.onWhatsApp(nmrnya);
      if (!onWa.length > 0) return message.reply('Nomor tersebut tidak terdaftar di WhatsApp!');
      if (db.users[nmrnya] && db.users[nmrnya].limit >= 0) {
        const { addLimit } = await import('../../../lib/game.js');
        addLimit(args[1], nmrnya, db);
        message.reply('Selesai!');
      } else message.reply('User tidak terdaftar di database!');
    },
  },
  {
    name: 'listpc',
    description: 'List all private chats',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, store, db }) => {
      const anu = Object.keys(store.messages).filter(a => a.endsWith('.net') || a.endsWith('lid'));
      let teks = '● *LIST PERSONAL CHAT*\n\nTotal Chat : ' + anu.length + ' Chat\n\n';
      if (anu.length === 0) return message.reply(teks);
      const listv = db?.listv || ['•'];
      const setv = listv[Math.floor(Math.random() * listv.length)];
      for (const i of anu) {
        if (store.messages?.[i]?.array?.length) {
          const nama = socket.getName(i);
          teks += `${setv} *Nama :* ${nama}\n${setv} *User :* @${i.split('@')[0]}\n${setv} *Chat :* https://wa.me/${i.split('@')[0]}\n\n=====================\n\n`;
        }
      }
      await message.reply(teks);
    },
  },
  {
    name: 'listgc',
    description: 'List all group chats',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, store, db }) => {
      const moment = (await import('moment-timezone')).default;
      const timezone = db?.timezone || 'Asia/Jakarta';
      const anu = Object.keys(store.messages).filter(a => a.endsWith('@g.us'));
      let teks = '● *LIST GROUP CHAT*\n\nTotal Group : ' + anu.length + ' Group\n\n';
      if (anu.length === 0) return message.reply(teks);
      const listv = db?.listv || ['•'];
      const setv = listv[Math.floor(Math.random() * listv.length)];
      for (const i of anu) {
        let metadata;
        try {
          metadata = store.groupMetadata[i];
        } catch {
          metadata = (store.groupMetadata[i] = await socket.groupMetadata(i).catch(() => ({})));
        }
        if (metadata?.subject) {
          teks += `${setv} *Nama :* ${metadata.subject}\n${setv} *Admin :* ${metadata.ownerPn ? `@${metadata.ownerPn.split('@')[0]}` : '-'}\n${setv} *ID :* ${metadata.id}\n${setv} *Dibuat :* ${moment(metadata.creation * 1000).tz(timezone).format('DD/MM/YYYY HH:mm:ss')}\n${setv} *Member :* ${metadata.participants.length}\n\n=====================\n\n`;
        }
      }
      await message.reply(teks);
    },
  },
  {
    name: 'creategc',
    aliases: ['buatgc'],
    description: 'Create a new group',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, text }) => {
      if (!text) return message.reply(`Example:\n${message.prefix + message.command} *Nama Gc*`);
      const group = await socket.groupCreate(text, [message.sender]);
      const res = await socket.groupInviteCode(group.id);
      await message.reply(`*Link Group :* *https://chat.whatsapp.com/${res}*\n\n*Nama Group :* *${group.subject}*\nSegera Masuk dalam 30 detik\nAgar menjadi Admin`, { detectLink: true });
      await new Promise(resolve => setTimeout(resolve, 30000));
      await socket.groupParticipantsUpdate(group.id, [message.sender], 'promote').catch(() => {});
      await socket.sendMessage(group.id, { text: 'Selesai!' });
    },
  },
];
