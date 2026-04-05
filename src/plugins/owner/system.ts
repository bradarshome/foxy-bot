// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';
import fs from 'fs';

export const commands: PluginCommand[] = [
  {
    name: 'addcase',
    description: 'Add new case to naze.js',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, text }) => {
      if (!text || !text.startsWith('case')) return message.reply('Masukkan Casenya!');
      fs.readFile('naze.js', 'utf8', (err, data) => {
        if (err) {
          console.error('Terjadi kesalahan saat membaca file:', err);
          return;
        }
        const posisi = data.indexOf("case '19rujxl1e':");
        if (posisi !== -1) {
          const codeBaru = data.slice(0, posisi) + '\n' + text + '\n' + data.slice(posisi);
          fs.writeFile('naze.js', codeBaru, 'utf8', (err) => {
            if (err) message.reply('Terjadi kesalahan saat menulis file: ' + err);
            else message.reply('Selesai!');
          });
        } else message.reply('Gagal!');
      });
    },
  },
  {
    name: 'getcase',
    description: 'Get case code from naze.js',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, text }) => {
      if (!text) return message.reply('Masukkan Nama Casenya!');
      try {
        const getCase = (cases: string) => {
          return 'case' + `'${cases}'` + fs.readFileSync('naze.js').toString().split('case \'' + cases + '\'')[1].split('break')[0] + 'break';
        };
        message.reply(getCase(text));
      } catch {
        message.reply(`case ${text} tidak ditemukan!`);
      }
    },
  },
  {
    name: 'delcase',
    description: 'Delete case from naze.js',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, text }) => {
      if (!text) return message.reply('Masukkan Nama Casenya!');
      fs.readFile('naze.js', 'utf8', (err, data) => {
        if (err) {
          console.error('Terjadi kesalahan saat membaca file:', err);
          return;
        }
        const regex = new RegExp(`case\\s+'${text.toLowerCase()}':[\\s\\S]*?break`, 'g');
        const modifiedData = data.replace(regex, '');
        fs.writeFile('naze.js', modifiedData, 'utf8', (err) => {
          if (err) message.reply('Gagal!');
          else message.reply('Selesai!');
        });
      });
    },
  },
  {
    name: 'upsw',
    description: 'Upload to WhatsApp status',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ socket, message, text, db }) => {
      const statusJidList = Object.keys(db.users);
      const backgroundColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      try {
        if (message.quoted?.isMedia) {
          const media = await socket.downloadAndSaveMediaMessage(message.quoted.msg || message.quoted);
          try {
            if (/image|video/.test(message.quoted.mime || '')) {
              await socket.sendMessage('status@broadcast', {
                [`${(message.quoted.mime || '').split('/')[0]}`]: { url: media },
                caption: text || message.quoted?.body || '',
              }, { statusJidList, broadcast: true });
              message.react('✅');
            } else if (/audio/.test(message.quoted.mime || '')) {
              await socket.sendMessage('status@broadcast', {
                audio: { url: media },
                mimetype: 'audio/mp4',
                ptt: true,
              }, { backgroundColor, statusJidList, broadcast: true });
              message.react('✅');
            } else message.reply('Only Support video/audio/image/text');
          } finally {
            if (fs.existsSync(media)) fs.unlinkSync(media);
          }
        } else if (message.quoted?.text) {
          await socket.sendMessage('status@broadcast', { text: text || message.quoted?.body || '' }, {
            textArgb: 0xffffffff,
            font: Math.floor(Math.random() * 9),
            backgroundColor,
            statusJidList,
            broadcast: true,
          });
          message.react('✅');
        } else message.reply('Only Support video/audio/image/text');
      } catch {
        message.reply('Gagal!');
      }
    },
  },
  {
    name: 'byq',
    description: 'Get byte representation of quoted message',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message }) => {
      if (!message.quoted) return message.reply('Reply pesannya!');
      delete message.quoted.chat;
      const anya = Object.values(message.quoted.fakeObj())[1] as any;
      message.reply(`const byt = ${JSON.stringify(anya.message, null, 2)}\nnaze.relayMessage(m.chat, byt, {})`);
    },
  },
  {
    name: 'version',
    aliases: ["versi", "v"],
    description: 'Show bot version',
    category: 'Owner',
    handler: async ({ message }) => {
      const pkg = await import('../../../package.json', { assert: { type: 'json' } });
      message.reply(`Version : ${pkg.default.version}`);
    },
  },
];
