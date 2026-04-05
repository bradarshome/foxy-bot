// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';
import os from 'os';

export const commands: PluginCommand[] = [
  {
    name: 'owner',
    aliases: ['listowner'],
    description: 'Show owner contact',
    category: 'Bot',
    handler: async ({ socket, message, db }) => {
      const ownerNumber = db?.owner || [];
      await socket.sendContact(message.chat, ownerNumber, message);
    },
  },
  {
    name: 'profile',
    aliases: ['cek'],
    description: 'Show user profile',
    category: 'Bot',
    handler: async ({ message, db }) => {
      const user = Object.keys(db.users);
      const infoUser = db.users[message.sender];
      const isVip = infoUser?.vip;
      const isPremium = db.premium?.some((p: any) => p.id === message.sender);
      const { formatDate, checkStatus, getExpired } = await import('../../database/commands.js');
      await message.reply(`*👤Profile @${message.sender.split('@')[0]}* :\n🐋User Bot : ${user.includes(message.sender) ? 'True' : 'False'}\n🔥User : ${isVip ? 'VIP' : isPremium ? 'PREMIUM' : 'FREE'}${isPremium ? `\n⏳Expired : ${checkStatus(message.sender, db.premium) ? formatDate(getExpired(message.sender, db.premium)) : '-'}` : ''}\n🎫Limit : ${infoUser.limit}\n💰Uang : ${infoUser ? infoUser.money.toLocaleString('id-ID') : '0'}`);
    },
  },
  {
    name: 'leaderboard',
    description: 'Show top users by money',
    category: 'Bot',
    handler: async ({ message, db }) => {
      const entries = Object.entries(db.users).sort((a: any, b: any) => b[1].money - a[1].money).slice(0, 10).map((entry: any) => entry[0]);
      let teksnya = '╭──❍「 *LEADERBOARD* 」❍\n';
      for (let i = 0; i < entries.length; i++) {
        teksnya += `│• ${i + 1}. @${entries[i].split('@')[0]}\n│• Balance : ${db.users[entries[i]].money.toLocaleString('id-ID')}\n│\n`;
      }
      message.reply(teksnya + '╰──────❍');
    },
  },
  {
    name: 'req',
    aliases: ['request'],
    description: 'Send request to owner',
    category: 'Bot',
    handler: async ({ socket, message, text, db }) => {
      if (!text) return message.reply('Mau Request apa ke Owner?');
      await message.reply(`*Request Telah Terkirim Ke Owner*\n_Terima Kasih_`);
      const ownerNumber = db?.owner || [];
      await socket.sendFromOwner(ownerNumber, `Pesan Dari : @${message.sender.split('@')[0]}\nUntuk Owner\n\nRequest ${text}`, message, { contextInfo: { mentionedJid: [message.sender], isForwarded: true } });
    },
  },
  {
    name: 'daily',
    aliases: ['claim'],
    description: 'Daily reward',
    category: 'Bot',
    handler: async ({ message, db }) => {
      const { daily } = await import('../../../lib/game.js');
      daily(message, db);
    },
  },
  {
    name: 'transfer',
    aliases: ['tf'],
    description: 'Transfer money/limit',
    category: 'Bot',
    handler: async ({ message, args, db }) => {
      const { transfer } = await import('../../../lib/game.js');
      transfer(message, args, db);
    },
  },
  {
    name: 'buy',
    description: 'Buy limit with money',
    category: 'Bot',
    handler: async ({ message, args, db }) => {
      const { buy } = await import('../../../lib/game.js');
      buy(message, args, db);
    },
  },
  {
    name: 'react',
    description: 'React to a message',
    category: 'Bot',
    handler: async ({ socket, message, args }) => {
      await socket.sendMessage(message.chat, { react: { text: args[0], key: message.quoted ? message.quoted.key : message.key } });
    },
  },
  {
    name: 'tagme',
    description: 'Tag yourself',
    category: 'Bot',
    handler: async ({ message }) => {
      await message.reply(`@${message.sender.split('@')[0]}`, { mentions: [message.sender] });
    },
  },
  {
    name: 'runtime',
    aliases: ['tes', 'bot'],
    description: 'Show bot runtime',
    category: 'Bot',
    handler: async ({ message, args, db, socket }) => {
      const { runtime } = await import('../../../lib/function.js');
      if (!args[0] && !args[1]) return message.reply(`*Bot Telah Online Selama*\n*${runtime(process.uptime())}*`);
      const set = db.set?.[socket.decodeJid(socket.user!.id)] || {};
      const isCreator = db?.owner?.includes(message.sender.split('@')[0]);
      switch (args[0]) {
        case 'mode':
        case 'public':
        case 'self':
          if (!isCreator) return message.reply('Owner only!');
          if (args[1] == 'public' || args[1] == 'all') {
            socket.public = set.public = true;
            set.grouponly = true;
            set.privateonly = true;
            message.reply('*Sukses Change To Public Usage*');
          } else if (args[1] == 'self') {
            set.grouponly = false;
            set.privateonly = false;
            socket.public = set.public = false;
            message.reply('*Sukses Change To Self Usage*');
          } else if (args[1] == 'group') {
            set.grouponly = true;
            set.privateonly = false;
            message.reply('*Sukses Change To Group Only*');
          } else if (args[1] == 'private') {
            set.grouponly = false;
            set.privateonly = true;
            message.reply('*Sukses Change To Private Only*');
          } else message.reply('Mode self/public/group/private/all');
          break;
        case 'log':
        case 'anticall':
        case 'autobio':
        case 'autoread':
        case 'autotyping':
        case 'readsw':
        case 'multiprefix':
        case 'antispam':
        case 'didyoumean':
          if (!isCreator) return message.reply('Owner only!');
          if (args[1] == 'on') {
            if (set[args[0]]) return message.reply('*Sudah Aktif Sebelumnya*');
            set[args[0]] = true;
            message.reply('*Sukses Change To On*');
          } else if (args[1] == 'off') {
            set[args[0]] = false;
            message.reply('*Sukses Change To Off*');
          } else message.reply(`${args[0].charAt(0).toUpperCase() + args[0].slice(1)} on/off`);
          break;
        case 'set':
        case 'settings': {
          const settingsBot = Object.entries(set).map(([key, value]) => {
            const list = key == 'status' ? new Date(value as number).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : (typeof value === 'boolean') ? (value ? 'on🟢' : 'off🔴') : (Array.isArray(value)) ? `\n${value.map(a => '- ' + a).join('\n')}` : value;
            return `- ${key.charAt(0).toUpperCase() + key.slice(1)} : ${list}`;
          }).join('\n');
          message.reply(`Settings Bot @${socket.decodeJid(socket.user!.id).split('@')[0]}\n${settingsBot}\n\nExample: ${message.prefix + message.command} mode`);
          break;
        }
        case 'author':
          if (!isCreator) return message.reply('Owner only!');
          if (args[1] == 'prefix') {
            set.authorPrefix = '.';
            message.reply('Selesai!');
          } else {
            set.authorPrefix = '';
            message.reply('Selesai!');
          }
          break;
        default: {
          const menuList = `*⚙️ SETTINGS BOT ⚙️*\n\nSelect Bot Settings:\n\n*👥 Mode Penggunaan:*\n- Mode Bot : *${message.prefix + message.command} mode [public/self/group/private]*\n\n*🎛️ Fitur Otomatis (on/off):*\n- Anti Call : *${message.prefix + message.command} anticall [on/off]*\n- Anti Spam : *${message.prefix + message.command} antispam [on/off]*\n- Auto Bio : *${message.prefix + message.command} autobio [on/off]*\n- Auto Read : *${message.prefix + message.command} autoread [on/off]*\n- Auto Typing : *${message.prefix + message.command} autotyping [on/off]*\n- Read Status/SW : *${message.prefix + message.command} readsw [on/off]*\n\n*🛠️ System Settings:*\n- Multi Prefix : *${message.prefix + message.command} multiprefix [on/off]*\n- Did You Mean : *${message.prefix + message.command} didyoumean [on/off]*\n- Log Console : *${message.prefix + message.command} log [on/off]*\n- Author Prefix : *${message.prefix + message.command} author [prefix/off]*\n\n*📊 Info & Status:*\n- Cek Semua Setting : *${message.prefix + message.command} set*\n- Cek Runtime Bot : *${message.prefix + message.command}*`;
          if (args[0] || args[1]) message.reply(menuList);
        }
      }
    },
  },
  {
    name: 'ping',
    aliases: ['botstatus', 'statusbot'],
    description: 'Show bot status/ping',
    category: 'Bot',
    handler: async ({ message }) => {
      const { runtime, formatp } = await import('../../../lib/function.js');
      const speed = (await import('performance-now')).default;
      const used = process.memoryUsage();
      const cpus = os.cpus().map(cpu => {
        cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0);
        return cpu;
      });
      const cpu = cpus.reduce((last, cpu, _, { length }) => {
        last.total += cpu.total;
        last.speed += cpu.speed / length;
        last.times.user += cpu.times.user;
        last.times.nice += cpu.times.nice;
        last.times.sys += cpu.times.sys;
        last.times.idle += cpu.times.idle;
        last.times.irq += cpu.times.irq;
        return last;
      }, { speed: 0, total: 0, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } });
      let timestamp = speed();
      let latensi = speed() - timestamp;
      const respon = `Kecepatan Respon ${latensi.toFixed(4)} _Second_\n\nRuntime : ${runtime(process.uptime())}\n\n💻 Info Server\nRAM: ${formatp(os.totalmem() - os.freemem())} / ${formatp(os.totalmem())}\n\n_NodeJS Memory Usage_\n${Object.keys(used).map((key, _, arr) => `${key.padEnd(Math.max(...arr.map(v => v.length)), ' ')}: ${formatp(used[key])}`).join('\n')}\n\n${cpus[0] ? `_Total CPU Usage_\n${cpus[0].model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(type => `- *${(type + '*').padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}` : ''}`.trim();
      message.reply(respon);
    },
  },
  {
    name: 'speedtest',
    aliases: ['speed'],
    description: 'Test internet speed',
    category: 'Bot',
    handler: async ({ message }) => {
      message.reply('Testing Speed...');
      const cp = require('child_process');
      const { promisify } = require('util');
      const exec = promisify(cp.exec).bind(cp);
      let o;
      try {
        o = await exec('python3 speed.py --share');
      } catch (e) {
        o = e;
      } finally {
        const { stdout, stderr } = o as any;
        if (stdout.trim()) message.reply(stdout);
        if (stderr.trim()) message.reply(stderr);
      }
    },
  },
  {
    name: 'afk',
    description: 'Set AFK status',
    category: 'Bot',
    handler: async ({ message, text, db }) => {
      const user = db.users[message.sender];
      user.afkTime = +new Date;
      user.afkReason = text;
      message.reply(`@${message.sender.split('@')[0]} Telah Afk${text ? ': ' + text : ''}`);
    },
  },
  {
    name: 'readviewonce',
    aliases: ['readviewone', 'rvo'],
    description: 'Read view once message',
    category: 'Bot',
    handler: async ({ socket, message }) => {
      if (!message.quoted) return message.reply('Reply pesannya!');
      try {
        if (message.quoted.msg?.viewOnce) {
          delete message.quoted.chat;
          message.quoted.msg.viewOnce = false;
          await message.reply({ forward: message.quoted });
        } else message.reply(`Reply view once message\nExample: ${message.prefix + message.command}`);
      } catch {
        message.reply('Media Tidak Valid!');
      }
    },
  },
  {
    name: 'inspect',
    description: 'Inspect group/channel link',
    category: 'Bot',
    handler: async ({ socket, message, text }) => {
      if (!text) return message.reply('Masukkan Link Grup atau Saluran!');
      const _grup = /chat.whatsapp.com\/([\w\d]*)/;
      const _saluran = /whatsapp\.com\/channel\/([\w\d]*)/;
      if (_grup.test(text)) {
        await socket.groupGetInviteInfo(text.match(_grup)![1]).then((_g: any) => {
          let teks = `*[ INFORMATION GROUP ]*\n\nName Group: ${_g.subject}\nGroup ID: ${_g.id}\nCreate At: ${new Date(_g.creation * 1000).toLocaleString()}${_g.owner ? ('\nCreate By: ' + _g.owner) : ''}\nLinked Parent: ${_g.linkedParent}\nRestrict: ${_g.restrict}\nAnnounce: ${_g.announce}\nIs Community: ${_g.isCommunity}\nCommunity Announce:${_g.isCommunityAnnounce}\nJoin Approval: ${_g.joinApprovalMode}\nMember Add Mode: ${_g.memberAddMode}\nDescription ID: \`${_g.descId}\`\nDescription: ${_g.desc}\nParticipants:\n`;
          _g.participants.forEach((a: any) => {
            teks += a.admin ? `- Admin: @${a.id.split('@')[0]} [${a.admin}]\n` : '';
          });
          message.reply(teks);
        }).catch((e: any) => {
          if ([400, 406].includes(e.data)) return message.reply('Grup Tidak Ditemukan!');
          if (e.data == 401) return message.reply('Bot Di Kick Dari Grup Tersebut!');
          if (e.data == 410) return message.reply('Url Grup Telah Di Setel Ulang!');
        });
      } else if (_saluran.test(text) || text.endsWith('@newsletter') || !isNaN(Number(text))) {
        await socket.newsletterMsg(text.match(_saluran)?.[1] || text).then((n: any) => {
          message.reply(`*[ INFORMATION CHANNEL ]*\n\nID: ${n.id}\nState: ${n.state.type}\nName: ${n.thread_metadata.name.text}\nCreate At: ${new Date(n.thread_metadata.creation_time * 1000).toLocaleString()}\nSubscriber: ${n.thread_metadata.subscribers_count}\nVerification: ${n.thread_metadata.verification}\nDescription: ${n.thread_metadata.description.text}\n`);
        }).catch(() => message.reply('Saluran Tidak Ditemukan!'));
      } else message.reply('Hanya Support Url Grup atau Saluran!');
    },
  },
  {
    name: 'addmsg',
    description: 'Save message to database',
    category: 'Bot',
    handler: async ({ message, text, db }) => {
      if (!message.quoted) return message.reply('Reply Pesan Yang Ingin Disave Di Database');
      if (!text) return message.reply(`Example : ${message.prefix + message.command} file name`);
      const msgs = db.database;
      if (text.toLowerCase() in msgs) return message.reply(`'${text}' telah terdaftar di list pesan`);
      msgs[text.toLowerCase()] = message.quoted;
      delete msgs[text.toLowerCase()].chat;
      message.reply(`Berhasil menambahkan pesan di list pesan sebagai '${text}'\nAkses dengan ${message.prefix}getmsg ${text}\nLihat list Pesan Dengan ${message.prefix}listmsg`);
    },
  },
  {
    name: 'delmsg',
    aliases: ['deletemsg'],
    description: 'Delete saved message',
    category: 'Bot',
    handler: async ({ message, text, db }) => {
      if (!text) return message.reply('Nama msg yg mau di delete?');
      const msgs = db.database;
      if (text == 'allmsg') {
        db.database = {};
        message.reply('Berhasil menghapus seluruh msg dari list pesan');
      } else {
        if (!(text.toLowerCase() in msgs)) return message.reply(`'${text}' tidak terdaftar didalam list pesan`);
        delete msgs[text.toLowerCase()];
        message.reply(`Berhasil menghapus '${text}' dari list pesan`);
      }
    },
  },
  {
    name: 'getmsg',
    description: 'Get saved message',
    category: 'Bot',
    handler: async ({ socket, message, text, db }) => {
      if (!text) return message.reply(`Example : ${message.prefix + message.command} file name\n\nLihat list pesan dengan ${message.prefix}listmsg`);
      const msgs = db.database;
      if (!(text.toLowerCase() in msgs)) return message.reply(`'${text}' tidak terdaftar di list pesan`);
      await socket.relayMessage(message.chat, msgs[text.toLowerCase()], {});
    },
  },
  {
    name: 'listmsg',
    description: 'List saved messages',
    category: 'Bot',
    handler: async ({ message, db }) => {
      const { getContentType } = await import('baileys');
      const listv = db?.listv || ['•'];
      const setv = listv[Math.floor(Math.random() * listv.length)];
      const seplit = Object.entries(db.database).map(([nama, isi]: any) => ({ nama, message: getContentType(isi) }));
      let teks = '「 LIST DATABASE 」\n\n';
      for (const i of seplit) {
        teks += `${setv} *Name :* ${i.nama}\n${setv} *Type :* ${i.message?.replace(/Message/i, '')}\n───────────────\n`;
      }
      message.reply(teks);
    },
  },
  {
    name: 'setcmd',
    aliases: ['addcmd'],
    description: 'Set command to sticker',
    category: 'Bot',
    handler: async ({ message, text, db }) => {
      if (!message.quoted) return message.reply('Reply pesannya!');
      if (!message.quoted.fileSha256) return message.reply('SHA256 Hash Missing!');
      if (!text) return message.reply(`Example : ${message.prefix + message.command} CMD Name`);
      const hash = message.quoted.fileSha256.toString('base64');
      if (db.cmd[hash] && db.cmd[hash].locked) return message.reply('You have no permission to change this sticker command');
      db.cmd[hash] = { creator: message.sender, locked: false, at: +new Date, text };
      message.reply('Selesai!');
    },
  },
  {
    name: 'delcmd',
    description: 'Delete sticker command',
    category: 'Bot',
    handler: async ({ message, db }) => {
      if (!message.quoted) return message.reply('Reply pesannya!');
      if (!message.quoted.fileSha256) return message.reply('SHA256 Hash Missing!');
      const hash = message.quoted.fileSha256.toString('base64');
      if (db.cmd[hash] && db.cmd[hash].locked) return message.reply('You have no permission to change this sticker command');
      delete db.cmd[hash];
      message.reply('Selesai!');
    },
  },
  {
    name: 'listcmd',
    description: 'List sticker commands',
    category: 'Bot',
    handler: async ({ socket, message, db }) => {
      const teks = `*List Hash*\nInfo: *bold* hash is Locked\n${Object.entries(db.cmd).map(([key, value]: any, index) => `${index + 1}. ${value.locked ? `*${key}*` : key} : ${value.text}`).join('\n')}`.trim();
      await socket.sendText(message.chat, teks, message);
    },
  },
  {
    name: 'lockcmd',
    aliases: ['unlockcmd'],
    description: 'Lock/unlock sticker command',
    category: 'Bot',
    ownerOnly: true,
    handler: async ({ message, db }) => {
      if (!message.quoted) return message.reply('Reply pesannya!');
      if (!message.quoted.fileSha256) return message.reply('SHA256 Hash Missing!');
      const hash = message.quoted.fileSha256.toString('base64');
      if (!(hash in db.cmd)) return message.reply('You have no permission to change this sticker command');
      db.cmd[hash].locked = !/^un/i.test(message.command);
    },
  },
  {
    name: 'q',
    aliases: ['quoted'],
    description: 'Get quoted message',
    category: 'Bot',
    handler: async ({ socket, message, text }) => {
      if (!message.quoted) return message.reply('Reply pesannya!');
      if (text) {
        delete message.quoted.chat;
        await message.reply({ forward: message.quoted });
      } else {
        try {
          const anu = await message.getQuotedObj();
          if (!anu) return message.reply('Format Tidak Tersedia!');
          if (!anu.quoted) return message.reply('Pesan Yang Anda Reply Tidak Mengandung Reply');
          await socket.relayMessage(message.chat, { [anu.quoted.type]: anu.quoted.msg }, {});
        } catch {
          return message.reply('Format Tidak Tersedia!');
        }
      }
    },
  },
  {
    name: 'confes',
    aliases: ['confess', 'menfes', 'menfess'],
    description: 'Anonymous chat',
    category: 'Bot',
    privateOnly: true,
    limit: 1,
    handler: async ({ socket, message, text, db }) => {
      const menfes = db.game.menfes;
      if (menfes[message.sender]) return message.reply(`Kamu Sedang Berada Di Sesi ${message.command}!`);
      if (!text) return message.reply(`Example : ${message.prefix + message.command} 62xxxx|Nama Samaran`);
      const [teks1, teks2] = text.split('|');
      if (teks1) {
        const tujuan = teks1.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        const onWa = await socket.onWhatsApp(tujuan);
        if (!onWa.length > 0) return message.reply('Nomor tersebut tidak terdaftar di WhatsApp!');
        menfes[message.sender] = { tujuan, nama: teks2 || 'Orang' };
        menfes[tujuan] = { tujuan: message.sender, nama: 'Penerima' };
        const timeout = setTimeout(() => {
          if (menfes[message.sender]) {
            message.reply(`_Waktu ${message.command} habis_`);
            delete menfes[message.sender];
          }
          if (menfes[tujuan]) {
            socket.sendMessage(tujuan, { text: `_Waktu ${message.command} habis_` });
            delete menfes[tujuan];
          }
        }, 600000);
        socket.sendMessage(tujuan, { text: `_${message.command} connected_\n*Note :* jika ingin mengakhiri ketik _*${message.prefix}del${message.command}*_` });
        message.reply(`_Memulai ${message.command}..._\n*Silahkan Mulai kirim pesan/media*\n*Durasi ${message.command} hanya selama 10 menit*`);
        const { setLimit } = await import('../../../lib/game.js');
        setLimit(message, db);
      } else message.reply(`Masukkan Nomernya!\nExample : ${message.prefix + message.command} 62xxxx|Nama Samaran`);
    },
  },
  {
    name: 'delconfes',
    aliases: ['delconfess', 'delmenfes', 'delmenfess'],
    description: 'End anonymous chat',
    category: 'Bot',
    privateOnly: true,
    handler: async ({ socket, message, db }) => {
      const menfes = db.game.menfes;
      if (!menfes[message.sender]) return message.reply(`Kamu Tidak Sedang Berada Di Sesi ${message.command.split('del')[1]}!`);
      const anu = menfes[message.sender];
      await socket.sendMessage(anu.tujuan, { text: `Chat Di Akhiri Oleh ${anu.nama ? anu.nama : 'Seseorang'}` });
      message.reply(`Sukses Mengakhiri Sesi ${message.command.split('del')[1]}!`);
      delete menfes[anu.tujuan];
      delete menfes[message.sender];
    },
  },
  {
    name: 'cai',
    aliases: ['roomai', 'chatai', 'autoai'],
    description: 'AI chat room',
    category: 'Bot',
    privateOnly: true,
    handler: async ({ socket, message, text, db }) => {
      const chat_ai = db.game.chat_ai;
      if (chat_ai[message.sender]) return message.reply(`Kamu Sedang Berada Di Sesi ${message.command}!`);
      if (!text) return message.reply(`Example: ${message.prefix + message.command} halo|Kamu adalah assisten`);
      const [teks1, teks2] = text.split('|');
      chat_ai[message.sender] = [{ role: 'system', content: teks2 || '' }, { role: 'user', content: teks1 || text }];
      const hasil = await (global as any).fetchApi('/ai/chat4', { messages: chat_ai[message.sender], prompt: text }, { method: 'POST' });
      const response = hasil?.result?.message || 'Maaf, saya tidak mengerti.';
      chat_ai[message.sender].push({ role: 'assistant', content: response });
      await message.reply(response);
    },
  },
  {
    name: 'delcai',
    aliases: ['delroomai', 'delchatai', 'delautoai'],
    description: 'Delete AI chat room',
    category: 'Bot',
    privateOnly: true,
    handler: async ({ message, db }) => {
      const chat_ai = db.game.chat_ai;
      if (!chat_ai[message.sender]) return message.reply(`Kamu Tidak Sedang Berada Di Sesi ${message.command.split('del')[1]}!`);
      message.reply(`Sukses Mengakhiri Sesi ${message.command.split('del')[1]}!`);
      delete chat_ai[message.sender];
    },
  },
  {
    name: 'jadibot',
    description: 'Become a bot (clone session)',
    category: 'Bot',
    premiumOnly: true,
    limit: 1,
    handler: async ({ socket, message, text, db, store }) => {
      const { JadiBot } = await import('../../src/jadibot.js');
      const nmrnya = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : message.sender;
      const onWa = await socket.onWhatsApp(nmrnya);
      if (!onWa.length > 0) return message.reply('Nomor tersebut tidak terdaftar di WhatsApp!');
      await JadiBot(socket, nmrnya, message, store);
      message.reply(`Gunakan ${message.prefix}stopjadibot\nUntuk Berhenti`);
      const { setLimit } = await import('../../../lib/game.js');
      setLimit(message, db);
    },
  },
  {
    name: 'stopjadibot',
    aliases: ['deljadibot'],
    description: 'Stop being a bot',
    category: 'Bot',
    handler: async ({ socket, message, text }) => {
      const { StopJadiBot } = await import('../../src/jadibot.js');
      const nmrnya = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : message.sender;
      const onWa = await socket.onWhatsApp(nmrnya);
      if (!onWa.length > 0) return message.reply('Nomor tersebut tidak terdaftar di WhatsApp!');
      await StopJadiBot(socket, nmrnya, message);
    },
  },
  {
    name: 'listjadibot',
    description: 'List active clone bots',
    category: 'Bot',
    handler: async ({ socket, message }) => {
      const { ListJadiBot } = await import('../../src/jadibot.js');
      ListJadiBot(socket, message);
    },
  },
];
