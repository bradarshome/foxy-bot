// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';

export const commands: PluginCommand[] = [
  {
    name: 'group',
    aliases: ['grup', 'gc'],
    description: 'Group settings management',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    handler: async ({ socket, message, args, db }) => {
      const set = db.groups[message.chat];
      switch (args[0]?.toLowerCase()) {
        case 'close':
        case 'open':
          await socket.groupSettingUpdate(message.chat, args[0] == 'close' ? 'announcement' : 'not_announcement').then(() => message.reply(`*Sukses ${args[0] == 'open' ? 'Membuka' : 'Menutup'} Group*`));
          break;
        case 'join': {
          const _list = await socket.groupRequestParticipantsList(message.chat).then(a => a.map(b => b.jid));
          if (/(a(p|pp|cc)|(ept|rove))|true|ok/i.test(args[1]) && _list.length > 0) {
            await socket.groupRequestParticipantsUpdate(message.chat, _list, 'approve').catch(() => message.react('❌'));
          } else if (/reject|false|no/i.test(args[1]) && _list.length > 0) {
            await socket.groupRequestParticipantsUpdate(message.chat, _list, 'reject').catch(() => message.react('❌'));
          } else message.reply(`List Request Join :\n${_list.length > 0 ? '- @' + _list.join('\n- @').split('@')[0] : '*Nothing*'}\nExample : ${message.prefix + message.command} join acc/reject`);
          break;
        }
        case 'pesansementara':
        case 'disappearing':
          if (/90/i.test(args[1])) {
            await socket.sendMessage(message.chat, { disappearingMessagesInChat: 7776000 });
          } else if (/7/i.test(args[1])) {
            await socket.sendMessage(message.chat, { disappearingMessagesInChat: 604800 });
          } else if (/1/i.test(args[1])) {
            await socket.sendMessage(message.chat, { disappearingMessagesInChat: 86400 });
          } else if (/0|off|false/i.test(args[1])) {
            await socket.sendMessage(message.chat, { disappearingMessagesInChat: 0 });
          } else message.reply('Silahkan Pilih :\n90 hari, 7 hari, 1 hari, off');
          break;
        case 'antilink':
        case 'antivirtex':
        case 'antidelete':
        case 'welcome':
        case 'antitoxic':
        case 'waktusholat':
        case 'nsfw':
        case 'antihidetag':
        case 'setinfo':
        case 'antitagsw':
        case 'leave':
        case 'promote':
        case 'demote':
          if (/on|true/i.test(args[1])) {
            if (set[args[0]]) return message.reply('*Sudah Aktif Sebelumnya*');
            set[args[0]] = true;
            message.reply('*Sukses Change To On*');
          } else if (/off|false/i.test(args[1])) {
            set[args[0]] = false;
            message.reply('*Sukses Change To Off*');
          } else message.reply(`❗${args[0].charAt(0).toUpperCase() + args[0].slice(1)} on/off`);
          break;
        case 'setwelcome':
        case 'setleave':
        case 'setpromote':
        case 'setdemote':
          if (args[1]) {
            set.text[args[0]] = args.slice(1).join(' ');
            message.reply(`Sukses Mengubah ${args[0].split('set')[1]} Menjadi:\n${set.text[args[0]]}`);
          } else message.reply(`Example:\n${message.prefix + message.command} ${args[0]} Isi Pesannya`);
          break;
        default:
          message.reply(`Settings Group ${message.metadata.subject}\n- open\n- close\n- join acc/reject\n- disappearing 90/7/1/off\n- antilink on/off ${set.antilink ? '🟢' : '🔴'}\n- antivirtex on/off ${set.antivirtex ? '🟢' : '🔴'}\n- antidelete on/off ${set.antidelete ? '🟢' : '🔴'}\n- welcome on/off ${set.welcome ? '🟢' : '🔴'}\n- leave on/off ${set.leave ? '🟢' : '🔴'}\n- promote on/off ${set.promote ? '🟢' : '🔴'}\n- demote on/off ${set.demote ? '🟢' : '🔴'}\n- setinfo on/off ${set.setinfo ? '🟢' : '🔴'}\n- nsfw on/off ${set.nsfw ? '🟢' : '🔴'}\n- waktusholat on/off ${set.waktusholat ? '🟢' : '🔴'}\n- antihidetag on/off ${set.antihidetag ? '🟢' : '🔴'}\n- antitoxic on/off ${set.antitoxic ? '🟢' : '🔴'}\n- antitagsw on/off ${set.antitagsw ? '🟢' : '🔴'}\n\n- setwelcome _textnya_\n- setleave _textnya_\n- setpromote _textnya_\n- setdemote _textnya_\n\nExample:\n${message.prefix + message.command} antilink off`);
      }
    },
  },
];
