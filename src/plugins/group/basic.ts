// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';

export const commands: PluginCommand[] = [
  {
    name: 'add',
    description: 'Add member to group',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    handler: async ({ socket, message, text, store }) => {
      if (text || message.quoted) {
        const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : message.quoted?.sender;
        const findJid = socket.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
        const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' : '@s.whatsapp.net');
        const nmrnya = socket.findJidByLid(klss, store, true);
        try {
          const res = await socket.groupParticipantsUpdate(message.chat, [nmrnya], 'add');
          for (const i of res) {
            const statusMessages: Record<number, string> = {
              200: `Berhasil menambahkan @${nmrnya.split('@')[0]} ke grup!`,
              401: 'Dia Memblokir Bot!',
              409: 'Dia Sudah Join!',
              500: 'Grup Penuh!',
            };
            if (statusMessages[i.status]) return message.reply(statusMessages[i.status]);
            if (i.status == 408) {
              const invv = await socket.groupInviteCode(message.chat);
              await message.reply(`@${nmrnya.split('@')[0]} Baru-Baru Saja Keluar Dari Grub Ini!\n\nKarena Target Private\n\nUndangan Akan Dikirimkan Ke\n-> wa.me/${nmrnya.replace(/\D/g, '')}\nMelalui Jalur Pribadi`);
              await socket.sendMessage(nmrnya, { text: `https://chat.whatsapp.com/${invv}\n------------------------------------------------------\n\nAdmin: @${message.sender.split('@')[0]}\nMengundang anda ke group ini\nSilahkan masuk jika berkehendak`, detectLink: true }).catch(() => {});
            } else if (i.status == 403) {
              const a = (i as any).content?.content?.[0]?.attrs;
              await socket.sendGroupInviteV4(message.chat, nmrnya, a.code, a.expiration, message.metadata.subject, `Admin: @${message.sender.split('@')[0]}\nMengundang anda ke group ini\nSilahkan masuk jika berkehendak`, null, { mentions: [message.sender] });
              await message.reply(`@${nmrnya.split('@')[0]} Tidak Dapat Ditambahkan\n\nKarena Target Private`);
            } else message.reply('Gagal Add User\nStatus : ' + i.status);
          }
        } catch {
          message.reply('Gagal!');
        }
      } else message.reply(`Example: ${message.prefix + message.command} 62xxx`);
    },
  },
  {
    name: 'kick',
    aliases: ["dor"],
    description: 'Kick member from group',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    handler: async ({ socket, message, text, store }) => {
      if (text || message.quoted) {
        const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : message.quoted?.sender;
        const findJid = socket.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
        const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' : '@s.whatsapp.net');
        const nmrnya = socket.findJidByLid(klss, store, true);
        await socket.groupParticipantsUpdate(message.chat, [nmrnya], 'remove').catch(() => message.reply('Gagal!'));
      } else message.reply(`Example: ${message.prefix + message.command} 62xxx`);
    },
  },
  {
    name: 'promote',
    description: 'Promote member to admin',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    handler: async ({ socket, message, text, store }) => {
      if (text || message.quoted) {
        const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : message.quoted?.sender;
        const findJid = socket.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
        const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' : '@s.whatsapp.net');
        const nmrnya = socket.findJidByLid(klss, store, true);
        await socket.groupParticipantsUpdate(message.chat, [nmrnya], 'promote').catch(() => message.reply('Gagal!'));
      } else message.reply(`Example: ${message.prefix + message.command} 62xxx`);
    },
  },
  {
    name: 'demote',
    description: 'Demote admin to member',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    handler: async ({ socket, message, text, store }) => {
      if (text || message.quoted) {
        const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : message.quoted?.sender;
        const findJid = socket.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
        const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' : '@s.whatsapp.net');
        const nmrnya = socket.findJidByLid(klss, store, true);
        await socket.groupParticipantsUpdate(message.chat, [nmrnya], 'demote').catch(() => message.reply('Gagal!'));
      } else message.reply(`Example: ${message.prefix + message.command} 62xxx`);
    },
  },
  {
    name: 'warn',
    aliases: ["warning"],
    description: 'Warn a member',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    handler: async ({ socket, message, text, db, store }) => {
      if (text || message.quoted) {
        const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : message.quoted?.sender;
        const findJid = socket.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
        const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' : '@s.whatsapp.net');
        const nmrnya = socket.findJidByLid(klss, store, true);
        if (!db.groups[message.chat].warn[nmrnya]) {
          db.groups[message.chat].warn[nmrnya] = 1;
          message.reply('Warning 1/4, akan dikick sewaktu waktu!');
        } else if (db.groups[message.chat].warn[nmrnya] >= 3) {
          await socket.groupParticipantsUpdate(message.chat, [nmrnya], 'remove').catch(() => message.reply('Gagal!'));
          delete db.groups[message.chat].warn[nmrnya];
        } else {
          db.groups[message.chat].warn[nmrnya] += 1;
          message.reply(`Warning ${db.groups[message.chat].warn[nmrnya]}/4, akan dikick sewaktu waktu!`);
        }
      } else message.reply(`Example: ${message.prefix + message.command} 62xxx`);
    },
  },
  {
    name: 'unwarn',
    aliases: ["delwarn", "unwarning", "delwarning"],
    description: 'Remove warning from member',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    handler: async ({ socket, message, text, db, store }) => {
      if (text || message.quoted) {
        const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : message.quoted?.sender;
        const findJid = socket.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
        const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' : '@s.whatsapp.net');
        const nmrnya = socket.findJidByLid(klss, store, true);
        if (db.groups[message.chat]?.warn?.[nmrnya]) {
          delete db.groups[message.chat].warn[nmrnya];
          message.reply('Berhasil Menghapus Warning!');
        }
      } else message.reply(`Example: ${message.prefix + message.command} 62xxx`);
    },
  },
  {
    name: 'setname',
    aliases: ["setnamegc", "setsubject", "setsubjectgc"],
    description: 'Set group name',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    handler: async ({ socket, message, text }) => {
      if (text || message.quoted) {
        const teksnya = text ? text : message.quoted.text;
        await socket.groupUpdateSubject(message.chat, teksnya).catch(() => message.reply('Gagal!'));
      } else message.reply(`Example: ${message.prefix + message.command} textnya`);
    },
  },
  {
    name: 'setdesc',
    aliases: ["setdescgc", "setdesk", "setdeskgc"],
    description: 'Set group description',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    handler: async ({ socket, message, text }) => {
      if (text || message.quoted) {
        const teksnya = text ? text : message.quoted.text;
        await socket.groupUpdateDescription(message.chat, teksnya).catch(() => message.reply('Gagal!'));
      } else message.reply(`Example: ${message.prefix + message.command} textnya`);
    },
  },
  {
    name: 'setppgroups',
    aliases: ["setppgrup", "setppgc"],
    description: 'Set group profile picture',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    handler: async ({ socket, message }) => {
      if (!message.quoted) return message.reply('Reply Gambar yang mau dipasang di Profile Grup');
      if (!/image/.test(message.quoted.type || '')) return message.reply(`Reply Image Dengan Caption ${message.prefix + message.command}`);
      const media = await message.quoted.download();
      const { generateProfilePicture } = await import('../../../lib/function.cjs');
      const { img } = await generateProfilePicture(media);
      await socket.query({
        tag: 'iq',
        attrs: { target: message.chat, to: '@s.whatsapp.net', type: 'set', xmlns: 'w:profile:picture' },
        content: [{ tag: 'picture', attrs: { type: 'image' }, content: img }],
      });
      message.reply('Selesai!');
    },
  },
  {
    name: 'delete',
    aliases: ["del", "d"],
    description: 'Delete a message',
    category: 'Group',
    handler: async ({ socket, message }) => {
      if (!message.quoted) return message.reply('Reply pesannya!');
      await socket.sendMessage(message.chat, { delete: { remoteJid: message.chat, fromMe: message.isBotAdmin ? false : true, id: message.quoted.id, participant: message.quoted.sender } });
    },
  },
  {
    name: 'pin',
    aliases: ["unpin"],
    description: 'Pin or unpin a message',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    handler: async ({ socket, message }) => {
      await socket.sendMessage(message.chat, { pin: { type: message.command == 'pin' ? 1 : 0, time: 2592000, key: message.quoted ? message.quoted.key : message.key } });
    },
  },
  {
    name: 'linkgroup',
    aliases: ["linkgrup", "linkgc"],
    description: 'Get group invite link',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    handler: async ({ socket, message, store }) => {
      const response = await socket.groupInviteCode(message.chat);
      const metadata = store.groupMetadata[message.chat] || (store.groupMetadata[message.chat] = await socket.groupMetadata(message.chat));
      await message.reply(`https://chat.whatsapp.com/${response}\n\nLink Group : ${metadata.subject}`, { detectLink: true });
    },
  },
  {
    name: 'revoke',
    aliases: ["newlink", "newurl"],
    description: 'Revoke group invite link',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    handler: async ({ socket, message }) => {
      await socket.groupRevokeInvite(message.chat).then(() => {
        message.reply(`Sukses Menyetel Ulang, Tautan Undangan Grup ${message.metadata.subject}`);
      }).catch(() => message.reply('Gagal!'));
    },
  },
  {
    name: 'tagall',
    description: 'Tag all members',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    handler: async ({ message, db }) => {
      const listv = db?.listv || ['•'];
      const setv = listv[Math.floor(Math.random() * listv.length)];
      const q = message.text;
      let teks = `*Tag All*\n\n*Pesan :* ${q ? q : ''}\n\n`;
      for (const mem of message.metadata.participants) {
        teks += `${setv} @${mem.id.split('@')[0]}\n`;
      }
      await message.reply(teks, { mentions: message.metadata.participants.map(a => a.id) });
    },
  },
  {
    name: 'hidetag',
    aliases: ["h"],
    description: 'Send hidden tag message',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    handler: async ({ message }) => {
      const q = message.text;
      await message.reply(q ? q : '', { mentions: message.metadata.participants.map(a => a.id) });
    },
  },
  {
    name: 'totag',
    description: 'Convert replied message to tagged message',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    handler: async ({ socket, message }) => {
      if (!message.quoted) return message.reply('Reply pesannya!');
      delete message.quoted.chat;
      await socket.sendMessage(message.chat, { forward: message.quoted.fakeObj(), mentions: message.metadata.participants.map(a => a.id) });
    },
  },
  {
    name: 'listonline',
    aliases: ["liston"],
    description: 'List online members',
    category: 'Group',
    groupOnly: true,
    botAdminOnly: true,
    handler: async ({ socket, message, args, store, db }) => {
      const id = args && /\d+\-\d+@g.us/.test(args[0]) ? args[0] : message.chat;
      if (!store.presences || !store.presences[id]) return message.reply('Sedang Tidak ada yang online!');
      const groupPresences = store.presences[id];
      const metadata = store.groupMetadata[id];
      const listv = db?.listv || ['•'];
      const setv = listv[Math.floor(Math.random() * listv.length)];
      const botNumber = socket.decodeJid(socket.user!.id);
      let list_online: string[] = [];
      if (metadata && metadata.participants) {
        for (const p of metadata.participants) {
          if (groupPresences[p.id]) {
            list_online.push(p.phoneNumber);
          }
        }
      }
      if (!list_online.includes(botNumber)) list_online.push(botNumber);
      if (list_online.length === 0) return message.reply('Sedang tidak ada yang online!');
      const textReply = '*List Online:*\n\n' + list_online.map(v => setv + ' @' + v.split('@')[0]).join('\n');
      await message.reply(textReply, { mentions: list_online }).catch(() => message.reply('Gagal menampilkan list online..'));
    },
  },
  {
    name: 'totalpesan',
    aliases: ["totalchat"],
    description: 'Show total messages per member',
    category: 'Group',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    handler: async ({ message, text, store, db }) => {
      const messageCount: Record<string, number> = {};
      const messages = store?.messages[message.chat]?.array || [];
      const participants = (message?.metadata?.participants?.map((p: any) => p.phoneNumber) || store?.messages[message.chat]?.array?.map((p: any) => p.key.participantAlt) || []).filter((p: any) => p);
      messages.forEach((mes: any) => {
        if (mes.key?.participantAlt && mes.message) {
          messageCount[mes.key.participantAlt] = (messageCount[mes.key.participantAlt] || 0) + 1;
        }
      });
      const totalMessages = Object.values(messageCount).reduce((a, b) => a + b, 0);
      const date = new Date().toLocaleDateString('id-ID');
      const zeroMessageUsers = participants.filter((user: string) => !messageCount[user]).map((user: string) => `- @${user.replace(/[^0-9]/g, '')}`);
      const messageList = Object.entries(messageCount).map(([sender, count], index) => `${index + 1}. @${sender.replace(/[^0-9]/g, '')}: ${count} Pesan`);
      const result = `Total Pesan ${totalMessages} dari ${participants.length} anggota\nPada tanggal ${date}:\n${messageList.join('\n')}\n\nNote: ${text.length > 0 ? `\n${zeroMessageUsers.length > 0 ? `Sisa Anggota yang tidak mengirim pesan (Sider):\n${zeroMessageUsers.join('\n')}` : 'Semua anggota sudah mengirim pesan!'}` : `\nCek Sider? ${message.prefix + message.command} --sider`}`;
      message.reply(result);
    },
  },
];
