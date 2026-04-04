// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';
import fs from 'fs';
import { exec } from 'child_process';
import { updateSettings } from '../../lib/function.js';

export const commands: PluginCommand[] = [
  {
    name: 'shutdown',
    aliases: ['off'],
    description: 'Shutdown bot',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message }) => {
      await message.reply('*[BOT] Process Shutdown...*');
      process.exit(0);
    },
  },
  {
    name: 'update',
    aliases: ['upgrade'],
    description: 'Update bot',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message }) => {
      await message.reply('*[BOT] Process Update And Upgrade...*');
      try {
        const { runUpdate } = await import('../../lib/function.js');
        runUpdate();
      } catch {
        process.exit(0);
      }
    },
  },
  {
    name: 'setbio',
    description: 'Set bot bio/status',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, text }) => {
      if (!text) return message.reply('Masukkan teksnya!');
      await socket.setStatus(text);
      message.reply(`*Bio telah di ganti menjadi ${text}*`);
    },
  },
  {
    name: 'setppbot',
    description: 'Set bot profile picture',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message }) => {
      if (!message.quoted || !/image/.test(message.quoted.type || '')) {
        return message.reply(`Reply Image Dengan Caption ${message.prefix + message.command}`);
      }
      const media = await message.quoted.download();
      const { generateProfilePicture } = await import('../../lib/function.js');
      const { img } = await generateProfilePicture(media);
      await socket.query({
        tag: 'iq',
        attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'w:profile:picture' },
        content: [{ tag: 'picture', attrs: { type: 'image' }, content: img }],
      });
      message.reply('Selesai!');
    },
  },
  {
    name: 'delppbot',
    description: 'Delete bot profile picture',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message }) => {
      await socket.removeProfilePicture(socket.user!.id);
      message.reply('Selesai!');
    },
  },
  {
    name: 'join',
    description: 'Join group via link',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, text, args }) => {
      if (!text) return message.reply('Masukkan Link Group!');
      const isUrl = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;
      if (!isUrl.test(args[0]) && !args[0].includes('whatsapp.com')) return message.reply('Link Invalid!');
      const result = args[0].match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/);
      if (!result) return message.reply('Link Invalid!');
      await message.reply('Proses...');
      await socket.groupAcceptInvite(result[1]).catch((res: any) => {
        if (res.data == 400) return message.reply('Grup Tidak Ditemukan!');
        if (res.data == 401) return message.reply('Bot Di Kick Dari Grup Tersebut!');
        if (res.data == 409) return message.reply('Bot Sudah Join Di Grup Tersebut!');
        if (res.data == 410) return message.reply('Url Grup Telah Di Setel Ulang!');
        if (res.data == 500) return message.reply('Grup Penuh!');
      });
    },
  },
  {
    name: 'leave',
    description: 'Leave current group',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, db }) => {
      const ownerNumber = db?.set?.[socket.decodeJid(socket.user!.id)]?.owner || db?.owner || [];
      await socket.groupLeave(message.chat).then(() => {
        socket.sendFromOwner(ownerNumber, 'Sukses Keluar Dari Grup', message, { contextInfo: { isForwarded: true } });
      }).catch(() => {});
    },
  },
  {
    name: 'clearchat',
    description: 'Clear chat history',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message }) => {
      await socket.chatModify({ delete: true, lastMessages: [{ key: message.key, messageTimestamp: message.timestamp }] }, message.chat).catch(() => message.reply('Gagal Menghapus Chat!'));
      message.reply('Selesai!');
    },
  },
  {
    name: 'block',
    aliases: ['blokir'],
    description: 'Block a user',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, text }) => {
      if (text || message.quoted) {
        const numbersOnly = message.isGroup ? (text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : message.quoted?.sender) : message.chat;
        await socket.updateBlockStatus(numbersOnly, 'block').then(() => message.reply('Selesai!')).catch(() => message.reply('Gagal!'));
      } else message.reply(`Example: ${message.prefix + message.command} 62xxx`);
    },
  },
  {
    name: 'unblock',
    aliases: ['unblokir', 'openblokir', 'openblock'],
    description: 'Unblock a user',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, text }) => {
      if (text || message.quoted) {
        const numbersOnly = message.isGroup ? (text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : message.quoted?.sender) : message.chat;
        await socket.updateBlockStatus(numbersOnly, 'unblock').then(() => message.reply('Selesai!')).catch(() => message.reply('Gagal!'));
      } else message.reply(`Example: ${message.prefix + message.command} 62xxx`);
    },
  },
  {
    name: 'listblock',
    description: 'List blocked users',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message }) => {
      const anu = await socket.fetchBlocklist();
      message.reply(`Total Block : ${anu.length}\n` + anu.map(v => '• ' + v.replace(/@.+/, '')).join('\n'));
    },
  },
];
