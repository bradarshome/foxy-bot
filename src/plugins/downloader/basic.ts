// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';
import fs from 'fs';

export const commands: PluginCommand[] = [
  {
    name: 'ytmp3',
    aliases: ['ytaudio', 'ytplayaudio'],
    description: 'Download YouTube audio',
    category: 'Downloader',
    limit: 1,
    handler: async ({ message, text, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} url_youtube`);
      if (!text.includes('youtu')) return message.reply('Url Tidak Mengandung Result Dari Youtube!');
      message.react('⏳');
      try {
        const { ytMp3 } = await import('../../../lib/scraper.js');
        const hasil = await ytMp3(text);
        await message.reply({
          audio: { url: hasil.result },
          mimetype: 'audio/mpeg',
          contextInfo: {
            externalAdReply: {
              title: hasil.title,
              body: hasil.channel,
              previewType: 'PHOTO',
              thumbnailUrl: hasil.thumb,
              mediaType: 1,
              renderLargerThumbnail: true,
              sourceUrl: text,
            },
          },
        });
        const { setLimit } = await import('../../../lib/game.js');
        setLimit(message, db);
      } catch {
        try {
          const { result: hasil } = await (global as any).fetchApi('/download/youtube', { url: text });
          await message.reply({
            audio: { url: hasil.download },
            mimetype: 'audio/mpeg',
            contextInfo: {
              externalAdReply: {
                title: hasil.title,
                body: hasil.quality,
                previewType: 'PHOTO',
                thumbnailUrl: hasil.thumbnail,
                mediaType: 1,
                renderLargerThumbnail: true,
                sourceUrl: text,
              },
            },
          });
          const { setLimit } = await import('../../../lib/game.js');
          setLimit(message, db);
        } catch {
          message.reply('Gagal!');
        }
      }
    },
  },
  {
    name: 'ytmp4',
    aliases: ['ytvideo', 'ytplayvideo'],
    description: 'Download YouTube video',
    category: 'Downloader',
    limit: 1,
    handler: async ({ message, text, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} url_youtube`);
      if (!text.includes('youtu')) return message.reply('Url Tidak Mengandung Result Dari Youtube!');
      message.react('⏳');
      let videoPath: string | null = null;
      try {
        const { ytMp4 } = await import('../../../lib/scraper.js');
        const hasil = await ytMp4(text);
        videoPath = hasil.result;
        await message.reply({ video: { url: videoPath }, caption: `*📍Title:* ${hasil.title}\n*✏Description:* ${hasil.desc ? hasil.desc : ''}\n*🚀Channel:* ${hasil.channel}\n*🗓Upload at:* ${hasil.uploadDate}` });
        const { setLimit } = await import('../../../lib/game.js');
        setLimit(message, db);
      } catch {
        try {
          const { result: hasil } = await (global as any).fetchApi('/download/youtube', { url: text, format: '360' });
          await message.reply({ video: { url: hasil.download }, caption: `*📍Title:* ${hasil.title}\n*✏Quality:* ${hasil.quality ? hasil.quality : ''}\n*⏳Duration:* ${hasil.duration}` });
          const { setLimit } = await import('../../../lib/game.js');
          setLimit(message, db);
        } catch {
          message.reply('Gagal!');
        }
      } finally {
        if (videoPath && fs.existsSync(videoPath)) {
          try { fs.unlinkSync(videoPath); } catch {}
        }
      }
    },
  },
  {
    name: 'ig',
    aliases: ['instagram', 'instadl', 'igdown', 'igdl'],
    description: 'Download Instagram post',
    category: 'Downloader',
    limit: 1,
    handler: async ({ socket, message, text, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} url_instagram`);
      if (!text.includes('instagram.com')) return message.reply('Url Tidak Mengandung Result Dari Instagram!');
      message.react('⏳');
      try {
        const hasil = await (global as any).fetchApi('/download/instagram2', { url: text });
        if (hasil.result?.urls?.length > 1) {
          await socket.sendAlbumMessage(message.chat, {
            album: hasil.result.urls.map((a: any) => (a.is_video ? { video: { url: a.url } } : { image: { url: a.url } })),
            caption: hasil.result.caption,
          }, { quoted: message });
        } else if (hasil.result?.urls?.length == 1) {
          message.reply({ image: { url: hasil.result.urls[0].url }, caption: hasil.result.caption });
        } else message.reply('Postingan Tidak Tersedia atau Privat!');
        const { setLimit } = await import('../../../lib/game.js');
        setLimit(message, db);
      } catch {
        message.reply('Gagal!');
      }
    },
  },
  {
    name: 'tiktok',
    aliases: ['tiktokdown', 'ttdown', 'ttdl', 'tt', 'ttmp4', 'ttvideo', 'tiktokmp4', 'tiktokvideo'],
    description: 'Download TikTok video',
    category: 'Downloader',
    limit: 1,
    handler: async ({ socket, message, text, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} url_tiktok`);
      if (!text.includes('tiktok.com')) return message.reply('Url Tidak Mengandung Result Dari Tiktok!');
      try {
        const hasil = await (global as any).fetchApi('/download/tiktok', { url: text });
        message.react('⏳');
        if (hasil.result.download.type == 'video') {
          await message.reply({ video: { url: hasil.result.download?.video?.nowm_hd || hasil.result.download?.video?.nowm }, caption: `*📍Title:* ${hasil.result.desc || '-'}\n*🕓Create At:* ${hasil.result.create_time}\n*🎃Author:* ${hasil.result.author.nickname} (@${hasil.result.author.unique_id})` });
        } else if (hasil.result.download.type == 'images') {
          await socket.sendAlbumMessage(message.chat, {
            album: hasil.result.download.images.map((a: any) => ({ image: { url: a.url } })),
            caption: `*📍Title:* ${hasil.result.desc || '-'}\n*🕓Create At:* ${hasil.result.create_time}\n*🎃Author:* ${hasil.result.author.nickname} (@${hasil.result.author.unique_id})`,
          }, { quoted: message });
        } else {
          return message.reply('Url Tidak Valid!');
        }
        const { setLimit } = await import('../../../lib/game.js');
        setLimit(message, db);
      } catch {
        message.reply('Gagal!');
      }
    },
  },
  {
    name: 'ttmp3',
    aliases: ['tiktokmp3', 'ttaudio', 'tiktokaudio'],
    description: 'Download TikTok audio',
    category: 'Downloader',
    limit: 1,
    handler: async ({ message, text, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} url_tiktok`);
      if (!text.includes('tiktok.com')) return message.reply('Url Tidak Mengandung Result Dari Tiktok!');
      try {
        const hasil = await (global as any).fetchApi('/download/tiktok', { url: text });
        message.react('⏳');
        await message.reply({
          audio: { url: hasil.result.download.music },
          mimetype: 'audio/mpeg',
          contextInfo: {
            externalAdReply: {
              title: 'TikTok • ' + hasil.result.author.nickname,
              body: hasil.result.statistics.like + ' suka, ' + hasil.result.statistics.command + ' komentar. ' + hasil.result.desc,
              previewType: 'PHOTO',
              thumbnailUrl: hasil.result.download?.music_info?.cover_hd || hasil.result.download.music_info.cover_medium,
              mediaType: 1,
              renderLargerThumbnail: true,
              sourceUrl: text,
            },
          },
        });
        const { setLimit } = await import('../../../lib/game.js');
        setLimit(message, db);
      } catch {
        message.reply('Gagal!');
      }
    },
  },
  {
    name: 'fb',
    aliases: ['fbdl', 'fbdown', 'facebook', 'facebookdl', 'facebookdown', 'fbdownload', 'fbmp4', 'fbvideo'],
    description: 'Download Facebook video',
    category: 'Downloader',
    limit: 1,
    handler: async ({ socket, message, text, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} url_facebook`);
      if (!text.includes('facebook.com')) return message.reply('Url Tidak Mengandung Result Dari Facebook!');
      try {
        const hasil = await (global as any).fetchApi('/download/facebook', { url: text });
        if (!hasil.result.hd && !hasil.result.sd) return message.reply('Video Tidak ditemukan!');
        message.react('⏳');
        await socket.sendFileUrl(message.chat, hasil.result.hd || hasil.result.sd, `*🎐Title:* ${hasil.result.title}`, message);
        const { setLimit } = await import('../../../lib/game.js');
        setLimit(message, db);
      } catch {
        message.reply('Gagal!');
      }
    },
  },
  {
    name: 'mediafire',
    aliases: ['mf'],
    description: 'Download Mediafire file',
    category: 'Downloader',
    limit: 1,
    handler: async ({ socket, message, text, args, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} https://www.mediafire.com/file/xxxxxxxxx/xxxxx.zip/file`);
      const isUrl = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;
      if (!isUrl.test(args[0]) && !args[0].includes('mediafire.com')) return message.reply('Url Invalid!');
      try {
        const { result: res } = await (global as any).fetchApi('/download/mediafire', { url: text });
        const listv = db?.listv || ['•'];
        const setv = listv[Math.floor(Math.random() * listv.length)];
        await socket.sendMedia(message.chat, res.link, res.filename, `*MEDIAFIRE DOWNLOADER*\n\n*${setv} Name* : ${res.filename}\n*${setv} Size* : ${res.size}`, message);
        const { setLimit } = await import('../../../lib/game.js');
        setLimit(message, db);
      } catch {
        message.reply('Gagal!');
      }
    },
  },
  {
    name: 'spotifydl',
    description: 'Download Spotify track',
    category: 'Downloader',
    limit: 1,
    handler: async ({ message, text, args, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} https://open.spotify.com/track/0JiVRyTJcJnmlwCZ854K4p`);
      const isUrl = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;
      if (!isUrl.test(args[0]) && !args[0].includes('open.spotify.com/track')) return message.reply('Url Invalid!');
      let buffer: any;
      try {
        const { result: hasil } = await (global as any).fetchApi('/download/spotify', { url: text });
        buffer = await (global as any).fetchApi('/download/spotify/audio', { url: text }, { stream: true });
        message.react('⏳');
        await message.reply({
          audio: { url: buffer },
          mimetype: 'audio/mpeg',
          contextInfo: {
            externalAdReply: {
              title: hasil.artist + ' • ' + hasil.title,
              body: hasil.duration,
              previewType: 'PHOTO',
              thumbnailUrl: hasil.cover,
              mediaType: 1,
              renderLargerThumbnail: true,
              sourceUrl: text,
            },
          },
        });
        const { setLimit } = await import('../../../lib/game.js');
        setLimit(message, db);
      } catch {
        message.reply('Gagal!');
      } finally {
        if (buffer && fs.existsSync(buffer)) fs.unlinkSync(buffer);
      }
    },
  },
];
