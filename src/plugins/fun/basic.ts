// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';

export const commands: PluginCommand[] = [
  {
    name: 'motivasi',
    description: 'Motivational quote',
    category: 'Fun',
    handler: async ({ message }) => {
      const hasil = await (global as any).fetchApi('/random/motivasi');
      message.reply(hasil.result);
    },
  },
  {
    name: 'bijak',
    description: 'Wise quote',
    category: 'Fun',
    handler: async ({ message }) => {
      const hasil = await (global as any).fetchApi('/random/bijak');
      message.reply(hasil.result);
    },
  },
  {
    name: 'dare',
    description: 'Dare challenge',
    category: 'Fun',
    handler: async ({ message }) => {
      const hasil = await (global as any).fetchApi('/random/dare');
      message.reply(hasil.result);
    },
  },
  {
    name: 'quotes',
    description: 'Random quote',
    category: 'Fun',
    handler: async ({ message }) => {
      const { result: hasil } = await (global as any).fetchApi('/random/quotes');
      message.reply(`_${hasil.quotes}_\n\n*- ${hasil.author}*`);
    },
  },
  {
    name: 'truth',
    description: 'Truth challenge',
    category: 'Fun',
    handler: async ({ message }) => {
      const hasil = await (global as any).fetchApi('/random/truth');
      message.reply(`_${hasil.result}_`);
    },
  },
  {
    name: 'renungan',
    description: 'Random reflection image',
    category: 'Fun',
    handler: async ({ message }) => {
      const hasil = await (global as any).fetchApi('/random/renungan');
      message.reply('', {
        contextInfo: {
          forwardingScore: 10,
          isForwarded: true,
          externalAdReply: {
            title: message.sender.split('@')[0],
            thumbnailUrl: hasil.result,
            mediaType: 1,
            previewType: 'PHOTO',
            renderLargerThumbnail: true,
          },
        },
      });
    },
  },
  {
    name: 'bucin',
    description: 'Bucin quote',
    category: 'Fun',
    handler: async ({ message }) => {
      const hasil = await (global as any).fetchApi('/random/bucin');
      message.reply(hasil.result);
    },
  },
  {
    name: 'coffe',
    aliases: ['kopi'],
    description: 'Random coffee image',
    category: 'Fun',
    handler: async ({ socket, message }) => {
      try {
        await socket.sendFileUrl(message.chat, 'https://coffee.alexflipnote.dev/random', '☕ Random Coffe', message);
      } catch {
        try {
          const { fetchJson, pickRandom } = await import('../../../lib/function.js');
          const anu = await fetchJson('https://api.sampleapis.com/coffee/hot');
          await socket.sendFileUrl(message.chat, pickRandom(anu).image, '☕ Random Coffe', message);
        } catch {
          message.reply('Server Sedang Offline!');
        }
      }
    },
  },
  {
    name: 'waifu',
    aliases: ['neko'],
    description: 'Random anime waifu/neko',
    category: 'Fun',
    limit: 1,
    handler: async ({ socket, message, text, isNsfw }) => {
      try {
        if (!isNsfw && text === 'nsfw') return message.reply('Filter Nsfw Sedang Aktif!');
        const res = await (await import('node-fetch')).default('https://api.waifu.pics/' + (text === 'nsfw' ? 'nsfw' : 'sfw') + '/' + message.command);
        const data = await res.json();
        await socket.sendFileUrl(message.chat, data.url, 'Random Waifu', message);
        const { setLimit } = await import('../../../lib/game.js');
        setLimit(message, (global as any).db);
      } catch {
        message.reply('Server sedang offline!');
      }
    },
  },
  {
    name: 'dadu',
    description: 'Random dice sticker',
    category: 'Fun',
    handler: async ({ socket, message, db }) => {
      const ddsa = [
        { url: 'https://telegra.ph/file/9f60e4cdbeb79fc6aff7a.png', no: 1 },
        { url: 'https://telegra.ph/file/797f86e444755282374ef.png', no: 2 },
        { url: 'https://telegra.ph/file/970d2a7656ada7c579b69.png', no: 3 },
        { url: 'https://telegra.ph/file/0470d295e00ebe789fb4d.png', no: 4 },
        { url: 'https://telegra.ph/file/a9d7332e7ba1d1d26a2be.png', no: 5 },
        { url: 'https://telegra.ph/file/99dcd999991a79f9ba0c0.png', no: 6 },
      ];
      const { pickRandom } = await import('../../../lib/function.js');
      const media = pickRandom(ddsa);
      try {
        await socket.sendAsSticker(message.chat, media.url, message, { packname: db?.packname, author: db?.author, isAvatar: 1 });
      } catch {
        const fetch = (await import('node-fetch')).default;
        const anu = await fetch(media.url);
        const una = await anu.buffer();
        await socket.sendAsSticker(message.chat, una, message, { packname: db?.packname, author: db?.author, isAvatar: 1 });
      }
    },
  },
  {
    name: 'halah',
    aliases: ['hilih', 'huluh', 'heleh', 'holoh'],
    description: 'Replace vowels in text',
    category: 'Fun',
    handler: async ({ message, text }) => {
      if (!message.quoted && !text) return message.reply(`Kirim/reply text dengan caption ${message.prefix + message.command}`);
      const ter = message.command[1].toLowerCase();
      const tex = message.quoted ? (message.quoted.text || text) : text;
      message.reply(tex.replace(/[aiueo]/g, ter).replace(/[AIUEO]/g, ter.toUpperCase()));
    },
  },
  {
    name: 'bisakah',
    description: 'Random yes/no answer',
    category: 'Fun',
    handler: async ({ message, text }) => {
      if (!text) return message.reply(`Example : ${message.prefix + message.command} saya menang?`);
      const bisa = ['Bisa', 'Coba Saja', 'Pasti Bisa', 'Mungkin Saja', 'Tidak Bisa', 'Tidak Mungkin', 'Coba Ulangi', 'Ngimpi kah?', 'yakin bisa?'];
      const keh = bisa[Math.floor(Math.random() * bisa.length)];
      message.reply(`*Bisakah ${text}*\nJawab : ${keh}`);
    },
  },
  {
    name: 'apakah',
    description: 'Random yes/no answer',
    category: 'Fun',
    handler: async ({ message, text }) => {
      if (!text) return message.reply(`Example : ${message.prefix + message.command} saya bisa menang?`);
      const apa = ['Iya', 'Tidak', 'Bisa Jadi', 'Coba Ulangi', 'Mungkin Saja', 'Mungkin Tidak', 'Mungkin Iya', 'Ntahlah'];
      const kah = apa[Math.floor(Math.random() * apa.length)];
      message.reply(`*${message.command} ${text}*\nJawab : ${kah}`);
    },
  },
  {
    name: 'kapan',
    aliases: ['kapankah'],
    description: 'Random time answer',
    category: 'Fun',
    handler: async ({ message, text }) => {
      if (!text) return message.reply(`Example : ${message.prefix + message.command} saya menang?`);
      const kapan = ['Besok', 'Lusa', 'Nanti', '4 Hari Lagi', '5 Hari Lagi', '6 Hari Lagi', '1 Minggu Lagi', '2 Minggu Lagi', '3 Minggu Lagi', '1 Bulan Lagi', '2 Bulan Lagi', '3 Bulan Lagi', '4 Bulan Lagi', '5 Bulan Lagi', '6 Bulan Lagi', '1 Tahun Lagi', '2 Tahun Lagi', '3 Tahun Lagi', '4 Tahun Lagi', '5 Tahun Lagi', '6 Tahun Lagi', '1 Abad lagi', '3 Hari Lagi', 'Bulan Depan', 'Ntahlah', 'Tidak Akan Pernah'];
      const koh = kapan[Math.floor(Math.random() * kapan.length)];
      message.reply(`*${message.command} ${text}*\nJawab : ${koh}`);
    },
  },
  {
    name: 'siapa',
    aliases: ['siapakah'],
    description: 'Random person from group',
    category: 'Fun',
    groupOnly: true,
    handler: async ({ message, text }) => {
      if (!text) return message.reply(`Example : ${message.prefix + message.command} jawa?`);
      const siapa = message.metadata.participants.map(a => '@' + a.id.split('@')[0]);
      const siapaRandom = siapa[Math.floor(Math.random() * siapa.length)];
      message.reply(`*${message.command} ${text}*\nJawab : ${siapaRandom}`, { mentions: message.metadata.participants.map(a => a.id) });
    },
  },
  {
    name: 'rate',
    description: 'Random rate 1-100',
    category: 'Fun',
    handler: async ({ message, text }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} gw ganteng`);
      message.reply(`${message.command} ${text}\nJawab : ${Math.floor(Math.random() * 100)}%`);
    },
  },
  {
    name: 'ceksifat',
    description: 'Check personality traits',
    category: 'Fun',
    handler: async ({ message, text }) => {
      const sifat = ['Pemalu', 'Penyayang', 'Pemarah', 'Pemaaf', 'Penyabar', 'Penyontek', 'Penolong', 'Pengangguran', 'Sombong', 'Rendah Hati', 'Dermawan', 'Kikir', 'Tekun', 'Malas', 'Rajin'];
      const hasil = sifat.map(s => `${s}: ${Math.floor(Math.random() * 100)}%`).join('\n');
      message.reply(`*Cek Sifat ${text || message.sender.split('@')[0]}*\n\n${hasil}`);
    },
  },
  {
    name: 'cekkhodam',
    description: 'Check your khodam',
    category: 'Fun',
    handler: async ({ message, text }) => {
      const khodam = ['Kyai Suparman', 'Nyai Roro Kidul', 'Jin Ifrit', 'Siluman Ular', 'Malaikat Maut', 'Pocong', 'Kuntilanak', 'Genderuwo', 'Tuyul', 'Wewe Gombel', 'Siluman Harimau', 'Raksasa Hutan'];
      const target = text || message.sender.split('@')[0];
      message.reply(`*Khodam ${target}*\n\nKhodam kamu adalah: *${khodam[Math.floor(Math.random() * khodam.length)]}*`);
    },
  },
  {
    name: 'ceksakti',
    aliases: ['cekmati'],
    description: 'Check death prediction (fun)',
    category: 'Fun',
    handler: async ({ message }) => {
      const dead = ['Besok', 'Lusa', 'Minggu Depan', 'Bulan Depan', 'Tahun Depan', '10 Tahun Lagi', '50 Tahun Lagi', '100 Tahun Lagi', 'Tidak Akan Mati', 'Abadi'];
      message.reply(`*Prediksi Mati*\n\nKamu akan mati: *${dead[Math.floor(Math.random() * dead.length)]}*`);
    },
  },
  {
    name: 'jodohku',
    description: 'Random match from group',
    category: 'Fun',
    groupOnly: true,
    handler: async ({ message }) => {
      const jmlhJodoh = message.metadata.participants.map(a => '@' + a.id.split('@')[0]);
      const jodoh = jmlhJodoh[Math.floor(Math.random() * jmlhJodoh.length)];
      message.reply(`*Jodoh Kamu*\n\n@${message.sender.split('@')[0]} ❤️ ${jodoh}`, { mentions: [message.sender, ...message.metadata.participants.map(a => a.id)] });
    },
  },
  {
    name: 'kerangajaib',
    aliases: ['kerang', 'tanyakerang'],
    description: 'Magic kerang answer',
    category: 'Fun',
    handler: async ({ message, text }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} apakah saya ganteng?`);
      const jawab = ['Mungkin iya', 'Mungkin tidak', 'Mungkin banget', 'Tidak', 'Iya', 'Coba tanya lagi', 'Tidak tahu', 'Sepertinya iya', 'Sepertinya tidak', 'Hmmm susah dijawab'];
      message.reply(`*Pertanyaan: ${text}*\n*Jawaban: ${jawab[Math.floor(Math.random() * jawab.length)]}*`);
    },
  },
  {
    name: 'kartu',
    description: 'Random card',
    category: 'Fun',
    handler: async ({ message }) => {
      const kartu = ['❤️', '♦️', '♣️', '♠️'];
      const angka = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      const k = kartu[Math.floor(Math.random() * kartu.length)];
      const a = angka[Math.floor(Math.random() * angka.length)];
      message.reply(`Kartu kamu: ${a}${k}`);
    },
  },
  {
    name: 'coba',
    description: 'Try your luck',
    category: 'Fun',
    handler: async ({ message }) => {
      const luck = Math.random();
      if (luck > 0.7) message.reply('🎉 Kamu Berhasil!');
      else if (luck > 0.4) message.reply('😐 Hampir berhasil!');
      else message.reply('😢 Kamu gagal!');
    },
  },
  {
    name: 'nilai',
    description: 'Random grade',
    category: 'Fun',
    handler: async ({ message, text }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} nilai rapotku`);
      message.reply(`*Nilai ${text}*\n\nKamu mendapat nilai: ${Math.floor(Math.random() * 101)}/100`);
    },
  },
  {
    name: 'minum',
    description: 'Drink animation',
    category: 'Fun',
    handler: async ({ message }) => {
      message.reply(`🥤 *${message.sender.split('@')[0]} sedang minum*`);
    },
  },
];
