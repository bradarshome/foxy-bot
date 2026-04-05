// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';
import path from 'path';

export const commands: PluginCommand[] = [
  {
    name: 'setmessbot',
    aliases: ["setbotmessages"],
    description: 'Set bot message language',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, text, db }) => {
      const { fetchJson, updateSettings } = await import('../../../lib/function.cjs');
      const res = await fetchJson('https://raw.githubusercontent.com/nazedev/database/refs/heads/master/bot/lang.json');
      if (res.some((a: any) => a.lang === text)) {
        const selectedLang = res.find((a: any) => a.lang === text);
        const settingsPath = path.join(process.cwd(), 'settings.cjs');
        await updateSettings({ filePath: settingsPath, newMess: selectedLang.messages });
        message.reply('Selesai!');
      } else message.reply(`Example: ${message.prefix + message.command} en\n*List Lang:*\n${res.map((a: any) => '- ' + a.lang).join('\n')}`);
    },
  },
  {
    name: 'setlimitbot',
    aliases: ["setbotlimit"],
    description: 'Set bot limit per role',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, args, db }) => {
      if (['free', 'premium', 'vip'].includes(args[0]) && !isNaN(Number(args[1]))) {
        const { updateSettings } = await import('../../../lib/function.cjs');
        const settingsPath = path.join(process.cwd(), 'settings.cjs');
        await updateSettings({ filePath: settingsPath, setLimitRole: { role: args[0], value: Number(args[1]) } });
        message.reply('Selesai!');
      } else message.reply(`Example: ${message.prefix + message.command} premium 10000\n*List Membership:*\n- free ${db.limit.free}\n- premium ${db.limit.premium}\n- vip ${db.limit.vip}`);
    },
  },
  {
    name: 'setmoneybot',
    aliases: ["setbotmoney"],
    description: 'Set bot money per role',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, args, db }) => {
      if (['free', 'premium', 'vip'].includes(args[0]) && !isNaN(Number(args[1]))) {
        const { updateSettings } = await import('../../../lib/function.cjs');
        const settingsPath = path.join(process.cwd(), 'settings.cjs');
        await updateSettings({ filePath: settingsPath, setMoneyRole: { role: args[0], value: Number(args[1]) } });
        message.reply('Selesai!');
      } else message.reply(`Example: ${message.prefix + message.command} premium 10000\n*List Membership:*\n- free ${db.money.free}\n- premium ${db.money.premium}\n- vip ${db.money.vip}`);
    },
  },
  {
    name: 'setnamebot',
    aliases: ["setbotname"],
    description: 'Set bot name',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, text }) => {
      if (text || message.quoted) {
        const teksnya = text ? text : message.quoted.text;
        const { updateSettings } = await import('../../../lib/function.cjs');
        const settingsPath = path.join(process.cwd(), 'settings.cjs');
        await updateSettings({ filePath: settingsPath, botname: teksnya.trim() });
        message.reply('Selesai!');
      } else message.reply(`Example: ${message.prefix + message.command} Foxy bot`);
    },
  },
  {
    name: 'setpacknamebot',
    aliases: ["setbotpackname"],
    description: 'Set sticker packname',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, text }) => {
      if (text || message.quoted) {
        const teksnya = text ? text : message.quoted.text;
        const { updateSettings } = await import('../../../lib/function.cjs');
        const settingsPath = path.join(process.cwd(), 'settings.cjs');
        await updateSettings({ filePath: settingsPath, packname: teksnya.trim() });
        message.reply('Selesai!');
      } else message.reply(`Example: ${message.prefix + message.command} By Foxy bot`);
    },
  },
  {
    name: 'setauthorbot',
    aliases: ["setbotauthor"],
    description: 'Set sticker author',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, text }) => {
      if (text || message.quoted) {
        const teksnya = text ? text : message.quoted.text;
        const { updateSettings } = await import('../../../lib/function.cjs');
        const settingsPath = path.join(process.cwd(), 'settings.cjs');
        await updateSettings({ filePath: settingsPath, author: teksnya.trim() });
        message.reply('Selesai!');
      } else message.reply(`Example: ${message.prefix + message.command} Foxy`);
    },
  },
  {
    name: 'setlocale',
    aliases: ["setlocalebot", "setbotlocale"],
    description: 'Set bot locale',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, text }) => {
      const locales = (await import('moment-timezone')).default.locales();
      if (text || message.quoted) {
        const teksnya = text ? text : message.quoted.text;
        if (!locales.includes(teksnya)) return message.reply('Locale List:\n' + locales.map(a => '- ' + a).join('\n'));
        const { updateSettings } = await import('../../../lib/function.cjs');
        const settingsPath = path.join(process.cwd(), 'settings.cjs');
        await updateSettings({ filePath: settingsPath, locale: teksnya.trim() });
        message.reply('Selesai!');
      } else message.reply(`Example: ${message.prefix + message.command} en`);
    },
  },
  {
    name: 'settimezone',
    aliases: ["settimezonebot", "setbottimezone"],
    description: 'Set bot timezone',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, text }) => {
      const timez = (await import('moment-timezone')).default.tz.names();
      if (text || message.quoted) {
        const teksnya = text ? text : message.quoted.text;
        if (!timez.includes(teksnya)) return message.reply('Timezone List:\n' + timez.map(a => '- ' + a).join('\n'));
        const { updateSettings } = await import('../../../lib/function.cjs');
        const settingsPath = path.join(process.cwd(), 'settings.cjs');
        await updateSettings({ filePath: settingsPath, timezone: teksnya.trim() });
        message.reply('Selesai!');
      } else message.reply(`Example: ${message.prefix + message.command} Asia/Jakarta`);
    },
  },
  {
    name: 'setapikey',
    aliases: ["setbotapikey"],
    description: 'Set API key',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, text, args, db }) => {
      if (!text) return message.reply('Mana apikey nya?');
      const { updateSettings } = await import('../../../lib/function.cjs');
      const settingsPath = path.join(process.cwd(), 'settings.cjs');
      if (args[0]?.toLowerCase() == 'neo') {
        if (!args[1]?.startsWith('nsk_')) return message.reply('Apikey Tidak Valid!\nAmbil Apikey di : https://app.neosantara.xyz/api-keys');
        await updateSettings({ filePath: settingsPath, neosantara: args[1].trim() });
        message.reply(`*Apikey telah di ganti*`);
      } else {
        if (!text.startsWith('nz-')) return message.reply('Apikey Tidak Valid!\nAmbil Apikey di : https://naze.biz.id/profile');
        await updateSettings({ filePath: settingsPath, apikey: text.trim() });
        message.reply(`*Apikey telah di ganti*`);
      }
    },
  },
  {
    name: 'addprefix',
    description: 'Add new prefix',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, text }) => {
      if (text || message.quoted) {
        const teksnya = text ? text : message.quoted.text;
        const { updateSettings } = await import('../../../lib/function.cjs');
        const settingsPath = path.join(process.cwd(), 'settings.cjs');
        await updateSettings({ filePath: settingsPath, addPrefix: teksnya.trim() });
        message.reply('Selesai!');
      } else message.reply(`Example: ${message.prefix + message.command} textnya`);
    },
  },
  {
    name: 'delprefix',
    aliases: ["removeprefix"],
    description: 'Remove prefix',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, text }) => {
      if (text || message.quoted) {
        const teksnya = text ? text : message.quoted.text;
        const { updateSettings } = await import('../../../lib/function.cjs');
        const settingsPath = path.join(process.cwd(), 'settings.cjs');
        await updateSettings({ filePath: settingsPath, removePrefix: teksnya.trim() });
        message.reply('Selesai!');
      } else message.reply(`Example: ${message.prefix + message.command} textnya`);
    },
  },
  {
    name: 'addtoxic',
    aliases: ["addbadword"],
    description: 'Add bad word',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, text }) => {
      if (text || message.quoted) {
        const teksnya = text ? text : message.quoted.text;
        const { updateSettings } = await import('../../../lib/function.cjs');
        const settingsPath = path.join(process.cwd(), 'settings.cjs');
        await updateSettings({ filePath: settingsPath, addBadword: teksnya.trim() });
        message.reply('Selesai!');
      } else message.reply(`Example: ${message.prefix + message.command} textnya`);
    },
  },
  {
    name: 'deltoxic',
    aliases: ["delbadword"],
    description: 'Remove bad word',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, text }) => {
      if (text || message.quoted) {
        const teksnya = text ? text : message.quoted.text;
        const { updateSettings } = await import('../../../lib/function.cjs');
        const settingsPath = path.join(process.cwd(), 'settings.cjs');
        await updateSettings({ filePath: settingsPath, removeBadword: teksnya.trim() });
        message.reply('Selesai!');
      } else message.reply(`Example: ${message.prefix + message.command} textnya`);
    },
  },
];
