// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';
import fs from 'fs';
import { exec } from 'child_process';

export const commands: PluginCommand[] = [
  {
    name: 'fetch',
    aliases: ["get"],
    description: 'Fetch URL content',
    category: 'Tools',
    premiumOnly: true,
    limit: 1,
    handler: async ({ message, text, db }) => {
      if (!/^https?:\/\//.test(text)) return message.reply('Awali dengan http:// atau https://');
      try {
        const axios = (await import('axios')).default;
        const res = await axios.get(text);
        if (!/text|json|html|plain/.test(res.headers['content-type'])) {
          await message.reply(text);
        } else message.reply(JSON.stringify(res.data, null, 2));
        const { setLimit } = await import('../../../lib/game.cjs');
        setLimit(message, db);
      } catch (e: any) {
        message.reply(String(e));
      }
    },
  },
  {
    name: 'toaudio',
    aliases: ['toaud'],
    description: 'Convert video to audio',
    category: 'Tools',
    handler: async ({ socket, message, db }) => {
      if (!/video|audio/.test(message.mime || '')) return message.reply(`Kirim/Reply Video/Audio Yang Ingin Dijadikan Audio Dengan Caption ${message.prefix + message.command}`);
      message.react('⏳');
      const media = await socket.downloadAndSaveMediaMessage(message.quoted.msg || message.quoted);
      try {
        const { toAudio } = await import('../../../lib/converter.cjs');
        const audio = await toAudio(media, 'mp4');
        await message.reply({ audio: { url: audio }, mimetype: 'audio/mpeg' });
      } finally {
        if (fs.existsSync(media)) fs.unlinkSync(media);
      }
    },
  },
  {
    name: 'tomp3',
    description: 'Convert video to mp3 document',
    category: 'Tools',
    handler: async ({ socket, message, db }) => {
      if (!/video|audio/.test(message.mime || '')) return message.reply(`Kirim/Reply Video/Audio Yang Ingin Dijadikan Audio Dengan Caption ${message.prefix + message.command}`);
      message.react('⏳');
      const media = await socket.downloadAndSaveMediaMessage(message.quoted.msg || message.quoted);
      try {
        const { toAudio } = await import('../../../lib/converter.cjs');
        const audio = await toAudio(media, 'mp4');
        await message.reply({ document: { url: audio }, mimetype: 'audio/mpeg', fileName: 'Convert By Foxy Bot.mp3' });
      } finally {
        if (fs.existsSync(media)) fs.unlinkSync(media);
      }
    },
  },
  {
    name: 'tovn',
    aliases: ["toptt", "tovoice"],
    description: 'Convert to voice note',
    category: 'Tools',
    handler: async ({ socket, message, db }) => {
      if (!/video|audio/.test(message.mime || '')) return message.reply(`Kirim/Reply Video/Audio Yang Ingin Dijadikan Audio Dengan Caption ${message.prefix + message.command}`);
      message.react('⏳');
      const media = await socket.downloadAndSaveMediaMessage(message.quoted.msg || message.quoted);
      try {
        const { toPTT } = await import('../../../lib/converter.cjs');
        const audioBuffer = await toPTT(media, 'mp4');
        await message.reply({ audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus', ptt: true });
      } finally {
        if (fs.existsSync(media)) fs.unlinkSync(media);
      }
    },
  },
  {
    name: 'togif',
    description: 'Convert sticker/video to GIF',
    category: 'Tools',
    handler: async ({ socket, message, db }) => {
      if (!/webp|video/.test(message.mime || '')) return message.reply(`Reply Video/Stiker dengan caption *${message.prefix + message.command}*`);
      message.react('⏳');
      const media = await socket.downloadAndSaveMediaMessage(message.quoted.msg || message.quoted);
      const { getRandom, pickRandom } = await import('../../../lib/function.cjs');
      const ran = `./database/temp/${getRandom('.mp4')}`;
      exec(`ffmpeg -y -i "${media}" -an -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -pix_fmt yuv420p -c:v libx264 -preset veryfast "${ran}"`, async (err) => {
        try {
          if (err) return message.reply('Gagal!');
          await message.reply({ video: { url: ran }, gifPlayback: true, caption: 'Selesai!', gifAttribution: pickRandom(['TENOR', 'GIPHY']) });
        } finally {
          if (fs.existsSync(media)) fs.unlinkSync(media);
          if (fs.existsSync(ran)) fs.unlinkSync(ran);
        }
      });
    },
  },
  {
    name: 'toimage',
    aliases: ["toimg"],
    description: 'Convert sticker to image',
    category: 'Tools',
    handler: async ({ socket, message, db }) => {
      if (!/webp|video|image/.test(message.mime || '')) return message.reply(`Reply Video/Stiker dengan caption *${message.prefix + message.command}*`);
      message.react('⏳');
      const media = await socket.downloadAndSaveMediaMessage(message.quoted.msg || message.quoted);
      const { getRandom } = await import('../../../lib/function.cjs');
      const ran = `./database/temp/${getRandom('.png')}`;
      exec(`ffmpeg -y -i "${media}" -vframes 1 "${ran}"`, async (err) => {
        try {
          if (err) return message.reply('Gagal!');
          await message.reply({ image: { url: ran }, caption: 'Selesai!' });
        } finally {
          if (fs.existsSync(media)) fs.unlinkSync(media);
          if (fs.existsSync(ran)) fs.unlinkSync(ran);
        }
      });
    },
  },
  {
    name: 'toptv',
    description: 'Convert video to PTV message',
    category: 'Tools',
    handler: async ({ socket, message }) => {
      if (!/video/.test(message.mime || '')) return message.reply(`Kirim/Reply Video Yang Ingin Dijadikan PTV Message Dengan Caption ${message.prefix + message.command}`);
      if ((message.quoted ? message.quoted.type : message.type) === 'videoMessage') {
        message.react('⏳');
        const media = await socket.downloadAndSaveMediaMessage(message.quoted.msg || message.quoted);
        try {
          const { generateWAMessageContent } = await import('baileys');
          const messageContent = await generateWAMessageContent({ video: { url: media } }, { upload: socket.waUploadToServer });
          await socket.relayMessage(message.chat, { ptvMessage: messageContent.videoMessage }, {});
        } finally {
          if (fs.existsSync(media)) fs.unlinkSync(media);
        }
      } else message.reply('Reply Video Yang Mau Di Ubah Ke PTV Message!');
    },
  },
  {
    name: 'tourl',
    description: 'Upload media to URL',
    category: 'Tools',
    limit: 1,
    handler: async ({ socket, message, db }) => {
      if (/webp|video|sticker|audio|jpg|jpeg|png/.test(message.mime || '')) {
        message.react('⏳');
        const media = await socket.downloadAndSaveMediaMessage(message.quoted.msg || message.quoted);
        try {
          const { UguuSe } = await import('../../../lib/uploader.cjs');
          const anu = await UguuSe(media);
          message.reply('Url : ' + anu.url);
        } finally {
          if (fs.existsSync(media)) fs.unlinkSync(media);
        }
      } else message.reply('Kirim medianya!');
    },
  },
  {
    name: 'translate',
    aliases: ["tr"],
    description: 'Translate text',
    category: 'Tools',
    handler: async ({ message, args, text, db }) => {
      if (text && text == 'list') {
        const list_tr = `╭──❍「 *Kode Bahasa* 」❍\n│• af : Afrikaans\n│• ar : Arab\n│• zh : Chinese\n│• en : English\n│• fr : French\n│• de : German\n│• hi : Hindi\n│• id : Indonesian\n│• ja : Japanese\n│• ko : Korean\n│• pt : Portuguese\n│• ru : Russian\n│• es : Spanish\n╰──────❍`;
        message.reply(list_tr);
      } else {
        if (!message.quoted && (!text || !args[1])) return message.reply(`Kirim/reply text dengan caption ${message.prefix + message.command}`);
        const locale = db?.locale || 'id';
        const lang = args[0] ? args[0] : locale;
        const teks = args[1] ? args.slice(1).join(' ') : message.quoted.text;
        try {
          const hasil = await (global as any).fetchApi('/tools/translate', { text: teks, lang });
          message.reply(`To : ${lang}\n${hasil.result.translate}`);
        } catch {
          message.reply(`Lang *${lang}* Tidak Ditemukan!\nSilahkan lihat list, ${message.prefix + message.command} list`);
        }
      }
    },
  },
  {
    name: 'toqr',
    aliases: ["qr"],
    description: 'Generate QR code',
    category: 'Tools',
    limit: 1,
    handler: async ({ message, text, db }) => {
      if (!text) return message.reply(`Ubah Text ke Qr dengan *${message.prefix + message.command}* textnya`);
      message.react('⏳');
      try {
        const anu = await (global as any).fetchApi('/tools/to-qr', { data: text }, { stream: true });
        await message.reply({ image: { url: anu }, caption: 'Nih Bro' });
        const { setLimit } = await import('../../../lib/game.cjs');
        setLimit(message, db);
      } finally {}
    },
  },
  {
    name: 'tohd',
    aliases: ["remini", "hd"],
    description: 'Enhance image quality',
    category: 'Tools',
    limit: 1,
    handler: async ({ socket, message, text, db }) => {
      if (!/image/.test(message.mime || '')) return message.reply(`Kirim/Reply Gambar dengan format\nExample: ${message.prefix + message.command}`);
      message.react('⏳');
      const media = await socket.downloadAndSaveMediaMessage(message.quoted.msg || message.quoted);
      try {
        const form = new (await import('form-data')).default();
        form.append('buffer', fs.createReadStream(media), { filename: 'image.jpg', contentType: 'image/jpeg' });
        const hasil = await (global as any).fetchApi('/tools/remini', form, { stream: true });
        await message.reply({ image: { url: hasil }, caption: 'Selesai!' });
        const { setLimit } = await import('../../../lib/game.cjs');
        setLimit(message, db);
      } catch {
        const { getRandom } = await import('../../../lib/function.cjs');
        const ran = `./database/temp/${getRandom('.jpg')}`;
        const scaleFactor = isNaN(parseInt(text)) ? 4 : parseInt(text) < 10 ? parseInt(text) : 4;
        exec(`ffmpeg -i "${media}" -vf "scale=iw*${scaleFactor}:ih*${scaleFactor}:flags=lanczos" -q:v 1 "${ran}"`, async (err) => {
          try {
            if (err) return message.reply('Gagal!');
            await message.reply({ image: { url: ran }, caption: 'Selesai!' });
            const { setLimit } = await import('../../../lib/game.cjs');
            setLimit(message, db);
          } finally {
            if (fs.existsSync(ran)) fs.unlinkSync(ran);
            if (fs.existsSync(media)) fs.unlinkSync(media);
          }
        });
      } finally {
        if (fs.existsSync(media)) fs.unlinkSync(media);
      }
    },
  },
  {
    name: 'dehaze',
    aliases: ["colorize", "colorfull"],
    description: 'Colorize/dehaze image',
    category: 'Tools',
    limit: 1,
    handler: async ({ socket, message, db }) => {
      if (!/image/.test(message.mime || '')) return message.reply(`Kirim/Reply Gambar dengan format\nExample: ${message.prefix + message.command}`);
      const media = await socket.downloadAndSaveMediaMessage(message.quoted.msg || message.quoted);
      try {
        const form = new (await import('form-data')).default();
        form.append('buffer', fs.createReadStream(media), { filename: 'image.jpg', contentType: 'image/jpeg' });
        const hasil = await (global as any).fetchApi('/tools/recolor', form, { stream: true });
        await message.reply({ image: { url: hasil }, caption: 'Selesai!' });
        const { setLimit } = await import('../../../lib/game.cjs');
        setLimit(message, db);
      } finally {
        if (fs.existsSync(media)) fs.unlinkSync(media);
      }
    },
  },
  {
    name: 'hitamkan',
    aliases: ["toblack"],
    description: 'Apply skin tone filter',
    category: 'Tools',
    limit: 1,
    handler: async ({ socket, message, db }) => {
      if (!/image/.test(message.mime || '')) return message.reply(`Kirim/Reply Gambar dengan format\nExample: ${message.prefix + message.command}`);
      const media = await socket.downloadAndSaveMediaMessage(message.quoted.msg || message.quoted);
      try {
        const form = new (await import('form-data')).default();
        form.append('style', 'summer');
        form.append('buffer', fs.createReadStream(media), { filename: 'image.jpg', contentType: 'image/jpeg' });
        const hasil = await (global as any).fetchApi('/create/skin-tone', form, { stream: true });
        message.reply({ image: { url: hasil }, caption: 'Selesai!' });
        const { setLimit } = await import('../../../lib/game.cjs');
        setLimit(message, db);
      } finally {
        if (fs.existsSync(media)) fs.unlinkSync(media);
      }
    },
  },
  {
    name: 'ssweb',
    description: 'Screenshot website',
    category: 'Tools',
    premiumOnly: true,
    limit: 1,
    handler: async ({ message, text, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} https://github.com`);
      const anu = 'https://' + text.replace(/^https?:\/\//, '');
      try {
        const hasil = await (global as any).fetchApi('/tools/ss', { url: anu }, { stream: true });
        await message.reply({ image: { url: hasil }, caption: 'Selesai!' });
        const { setLimit } = await import('../../../lib/game.cjs');
        setLimit(message, db);
      } finally {}
    },
  },
  {
    name: 'readmore',
    description: 'Create read more text',
    category: 'Tools',
    handler: async ({ message, text }) => {
      const teks1 = text.split('|')[0] || '';
      const teks2 = text.split('|')[1] || '';
      const readmore = String.fromCharCode(8206).repeat(999);
      message.reply(teks1 + readmore + teks2);
    },
  },
  {
    name: 'getexif',
    description: 'Get sticker EXIF data',
    category: 'Tools',
    handler: async ({ message }) => {
      if (!message.quoted) return message.reply(`Reply sticker\nDengan caption ${message.prefix + message.command}`);
      if (!/sticker|webp/.test(message.quoted.type || '')) return message.reply(`Reply sticker\nDengan caption ${message.prefix + message.command}`);
      const webp = await import('node-webpmux');
      const img = new webp.Image();
      await img.load(await message.quoted.download());
      if (!img.exif) return message.reply('Stiker ini tidak memiliki metadata/EXIF sama sekali.');
      try {
        const util = await import('util');
        const exifData = JSON.parse(img.exif.slice(22).toString());
        message.reply(util.default.format(exifData));
      } catch {
        message.reply(`Stiker memiliki EXIF, tapi formatnya bukan JSON yang valid:\n\n${img.exif.toString()}`);
      }
    },
  },
  {
    name: 'cuaca',
    aliases: ['weather'],
    description: 'Check weather',
    category: 'Tools',
    handler: async ({ message, text }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} jakarta`);
      try {
        const { result: data } = await (global as any).fetchApi('/tools/cuaca', { city: text });
        message.reply(`*🏙 Cuaca Kota ${data.name}*\n\n*🌤️ Cuaca :* ${data.weather[0].main}\n*📝 Deskripsi :* ${data.weather[0].description}\n*🌡️ Suhu Rata-rata :* ${data.main.temp} °C\n*🤔 Terasa Seperti :* ${data.main.feels_like} °C\n*🌡️ Tekanan :* ${data.main.pressure} hPa\n*💧 Kelembapan :* ${data.main.humidity}%\n*🌪️ Kecepatan Angin :* ${data.wind.speed} Km/h\n*📍Lokasi :*\n- *Bujur :* ${data.coord.lat}\n- *Lintang :* ${data.coord.lon}\n*🌏 Negara :* ${data.sys.country}`);
      } catch {
        message.reply('Kota Tidak Ditemukan!');
      }
    },
  },
  {
    name: 'sticker',
    aliases: ["stiker", "s", "stickergif", "stikergif", "sgif", "stickerwm", "swm", "curi", "colong", "take", "stickergifwm", "sgifwm"],
    description: 'Create sticker from image/video',
    category: 'Tools',
    handler: async ({ socket, message, text, db }) => {
      if (!/image|video|sticker/.test(message.quoted?.type || '')) return message.reply(`Kirim/reply gambar/video/gif dengan caption ${message.prefix + message.command}\nDurasi Image/Video/Gif 1-9 Detik`);
      const media = await socket.downloadAndSaveMediaMessage(message.quoted.msg || message.quoted);
      const teks1 = text.split('|')[0] || db?.packname || 'Bot WhatsApp';
      const teks2 = text.split('|')[1] || db?.author || 'Foxy Bot';
      if (/image|webp/.test(message.mime || '')) {
        message.react('⏳');
        await socket.sendAsSticker(message.chat, media, message, { packname: teks1, author: teks2 });
      } else if (/video/.test(message.mime || '')) {
        if ((message.quoted.msg || message.quoted).seconds > 11) return message.reply('Maksimal 10 detik!');
        message.react('⏳');
        await socket.sendAsSticker(message.chat, media, message, { packname: teks1, author: teks2 });
      } else message.reply(`Kirim/reply gambar/video/gif dengan caption ${message.prefix + message.command}`);
    },
  },
  {
    name: 'smeme',
    aliases: ["stickmeme", "stikmeme", "stickermeme", "stikermeme"],
    description: 'Create meme sticker',
    category: 'Tools',
    limit: 1,
    handler: async ({ socket, message, text, db }) => {
      if (!/image|webp/.test(message.mime || '')) return message.reply(`Kirim/reply image/sticker\nDengan caption ${message.prefix + message.command} atas|bawah`);
      if (!text) return message.reply(`Kirim/reply image/sticker dengan caption ${message.prefix + message.command} atas|bawah`);
      message.react('⏳');
      const atas = text.split('|')[0] || '-';
      const bawah = text.split('|')[1] || '-';
      const media = await socket.downloadAndSaveMediaMessage(message.quoted.msg || message.quoted);
      try {
        const { UguuSe } = await import('../../../lib/uploader.cjs');
        const mem = await UguuSe(media);
        const smeme = await (global as any).fetchApi('/create/meme2', { url: mem.url, text: atas, text2: bawah }, { stream: true });
        await socket.sendAsSticker(message.chat, smeme, message, { packname: db?.packname, author: db?.author });
        const { setLimit } = await import('../../../lib/game.cjs');
        setLimit(message, db);
      } catch {
        message.reply('Gagal!');
      } finally {
        if (fs.existsSync(media)) fs.unlinkSync(media);
      }
    },
  },
  {
    name: 'emojimix',
    description: 'Mix two emojis',
    category: 'Tools',
    limit: 1,
    handler: async ({ socket, message, text, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} 😅+🤔`);
      const [emoji1, emoji2] = text.split('+');
      if (!emoji1 && !emoji2) return message.reply(`Example: ${message.prefix + message.command} 😅+🤔`);
      const { result } = await (global as any).fetchApi('/tools/emojimix', { emoji1, emoji2 });
      if (result.length < 1) return message.reply(`Mix Emoji ${text} Tidak Ditemukan!`);
      for (const res of result) {
        await socket.sendAsSticker(message.chat, res.url, message, { packname: db?.packname, author: db?.author });
      }
      const { setLimit } = await import('../../../lib/game.cjs');
      setLimit(message, db);
    },
  },
  {
    name: 'iqc',
    description: 'Create quote chat image',
    category: 'Tools',
    limit: 1,
    handler: async ({ message, text, db }) => {
      if (!text && (!message.quoted || !message.quoted.text)) return message.reply(`Kirim/reply pesan *${message.prefix + message.command}* Teksnya`);
      message.react('⏳');
      const queryText = text ? text : message.quoted.text;
      if (queryText.length >= 200) return message.reply('Max 200 Length!');
      try {
        const res = await (global as any).fetchApi('/create/iqc', { text: queryText }, { stream: true });
        await message.reply({ image: { url: res }, caption: 'Selesai!' });
        const { setLimit } = await import('../../../lib/game.cjs');
        setLimit(message, db);
      } finally {}
    },
  },
  {
    name: 'qc',
    aliases: ["quote", "fakechat"],
    description: 'Create fake chat quote',
    category: 'Tools',
    limit: 1,
    handler: async ({ socket, message, text, db, store }) => {
      if (!text && !message.quoted) return message.reply(`Kirim / reply pesan untuk *${message.prefix + message.command}*`);
      try {
        let medianya: any;
        let quotedMedianya: any;
        let mediaPath: string | undefined;
        let quotedMediaPath: string | undefined;
        const ppUrl = await socket.profilePictureUrl(message.sender, 'image').catch(() => 'https://i.pinimg.com/564x/8a/e9/e9/8ae9e92fa4e69967aa61bf2bda967b7b.jpg');
        const senderName = message.sender.split('@')[0];
        const quotedName = (message.quoted?.sender || '').split('@')[0];
        if (message.isMedia) {
          mediaPath = await socket.downloadAndSaveMediaMessage(message.msg || message);
          const { UguuSe } = await import('../../../lib/uploader.cjs');
          medianya = await UguuSe(mediaPath);
        }
        if (message.quoted?.isMedia) {
          quotedMediaPath = await socket.downloadAndSaveMediaMessage(message.quoted.msg || message.quoted);
          const { UguuSe } = await import('../../../lib/uploader.cjs');
          quotedMedianya = await UguuSe(quotedMediaPath);
        }
        const payload = {
          type: 'quote',
          format: 'png',
          backgroundColor: '#FFFFFF',
          width: 512,
          height: 768,
          scale: 2,
          messages: [{
            entities: [],
            ...(medianya?.url ? { media: { url: medianya.url } } : {}),
            avatar: true,
            from: { id: 1, name: senderName, photo: { url: ppUrl } },
            text,
            replyMessage: message.quoted ? {
              name: quotedName || '',
              text: message.quoted.text || '',
              ...(quotedMedianya?.url ? { media: { url: quotedMedianya.url } } : {}),
              chatId: Math.floor(Math.random() * 9999999),
            } : {},
          }],
        };
        const res = await (global as any).fetchApi('/create/qc', payload, { method: 'POST', buffer: true });
        await socket.sendAsSticker(message.chat, Buffer.from(res, 'base64'), message, { packname: db?.packname, author: db?.author });
        const { setLimit } = await import('../../../lib/game.cjs');
        setLimit(message, db);
      } catch {
        message.reply('Gagal!');
      } finally {
        if (mediaPath && fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath);
        if (quotedMediaPath && fs.existsSync(quotedMediaPath)) fs.unlinkSync(quotedMediaPath);
      }
    },
  },
  {
    name: 'brat',
    description: 'Create brat style sticker',
    category: 'Tools',
    limit: 1,
    handler: async ({ socket, message, text, db }) => {
      if (!text && (!message.quoted || !message.quoted.text)) return message.reply(`Kirim/reply pesan *${message.prefix + message.command}* Teksnya`);
      const queryText = text ? text : message.quoted.text;
      if (queryText.length >= 200) return message.reply('Max 200 Length!');
      try {
        const res = await (global as any).fetchApi('/create/brat', { text: queryText }, { stream: true });
        await socket.sendAsSticker(message.chat, res, message);
        const { setLimit } = await import('../../../lib/game.cjs');
        setLimit(message, db);
      } catch {
        try {
          const res = await (global as any).fetchApi('/create/brat3', { text: queryText }, { stream: true });
          await socket.sendAsSticker(message.chat, res, message);
          const { setLimit } = await import('../../../lib/game.cjs');
          setLimit(message, db);
        } catch {
          message.reply('Gagal!');
        }
      }
    },
  },
  {
    name: 'bratvid',
    aliases: ["bratvideo"],
    description: 'Create brat style video',
    category: 'Tools',
    limit: 1,
    handler: async ({ socket, message, text, db }) => {
      if (!text && (!message.quoted || !message.quoted.text)) return message.reply(`Kirim/reply pesan *${message.prefix + message.command}* Teksnya`);
      message.react('⏳');
      const teks = (message.quoted ? message.quoted.text : text).split(' ');
      if (teks.length >= 200) return message.reply('Max 200 Length!');
      const tempDir = path.join(process.cwd(), 'database/temp');
      const time = Date.now();
      const framePaths: string[] = [];
      const fileListPath = path.join(tempDir, `${time}-${message.sender}.txt`);
      const outputVideoPath = path.join(tempDir, `${time}-${message.sender}-output.mp4`);
      try {
        for (let i = 0; i < teks.length; i++) {
          const currentText = teks.slice(0, i + 1).join(' ');
          const framePath = path.join(tempDir, `${time}-${message.sender}${i}.mp4`);
          try {
            const res = await (global as any).fetchApi('/create/brat2', { text: currentText }, { stream: framePath });
            framePaths.push(res);
          } catch {
            const res = await (global as any).fetchApi('/create/brat4', { text: currentText }, { stream: framePath });
            framePaths.push(res);
          }
        }
        let fileListContent = '';
        for (let i = 0; i < framePaths.length; i++) {
          fileListContent += `file '${framePaths[i]}'\nduration 0.5\n`;
        }
        fileListContent += `file '${framePaths[framePaths.length - 1]}'\nduration 3\n`;
        fs.writeFileSync(fileListPath, fileListContent);
        const { execSync } = await import('child_process');
        execSync(`ffmpeg -y -f concat -safe 0 -i "${fileListPath}" -vf 'fps=30' -c:v libx264 -preset veryfast -pix_fmt yuv420p -t 00:00:10 "${outputVideoPath}"`);
        await socket.sendAsSticker(message.chat, outputVideoPath, message, { packname: db?.packname, author: db?.author });
        const { setLimit } = await import('../../../lib/game.cjs');
        setLimit(message, db);
      } catch {
        message.reply('Gagal!');
      } finally {
        framePaths.forEach((filePath) => { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); });
        if (fs.existsSync(fileListPath)) fs.unlinkSync(fileListPath);
        if (fs.existsSync(outputVideoPath)) fs.unlinkSync(outputVideoPath);
      }
    },
  },
  {
    name: 'wasted',
    description: 'Apply wasted filter to image',
    category: 'Tools',
    limit: 1,
    handler: async ({ socket, message, db }) => {
      if (!/jpg|jpeg|png/.test(message.mime || '')) return message.reply('Kirim medianya!');
      message.react('⏳');
      const media = await socket.downloadAndSaveMediaMessage(message.quoted.msg || message.quoted);
      try {
        const form = new (await import('form-data')).default();
        form.append('buffer', fs.createReadStream(media), { filename: 'image.jpg', contentType: 'image/jpeg' });
        const hasil = await (global as any).fetchApi('/create/wasted', form, { stream: true });
        await socket.sendMedia(message.chat, hasil, '', 'Nih Bro', message);
        const { setLimit } = await import('../../../lib/game.cjs');
        setLimit(message, db);
      } finally {
        if (fs.existsSync(media)) fs.unlinkSync(media);
      }
    },
  },
  {
    name: 'trigger',
    aliases: ["triggered"],
    description: 'Apply trigger effect to image',
    category: 'Tools',
    limit: 1,
    handler: async ({ socket, message, db }) => {
      if (!/jpg|jpeg|png/.test(message.mime || '')) return message.reply('Kirim medianya!');
      message.react('⏳');
      const media = await socket.downloadAndSaveMediaMessage(message.quoted.msg || message.quoted);
      try {
        const form = new (await import('form-data')).default();
        form.append('buffer', fs.createReadStream(media), { filename: 'image.jpg', contentType: 'image/jpeg' });
        const hasil = await (global as any).fetchApi('/create/triggered', form, { stream: true });
        await socket.sendMedia(message.chat, hasil, '', 'Selesai!', message);
        const { setLimit } = await import('../../../lib/game.cjs');
        setLimit(message, db);
      } finally {
        if (fs.existsSync(media)) fs.unlinkSync(media);
      }
    },
  },
  {
    name: 'nulis',
    description: 'Write text on paper image',
    category: 'Tools',
    handler: async ({ message }) => {
      message.reply(`*Example*\n${message.prefix}nuliskiri\n${message.prefix}nuliskanan\n${message.prefix}foliokiri\n${message.prefix}foliokanan`);
    },
  },
  {
    name: 'nuliskanan',
    aliases: ["nuliskiri", "foliokanan", "foliokiri"],
    description: 'Write text on paper image',
    category: 'Tools',
    limit: 1,
    handler: async ({ message, text, db }) => {
      if (!text) return message.reply(`Kirim perintah *${message.prefix + message.command}* Teksnya`);
      message.react('⏳');
      const splitText = text.replace(/(\S+\s*){1,9}/g, '$&\n');
      const fixHeight = splitText.split('\n').slice(0, 31).join('\n');
      try {
        const hasil = await (global as any).fetchApi('/create/nulis/' + message.command, { text: fixHeight }, { stream: true });
        await message.reply({ image: { url: hasil }, caption: 'Jangan Malas Lord. Jadilah siswa yang rajin' });
        const { setLimit } = await import('../../../lib/game.cjs');
        setLimit(message, db);
      } finally {}
    },
  },
  {
    name: 'bass',
    aliases: ["blown", "deep", "earrape", "fast", "fat", "nightcore", "reverse", "robot", "slow", "smooth", "tupai"],
    description: 'Apply audio effects',
    category: 'Tools',
    handler: async ({ socket, message, db }) => {
      let set: string;
      if (/bass/.test(message.command)) set = '-af equalizer=f=54:width_type=o:width=2:g=20';
      if (/blown/.test(message.command)) set = '-af acrusher=.1:1:64:0:log';
      if (/deep/.test(message.command)) set = '-af atempo=4/4,asetrate=44500*2/3';
      if (/earrape/.test(message.command)) set = '-af volume=12';
      if (/fast/.test(message.command)) set = '-filter:a "atempo=1.63,asetrate=44100"';
      if (/fat/.test(message.command)) set = '-filter:a "atempo=1.6,asetrate=22100"';
      if (/nightcore/.test(message.command)) set = '-filter:a atempo=1.06,asetrate=44100*1.25';
      if (/reverse/.test(message.command)) set = '-filter_complex "areverse"';
      if (/robot/.test(message.command)) set = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"';
      if (/slow/.test(message.command)) set = '-filter:a "atempo=0.7,asetrate=44100"';
      if (/smooth/.test(message.command)) set = '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"';
      if (/tupai/.test(message.command)) set = '-filter:a "atempo=0.5,asetrate=65100"';
      if (/audio/.test(message.mime || '')) {
        message.react('⏳');
        const media = await socket.downloadAndSaveMediaMessage(message.quoted.msg || message.quoted);
        const { getRandom } = await import('../../../lib/function.cjs');
        const ran = `./database/temp/${getRandom('.mp3')}`;
        exec(`ffmpeg -i "${media}" ${set} "${ran}"`, async (err) => {
          try {
            if (err) return message.reply('Gagal!');
            await message.reply({ audio: { url: ran }, mimetype: 'audio/mpeg' });
          } finally {
            if (fs.existsSync(media)) fs.unlinkSync(media);
            if (fs.existsSync(ran)) fs.unlinkSync(ran);
          }
        });
      } else message.reply(`Balas audio yang ingin diubah dengan caption *${message.prefix + message.command}*`);
    },
  },
  {
    name: 'tinyurl',
    aliases: ["shorturl", "shortlink"],
    description: 'Shorten URL',
    category: 'Tools',
    limit: 1,
    handler: async ({ message, text, db }) => {
      const isUrl = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;
      if (!text || !isUrl.test(text)) return message.reply(`Example: ${message.prefix + message.command} https://github.com`);
      const hasil = await (global as any).fetchApi('/other/tinyurl', { url: text });
      message.reply('Url : ' + hasil.result);
      const { setLimit } = await import('../../../lib/game.cjs');
      setLimit(message, db);
    },
  },
  {
    name: 'git',
    aliases: ["gitclone"],
    description: 'Download GitHub repo as zip',
    category: 'Tools',
    limit: 1,
    handler: async ({ message, args, db }) => {
      const isUrl = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;
      if (!args[0]) return message.reply(`Example: ${message.prefix + message.command} https://github.com/nazedev/hitori`);
      if (!isUrl.test(args[0]) && !args[0].includes('github.com')) return message.reply('Gunakan Url Github!');
      const [, user, repo] = args[0].match(/(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i) || [];
      try {
        message.reply({ document: { url: `https://api.github.com/repos/${user}/${repo}/zipball` }, fileName: repo + '.zip', mimetype: 'application/zip' }).catch(() => message.reply('Gagal!'));
        const { setLimit } = await import('../../../lib/game.cjs');
        setLimit(message, db);
      } catch {
        message.reply('Gagal!');
      }
    },
  },
];
