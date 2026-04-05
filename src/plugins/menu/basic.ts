// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';

export const commands: PluginCommand[] = [
  {
    name: 'menu',
    aliases: ['allmenu', 'all', 'help'],
    description: 'Show all commands menu',
    category: 'Menu',
    handler: async ({ message, db, args, isCreator, socket }) => {
      // Handle .menu set <1,2,3>
      if (args[0] === 'set') {
        if (!isCreator) return message.reply('Owner only!');
        if (['1', '2', '3'].includes(args[1])) {
          const botNumber = socket.decodeJid(socket.user!.id);
          if (!db.set[botNumber]) db.set[botNumber] = {};
          db.set[botNumber].template = parseInt(args[1]);
          message.reply('Sukses Mengubah Template Menu');
        } else {
          message.reply(`Template Menu:\n- 1 (Button Menu)\n- 2 (List Menu)\n- 3 (Document Menu)\n\nExample: ${message.prefix + message.command} set 1`);
        }
        return;
      }

      const { getAllCommands, getCategories } = await import('../../core/plugin-system.js');
      const commands = getAllCommands();
      const categories = getCategories();
      const prefix = message.prefix;
      const botname = db?.set?.[message.chat]?.botname || db?.botname || 'Foxy Bot';
      const author = db?.set?.[message.chat]?.author || db?.author || 'Foxy Bot';

      let menuText = `╭──❍「 *${botname}* 」❍\n`;
      menuText += `│ Prefix: ${prefix}\n`;
      menuText += `│ Total Fitur: ${commands.length}\n`;
      menuText += `│ Owner: ${author}\n`;
      menuText += `╰──────❍\n\n`;

      for (const category of categories) {
        const cmds = commands.filter(c => c.category === category);
        if (cmds.length === 0) continue;
        menuText += `╭──❍「 *${category.toUpperCase()}* 」❍\n`;
        for (const cmd of cmds) {
          const aliases = cmd.aliases && cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
          menuText += `│• ${prefix}${cmd.name}${aliases}\n`;
        }
        menuText += `╰──────❍\n\n`;
      }

      message.reply(menuText);
    },
  },
  {
    name: 'ownermenu',
    description: 'Show owner commands',
    category: 'Menu',
    handler: async ({ message, db }) => {
      const { getCommandsByCategory } = await import('../../core/plugin-system.js');
      const cmds = getCommandsByCategory('Owner');
      const prefix = message.prefix;
      let txt = `╭──❍「 *OWNER MENU* 」❍\n`;
      for (const cmd of cmds) {
        const aliases = cmd.aliases && cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
        txt += `│• ${prefix}${cmd.name}${aliases}\n`;
      }
      txt += `╰──────❍\n\nTotal: ${cmds.length} commands`;
      message.reply(txt);
    },
  },
  {
    name: 'groupmenu',
    description: 'Show group commands',
    category: 'Menu',
    handler: async ({ message, db }) => {
      const { getCommandsByCategory } = await import('../../core/plugin-system.js');
      const cmds = getCommandsByCategory('Group');
      const prefix = message.prefix;
      let txt = `╭──❍「 *GROUP MENU* 」❍\n`;
      for (const cmd of cmds) {
        const aliases = cmd.aliases && cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
        txt += `│• ${prefix}${cmd.name}${aliases}\n`;
      }
      txt += `╰──────❍\n\nTotal: ${cmds.length} commands`;
      message.reply(txt);
    },
  },
  {
    name: 'toolsmenu',
    description: 'Show tools commands',
    category: 'Menu',
    handler: async ({ message, db }) => {
      const { getCommandsByCategory } = await import('../../core/plugin-system.js');
      const cmds = getCommandsByCategory('Tools');
      const prefix = message.prefix;
      let txt = `╭──❍「 *TOOLS MENU* 」❍\n`;
      for (const cmd of cmds) {
        const aliases = cmd.aliases && cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
        txt += `│• ${prefix}${cmd.name}${aliases}\n`;
      }
      txt += `╰──────❍\n\nTotal: ${cmds.length} commands`;
      message.reply(txt);
    },
  },
  {
    name: 'downloadmenu',
    description: 'Show downloader commands',
    category: 'Menu',
    handler: async ({ message, db }) => {
      const { getCommandsByCategory } = await import('../../core/plugin-system.js');
      const cmds = getCommandsByCategory('Downloader');
      const prefix = message.prefix;
      let txt = `╭──❍「 *DOWNLOADER MENU* 」❍\n`;
      for (const cmd of cmds) {
        const aliases = cmd.aliases && cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
        txt += `│• ${prefix}${cmd.name}${aliases}\n`;
      }
      txt += `╰──────❍\n\nTotal: ${cmds.length} commands`;
      message.reply(txt);
    },
  },
  {
    name: 'searchmenu',
    description: 'Show search commands',
    category: 'Menu',
    handler: async ({ message, db }) => {
      const { getCommandsByCategory } = await import('../../core/plugin-system.js');
      const cmds = getCommandsByCategory('Search');
      const prefix = message.prefix;
      let txt = `╭──❍「 *SEARCH MENU* 」❍\n`;
      for (const cmd of cmds) {
        const aliases = cmd.aliases && cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
        txt += `│• ${prefix}${cmd.name}${aliases}\n`;
      }
      txt += `╰──────❍\n\nTotal: ${cmds.length} commands`;
      message.reply(txt);
    },
  },
  {
    name: 'aimenu',
    description: 'Show AI commands',
    category: 'Menu',
    handler: async ({ message, db }) => {
      const { getCommandsByCategory } = await import('../../core/plugin-system.js');
      const cmds = getCommandsByCategory('AI');
      const prefix = message.prefix;
      let txt = `╭──❍「 *AI MENU* 」❍\n`;
      for (const cmd of cmds) {
        const aliases = cmd.aliases && cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
        txt += `│• ${prefix}${cmd.name}${aliases}\n`;
      }
      txt += `╰──────❍\n\nTotal: ${cmds.length} commands`;
      message.reply(txt);
    },
  },
  {
    name: 'funmenu',
    description: 'Show fun commands',
    category: 'Menu',
    handler: async ({ message, db }) => {
      const { getCommandsByCategory } = await import('../../core/plugin-system.js');
      const cmds = getCommandsByCategory('Fun');
      const prefix = message.prefix;
      let txt = `╭──❍「 *FUN MENU* 」❍\n`;
      for (const cmd of cmds) {
        const aliases = cmd.aliases && cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
        txt += `│• ${prefix}${cmd.name}${aliases}\n`;
      }
      txt += `╰──────❍\n\nTotal: ${cmds.length} commands`;
      message.reply(txt);
    },
  },
  {
    name: 'randommenu',
    description: 'Show random commands',
    category: 'Menu',
    handler: async ({ message, db }) => {
      const { getCommandsByCategory } = await import('../../core/plugin-system.js');
      const cmds = getCommandsByCategory('Fun');
      const prefix = message.prefix;
      let txt = `╭──❍「 *RANDOM MENU* 」❍\n`;
      for (const cmd of cmds) {
        const aliases = cmd.aliases && cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
        txt += `│• ${prefix}${cmd.name}${aliases}\n`;
      }
      txt += `╰──────❍\n\nTotal: ${cmds.length} commands`;
      message.reply(txt);
    },
  },
  {
    name: 'stalkermenu',
    description: 'Show stalker commands',
    category: 'Menu',
    handler: async ({ message, db }) => {
      const { getCommandsByCategory } = await import('../../core/plugin-system.js');
      const cmds = [...getCommandsByCategory('Search')].filter(c => c.name.includes('stalk'));
      const prefix = message.prefix;
      let txt = `╭──❍「 *STALKER MENU* 」❍\n`;
      for (const cmd of cmds) {
        const aliases = cmd.aliases && cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
        txt += `│• ${prefix}${cmd.name}${aliases}\n`;
      }
      txt += `╰──────❍\n\nTotal: ${cmds.length} commands`;
      message.reply(txt);
    },
  },
  {
    name: 'quotesmenu',
    description: 'Show quotes commands',
    category: 'Menu',
    handler: async ({ message, db }) => {
      const { getCommandsByCategory } = await import('../../core/plugin-system.js');
      const cmds = getCommandsByCategory('Fun').filter(c => ['motivasi', 'bijak', 'quotes', 'truth', 'dare', 'bucin', 'renungan'].includes(c.name));
      const prefix = message.prefix;
      let txt = `╭──❍「 *QUOTES MENU* 」❍\n`;
      for (const cmd of cmds) {
        txt += `│• ${prefix}${cmd.name}\n`;
      }
      txt += `╰──────❍`;
      message.reply(txt);
    },
  },
  {
    name: 'animemenu',
    description: 'Show anime commands',
    category: 'Menu',
    handler: async ({ message, db }) => {
      const { getCommandsByCategory } = await import('../../core/plugin-system.js');
      const cmds = getCommandsByCategory('Fun').filter(c => ['waifu', 'neko'].includes(c.name));
      const prefix = message.prefix;
      let txt = `╭──❍「 *ANIME MENU* 」❍\n`;
      for (const cmd of cmds) {
        txt += `│• ${prefix}${cmd.name}\n`;
      }
      txt += `╰──────❍`;
      message.reply(txt);
    },
  },
  {
    name: 'gamemenu',
    description: 'Show game commands',
    category: 'Menu',
    handler: async ({ message, db }) => {
      const { getCommandsByCategory } = await import('../../core/plugin-system.js');
      const cmds = getCommandsByCategory('Game');
      const prefix = message.prefix;
      let txt = `╭──❍「 *GAME MENU* 」❍\n`;
      for (const cmd of cmds) {
        const aliases = cmd.aliases && cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
        txt += `│• ${prefix}${cmd.name}${aliases}\n`;
      }
      txt += `╰──────❍\n\nTotal: ${cmds.length} commands`;
      message.reply(txt);
    },
  },
  {
    name: 'botmenu',
    description: 'Show bot commands',
    category: 'Menu',
    handler: async ({ message, db }) => {
      const { getCommandsByCategory } = await import('../../core/plugin-system.js');
      const cmds = getCommandsByCategory('Bot');
      const prefix = message.prefix;
      let txt = `╭──❍「 *BOT MENU* 」❍\n`;
      for (const cmd of cmds) {
        const aliases = cmd.aliases && cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
        txt += `│• ${prefix}${cmd.name}${aliases}\n`;
      }
      txt += `╰──────❍\n\nTotal: ${cmds.length} commands`;
      message.reply(txt);
    },
  },
  {
    name: 'sc',
    aliases: ['script'],
    description: 'Show bot script source',
    category: 'Menu',
    handler: async ({ message, db }) => {
      const author = db?.author || 'Foxy Bot';
      const my = db?.my || {};
      const fake = db?.fake || {};
      await message.reply(`https://github.com/nazedev/hitori\n⬆️ Itu Sc nya cuy`, {
        contextInfo: {
          forwardingScore: 10,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: my.ch || '',
            serverMessageId: null,
            newsletterName: 'Join For More Info',
          },
          externalAdReply: {
            title: author,
            body: 'Subscribe My YouTube',
            thumbnail: fake.thumbnail,
            mediaType: 2,
            mediaUrl: my.yt,
            sourceUrl: my.yt,
          },
        },
      });
    },
  },
  {
    name: 'donasi',
    aliases: ['donate'],
    description: 'Show donation info',
    category: 'Menu',
    handler: async ({ message }) => {
      message.reply('Donasi Dapat Melalui Url Dibawah Ini :\nhttps://saweria.co/naze');
    },
  },
  {
    name: 'totalfitur',
    description: 'Show total features',
    category: 'Menu',
    handler: async ({ message }) => {
      const { getAllCommands } = await import('../../core/plugin-system.js');
      const total = getAllCommands().length;
      message.reply(`Total Fitur : ${total}`);
    },
  },
];
