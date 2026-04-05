// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';

export const commands: PluginCommand[] = [
  {
    name: 'addsewa',
    aliases: ['sewa'],
    description: 'Add group to sewa list',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, text, db }) => {
      if (!text) return message.reply(`Example:\n${message.prefix + message.command} https://chat.whatsapp.com/xxx | waktu\n${message.prefix + message.command} https://chat.whatsapp.com/xxx | 30 hari`);
      const [teks1, teks2] = text.split('|')?.map(x => x.trim()) || [];
      const isUrl = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;
      if (!isUrl.test(teks1) && !teks1.includes('chat.whatsapp.com/')) return message.reply('Link Invalid!');
      const urlny = teks1.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/);
      if (!urlny) return message.reply('Link Invalid!');
      try {
        await socket.groupAcceptInvite(urlny[1]);
      } catch (e: any) {
        if (e.data == 400) return message.reply('Grup Tidak Ditemukan!');
        if (e.data == 401) return message.reply('Bot Di Kick Dari Grup Tersebut!');
        if (e.data == 410) return message.reply('Url Grup Telah Di Setel Ulang!');
        if (e.data == 500) return message.reply('Grup Penuh!');
      }
      const { addExpired } = await import('../../database/commands.js');
      await socket.groupGetInviteInfo(urlny[1]).then(a => {
        addExpired({ url: urlny[1], expired: (teks2?.replace(/[^0-9]/g, '') || 30) + 'd', id: a.id }, db.sewa);
        message.reply('Sukses Menambahkan Sewa Selama ' + (teks2?.replace(/[^0-9]/g, '') || 30) + ' hari\nOtomatis Keluar Saat Waktu Habis!');
      }).catch(() => message.reply('Gagal Menambahkan Sewa!'));
    },
  },
  {
    name: 'delsewa',
    description: 'Remove group from sewa list',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, text, db }) => {
      if (!text) return message.reply(`Example:\n${message.prefix + message.command} https://chat.whatsapp.com/xxxx\n Or \n${message.prefix + message.command} id_group@g.us`);
      let urlny: string;
      if (text.includes('chat.whatsapp.com/')) {
        urlny = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/)?.[1] || '';
      } else if (/@g\.us$/.test(text)) {
        urlny = text.trim();
      } else {
        return message.reply('Format tidak valid!');
      }
      const { checkStatus, getPosition } = await import('../../database/commands.js');
      if (checkStatus(urlny, db.sewa)) {
        await message.reply('Selesai!');
        await socket.groupLeave(getStatus(urlny, db.sewa).id).catch(() => {});
        db.sewa.splice(getPosition(urlny, db.sewa), 1);
      } else message.reply(`${text} Tidak Terdaftar Di Database`);
    },
  },
  {
    name: 'listsewa',
    description: 'List all sewa groups',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, db }) => {
      const { formatDate } = await import('../../../lib/function.js');
      let txt = '*------「 LIST SEWA 」------*\n\n';
      for (const s of db.sewa) {
        txt += `➸ *ID*: ${s.id}\n➸ *Url*: https://chat.whatsapp.com/${s.url}\n➸ *Expired*: ${formatDate(s.expired)}\n\n`;
      }
      message.reply(txt);
    },
  },
  {
    name: 'addpr',
    aliases: ['addprem', 'addpremium'],
    description: 'Add user to premium',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, text, db, store }) => {
      if (!text) return message.reply(`Example:\n${message.prefix + message.command} @tag|waktu\n${message.prefix + message.command} @${message.sender.split('@')[0]}|30 hari`);
      const [teks1, teks2] = text.split('|').map(x => x.trim());
      const findJid = socket.findJidByLid(teks1.replace(/[^0-9]/g, '') + '@lid', store);
      const klss = teks1.replace(/[^0-9]/g, '') + (findJid ? '@lid' : '@s.whatsapp.net');
      const nmrnya = socket.findJidByLid(klss, store, true);
      const onWa = await socket.onWhatsApp(nmrnya);
      if (!onWa.length > 0) return message.reply('Nomor tersebut tidak terdaftar di WhatsApp!');
      if (teks2) {
        if (db.users[nmrnya] && db.users[nmrnya].limit >= 0) {
          const { addExpired } = await import('../../database/commands.js');
          const { checkStatus } = await import('../../database/commands.js');
          addExpired({ id: nmrnya, expired: teks2.replace(/[^0-9]/g, '') + 'd' }, db.premium);
          message.reply(`Sukses ${message.command} @${nmrnya.split('@')[0]} Selama ${teks2}`);
          const limit = db.limit;
          const money = db.money;
          db.users[nmrnya].limit += db.users[nmrnya].vip ? limit.vip : limit.premium;
          db.users[nmrnya].money += db.users[nmrnya].vip ? money.vip : money.premium;
        } else message.reply('Nomer tidak terdaftar di BOT!\nPastikan Nomer Pernah Menggunakan BOT!');
      } else message.reply(`Masukkan waktunya!\nExample:\n${message.prefix + message.command} @tag|waktu\n${message.prefix + message.command} @${message.sender.split('@')[0]}|30d\n_d = day_`);
    },
  },
  {
    name: 'delpr',
    aliases: ['delprem', 'delpremium'],
    description: 'Remove user from premium',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, text, db, store }) => {
      if (!text) return message.reply(`Example:\n${message.prefix + message.command} @tag`);
      const findJid = socket.findJidByLid(text.replace(/[^0-9]/g, '') + '@lid', store);
      const klss = text.replace(/[^0-9]/g, '') + (findJid ? '@lid' : '@s.whatsapp.net');
      const nmrnya = socket.findJidByLid(klss, store, true);
      if (db.users[nmrnya] && db.users[nmrnya].limit >= 0) {
        const { checkStatus, getPosition } = await import('../../database/commands.js');
        if (checkStatus(nmrnya, db.premium)) {
          db.premium.splice(getPosition(nmrnya, db.premium), 1);
          message.reply(`Sukses ${message.command} @${nmrnya.split('@')[0]}`);
          const limit = db.limit;
          const money = db.money;
          db.users[nmrnya].limit += db.users[nmrnya].vip ? limit.vip : limit.free;
          db.users[nmrnya].money += db.users[nmrnya].vip ? money.vip : money.free;
        } else message.reply(`User @${nmrnya.split('@')[0]} Bukan Premium!`);
      } else message.reply('Nomer tidak terdaftar di BOT!');
    },
  },
  {
    name: 'listpr',
    aliases: ['listprem', 'listpremium'],
    description: 'List all premium users',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, db }) => {
      const { formatDate } = await import('../../../lib/function.js');
      let txt = '*------「 LIST PREMIUM 」------*\n\n';
      for (const userprem of db.premium) {
        txt += `➸ *Nomer*: @${userprem.id.split('@')[0]}\n➸ *Limit*: ${db.users[userprem.id].limit}\n➸ *Money*: ${db.users[userprem.id].money.toLocaleString('id-ID')}\n➸ *Expired*: ${formatDate(userprem.expired)}\n\n`;
      }
      message.reply(txt);
    },
  },
];
