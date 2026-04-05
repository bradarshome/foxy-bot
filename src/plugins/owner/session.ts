// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';
import fs from 'fs';
import path from 'path';

export const commands: PluginCommand[] = [
  {
    name: 'backup',
    description: 'Backup bot data',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, args, db }) => {
      const { tarBackup } = await import('../../../lib/function.cjs');
      const tempatDB = db?.tempatDB || 'database.json';
      switch (args[0]) {
        case 'all': {
          const bekup = './database/backup_all.tar.gz';
          await tarBackup('./', bekup).then(async () => {
            await message.reply({
              document: fs.readFileSync(bekup),
              mimetype: 'application/gzip',
              fileName: 'backup_all.tar.gz',
            });
          }).catch((e: any) => message.reply('Gagal backup: ' + e));
          break;
        }
        case 'auto':
          const botNumber = message.chat;
          const set = db.set?.[botNumber] || {};
          if (set.autobackup) return message.reply('Sudah Aktif Sebelumnya!');
          set.autobackup = true;
          message.reply('Sukses Mengaktifkan Auto Backup');
          break;
        case 'session':
          await message.reply({
            document: fs.readFileSync('./foxy-session/creds.json'),
            mimetype: 'application/json',
            fileName: 'creds.json',
          });
          break;
        case 'database': {
          const tglnya = new Date().toISOString().replace(/[:.]/g, '-');
          let datanya = './database/' + tempatDB;
          if (tempatDB.startsWith('mongodb')) {
            datanya = './database/backup_database.json';
            fs.writeFileSync(datanya, JSON.stringify(db, null, 2), 'utf-8');
          }
          await message.reply({
            document: fs.readFileSync(datanya),
            mimetype: 'application/json',
            fileName: tglnya + '_database.json',
          });
          break;
        }
        default:
          message.reply('Gunakan perintah:\n- backup all\n- backup auto\n- backup session\n- backup database');
      }
    },
  },
  {
    name: 'getsession',
    description: 'Get session file',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message }) => {
      await message.reply({
        document: fs.readFileSync('./foxy-session/creds.json'),
        mimetype: 'application/json',
        fileName: 'creds.json',
      });
    },
  },
  {
    name: 'deletesession',
    aliases: ["delsession"],
    description: 'Delete session files',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, text }) => {
      const { sleep } = await import('../../../lib/function.cjs');
      fs.readdir('./foxy-session', async function (err, files) {
        if (err) {
          console.error('Unable to scan directory: ' + err);
          return message.reply('Unable to scan directory: ' + err);
        }
        const filteredArray = files.filter(item => ['session-', 'pre-key', 'sender-key', 'app-state'].some(ext => item.startsWith(ext)));
        let teks = `Terdeteksi ${filteredArray.length} Session file\n\n`;
        if (filteredArray.length == 0) return message.reply(teks);
        filteredArray.map(function (e, i) {
          teks += (i + 1) + `. ${e}\n`;
        });
        if (text && text == 'true') {
          const { key } = await message.reply('Menghapus Session File..');
          filteredArray.forEach(function (file) {
            fs.unlinkSync('./foxy-session/' + file);
          });
          await sleep(2000);
          message.reply('Berhasil Menghapus Semua Sampah Session', { edit: key });
        } else message.reply(teks + `\nKetik _${message.prefix + message.command} true_\nUntuk Menghapus`);
      });
    },
  },
  {
    name: 'deletesampah',
    aliases: ["delsampah", "deletetemp", "deltemp"],
    description: 'Delete temporary files',
    category: 'Owner',
    ownerOnly: true,
    handler: async ({ message, text }) => {
      const { sleep } = await import('../../../lib/function.cjs');
      fs.readdir('./database/temp', async function (err, files) {
        if (err) {
          console.error('Unable to scan directory: ' + err);
          return message.reply('Unable to scan directory: ' + err);
        }
        const filteredArray = files.filter(item => ['gif', 'png', 'bin', 'mp3', 'mp4', 'jpg', 'webp', 'webm', 'opus', 'jpeg'].some(ext => item.endsWith(ext)));
        let teks = `Terdeteksi ${filteredArray.length} Sampah file\n\n`;
        if (filteredArray.length == 0) return message.reply(teks);
        filteredArray.map(function (e, i) {
          teks += (i + 1) + `. ${e}\n`;
        });
        if (text && text == 'true') {
          const { key } = await message.reply('Menghapus Sampah File..');
          filteredArray.forEach(function (file) {
            fs.unlinkSync('./database/temp/' + file);
          });
          await sleep(2000);
          message.reply('Berhasil Menghapus Semua Sampah', { edit: key });
        } else message.reply(teks + `\nKetik _${message.prefix + message.command} true_\nUntuk Menghapus`);
      });
    },
  },
];
