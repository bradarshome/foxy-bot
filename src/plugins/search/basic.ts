// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';

export const commands: PluginCommand[] = [
  {
    name: 'gimage',
    aliases: ['bingimg'],
    description: 'Search Google Images',
    category: 'Search',
    limit: 1,
    handler: async ({ message, text, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} query`);
      try {
        const anu = await (global as any).fetchApi('/search/google', { query: text });
        const { pickRandom } = await import('../../lib/function.js');
        const una = pickRandom(anu.result);
        await message.reply({ image: { url: una.pagemap?.cse_thumbnail?.[0]?.src || una.pagemap?.cse_image?.[0].src || una.pagemap?.metatags?.[0]?.['og:image'] }, caption: 'Hasil Pencarian ' + text + '\nTitle: ' + una.title + '\nSnippet: ' + una.snippet + '\nSource: ' + una.link || una.formattedUrl });
        const { setLimit } = await import('../../lib/game.js');
        setLimit(message, db);
      } catch {
        message.reply('Pencarian Tidak Ditemukan!');
      }
    },
  },
  {
    name: 'play',
    aliases: ['ytplay', 'yts', 'ytsearch', 'youtubesearch'],
    description: 'Search YouTube',
    category: 'Search',
    handler: async ({ message, text, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} dj komang`);
      message.react('⏳');
      try {
        const yts = (await import('yt-search')).default;
        const res = await yts.search(text);
        const { pickRandom } = await import('../../lib/function.js');
        const hasil = pickRandom(res.all);
        const teksnya = `*📍Title:* ${hasil.title || 'Tidak tersedia'}\n*✏Description:* ${hasil.description || 'Tidak tersedia'}\n*🌟Channel:* ${hasil.author?.name || 'Tidak tersedia'}\n*⏳Duration:* ${hasil.seconds || 'Tidak tersedia'} second (${hasil.timestamp || 'Tidak tersedia'})\n*🔎Source:* ${hasil.url || 'Tidak tersedia'}\n\n_note : jika ingin mendownload silahkan_\n_pilih ${message.prefix}ytmp3 url_video atau ${message.prefix}ytmp4 url_video_`;
        await message.reply({ image: { url: hasil.thumbnail }, caption: teksnya });
      } catch {
        try {
          const res = await (global as any).fetchApi('/search/youtube', { query: text });
          const { pickRandom } = await import('../../lib/function.js');
          const hasil = pickRandom(res.result.items);
          const teksnya = `*📍Title:* ${hasil.snippet.title || 'Tidak tersedia'}\n*✏Description:* ${hasil.snippet.description || 'Tidak tersedia'}\n*🌟Channel:* ${hasil.snippet.channelTitle || 'Tidak tersedia'}\n*⏳Duration:* ${hasil.duration || 'Tidak tersedia'}\n*🔎Source:* https://youtu.be/${hasil.id.videoId || 'Tidak tersedia'}`;
          await message.reply({ image: { url: hasil.snippet.thumbnails.medium.url }, caption: teksnya });
        } catch {
          message.reply('Post not available!');
        }
      }
    },
  },
  {
    name: 'pixiv',
    description: 'Search Pixiv illustrations',
    category: 'Search',
    limit: 1,
    handler: async ({ message, text, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} hu tao`);
      try {
        message.react('⏳');
        const res = await (global as any).fetchApi('/search/pixiv', { query: text });
        const { pickRandom } = await import('../../lib/function.js');
        const hasil = pickRandom(res.result.body.illusts);
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(hasil.url, { headers: { 'referer': 'https://www.pixiv.net' } });
        const image = await response.buffer();
        message.reply({ image, caption: `Title: ${hasil.title}\nDescription: ${hasil.alt}\nTags:\n${hasil.tags.map((a: string) => '- ' + a).join('\n')}` });
        const { setLimit } = await import('../../lib/game.js');
        setLimit(message, db);
      } catch {
        message.reply('Post not available!');
      }
    },
  },
  {
    name: 'pinterest',
    aliases: ['pint'],
    description: 'Search Pinterest images',
    category: 'Search',
    limit: 1,
    handler: async ({ message, text, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} hu tao`);
      try {
        const res = await (global as any).fetchApi('/search/pinterest', { query: text });
        const { pickRandom, getBuffer } = await import('../../lib/function.js');
        const hasil = pickRandom(res.result);
        const image = await getBuffer(hasil);
        await message.reply({ image, caption: 'Hasil dari: ' + text });
        const { setLimit } = await import('../../lib/game.js');
        setLimit(message, db);
      } catch {
        message.reply('Pencarian tidak ditemukan!');
      }
    },
  },
  {
    name: 'wallpaper',
    description: 'Search wallpapers',
    category: 'Search',
    limit: 1,
    handler: async ({ message, text, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} hu tao`);
      try {
        const anu = await (global as any).fetchApi('/search/pinterest', { query: text });
        if (anu.length < 1) return message.reply('Post not available!');
        const { pickRandom } = await import('../../lib/function.js');
        const result = pickRandom(anu.result);
        await message.reply({ image: { url: result.urls.original }, caption: `*Media Url :* ${result.pin}${result.description ? '\n*Description :* ' + result.description : ''}` });
        const { setLimit } = await import('../../lib/game.js');
        setLimit(message, db);
      } catch {
        message.reply('Server wallpaper sedang offline!');
      }
    },
  },
  {
    name: 'ringtone',
    description: 'Search ringtones',
    category: 'Search',
    limit: 1,
    handler: async ({ message, text, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} black rover`);
      try {
        const anu = await (global as any).fetchApi('/search/meloboom', { query: text });
        const { pickRandom } = await import('../../lib/function.js');
        const result = pickRandom(anu.result.data);
        await message.reply({ audio: { url: anu.result.populated.media[result.media.audio[0]].url }, fileName: result.slug + '.mp3', mimetype: 'audio/mpeg' });
        const { setLimit } = await import('../../lib/game.js');
        setLimit(message, db);
      } catch {
        message.reply('Audio tidak ditemukan!');
      }
    },
  },
  {
    name: 'npm',
    aliases: ['npmjs'],
    description: 'Search NPM packages',
    category: 'Search',
    handler: async ({ message, text }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} axios`);
      try {
        const anu = await (global as any).fetchApi('/search/npm', { query: text });
        if (anu.result.objects.length > 1) return message.reply('Pencarian Tidak di temukan');
        const txt = anu.result.objects.map(({ package: pkg }: any) => {
          return `*${pkg.name}* (v${pkg.version})\n_${pkg.links.npm}_\n_${pkg.description}_`;
        }).join('\n\n');
        message.reply(txt);
      } catch {
        message.reply('Pencarian Tidak di temukan');
      }
    },
  },
  {
    name: 'style',
    description: 'Text style generator',
    category: 'Search',
    handler: async ({ message, text }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} Naze`);
      const anu = await (global as any).fetchApi('/tools/styletext', { text });
      const txt = anu.result.map((a: any) => `*${a.name}*\n${a.result}`).join('\n\n');
      message.reply(txt);
    },
  },
  {
    name: 'spotify',
    aliases: ['spotifysearch'],
    description: 'Search Spotify',
    category: 'Search',
    handler: async ({ message, text }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} alan walker alone`);
      try {
        const hasil = await (global as any).fetchApi('/search/spotify', { query: text });
        const txt = hasil.result.map((a: any) => {
          return `*Title : ${a.title}*\n- Artist : ${a.artist}\n- Url : ${a.url}`;
        }).join('\n\n');
        message.reply(txt);
      } catch {
        message.reply('Hasil Tidak Ditemukan!');
      }
    },
  },
  {
    name: 'tenor',
    description: 'Search Tenor GIFs',
    category: 'Search',
    handler: async ({ message, text }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} alone`);
      try {
        const anu = await (global as any).fetchApi('/search/tenor', { query: text });
        const { pickRandom } = await import('../../lib/function.js');
        const hasil = pickRandom(anu.result);
        await message.reply({ video: { url: hasil.media[0].mp4.url }, caption: `👀 *Media:* ${hasil.url}\n📋 *Description:* ${hasil.content_description}\n🔛 *Url:* ${hasil.itemurl}`, gifPlayback: true, gifAttribution: 2 });
      } catch {
        message.reply('Hasil Tidak Ditemukan!');
      }
    },
  },
  {
    name: 'urban',
    description: 'Search Urban Dictionary',
    category: 'Search',
    handler: async ({ message, text }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} alone`);
      try {
        const { fetchJson } = await import('../../lib/function.js');
        const anu = await fetchJson('https://api.urbandictionary.com/v0/define?term=' + text);
        const { pickRandom } = await import('../../lib/function.js');
        const hasil = pickRandom(anu.list);
        await message.reply(`${hasil.definition}\n\nSumber: ${hasil.permalink}`);
      } catch {
        message.reply('Hasil Tidak Ditemukan!');
      }
    },
  },
  {
    name: 'wastalk',
    aliases: ['whatsappstalk'],
    description: 'WhatsApp stalk user',
    category: 'Search',
    limit: 1,
    handler: async ({ socket, message, text, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} @tag / 628xxx`);
      try {
        const PhoneNum = (await import('awesome-phonenumber')).default;
        const moment = (await import('moment-timezone')).default;
        const locale = db?.locale || 'id';
        let num = message.quoted?.sender || message.mentionedJid?.[0] || text;
        if (!num) return message.reply(`Example : ${message.prefix + message.command} @tag / 628xxx`);
        num = num.replace(/\D/g, '') + '@s.whatsapp.net';
        if (!(await socket.onWhatsApp(num))[0]?.exists) return message.reply('Nomer tidak terdaftar di WhatsApp!');
        const img = await socket.profilePictureUrl(num, 'image').catch(() => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60');
        const bio = await socket.fetchStatus(num).catch(() => ({}));
        const name = await socket.getName(num);
        const business = await socket.getBusinessProfile(num);
        const format = PhoneNum('+' + num.split('@')[0]);
        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
        const country = regionNames.of(format.getRegionCode('international'));
        const wea = `WhatsApp Stalk\n\n*° Country :* ${country.toUpperCase()}\n*° Name :* ${name ? name : '-'}\n*° Format Number :* ${format.getNumber('international')}\n*° Url Api :* wa.me/${num.split('@')[0]}\n*° Mentions :* @${num.split('@')[0]}\n*° Status :* ${bio?.status || '-'}\n*° Date Status :* ${bio?.setAt ? moment(bio.setAt.toDateString()).locale(locale).format('LL') : '-'}\n\n${business ? `*WhatsApp Business Stalk*\n\n*° BusinessId :* ${business.wid}\n*° Website :* ${business.website ? business.website : '-'}\n*° Email :* ${business.email ? business.email : '-'}\n*° Category :* ${business.category}\n*° Address :* ${business.address ? business.address : '-'}\n*° Timeone :* ${business.business_hours.timezone ? business.business_hours.timezone : '-'}\n*° Description* : ${business.description ? business.description : '-'}` : '*Standard WhatsApp Account*'}`;
        if (img) await socket.sendMessage(message.chat, { image: { url: img }, caption: wea, mentions: [num] }, { quoted: message });
        else message.reply(wea);
        const { setLimit } = await import('../../lib/game.js');
        setLimit(message, db);
      } catch {
        message.reply('Nomer Tidak ditemukan!');
      }
    },
  },
  {
    name: 'ghstalk',
    aliases: ['githubstalk'],
    description: 'GitHub stalk user',
    category: 'Search',
    limit: 1,
    handler: async ({ message, text, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} usernamenya`);
      try {
        const { fetchJson } = await import('../../lib/function.js');
        const res = await fetchJson('https://api.github.com/users/' + text);
        message.reply({ image: { url: res.avatar_url }, caption: `*Username :* ${res.login}\n*Nickname :* ${res.name || 'Tidak ada'}\n*Bio :* ${res.bio || 'Tidak ada'}\n*ID :* ${res.id}\n*Node ID :* ${res.node_id}\n*Type :* ${res.type}\n*Admin :* ${res.admin ? 'Ya' : 'Tidak'}\n*Company :* ${res.company || 'Tidak ada'}\n*Blog :* ${res.blog || 'Tidak ada'}\n*Location :* ${res.location || 'Tidak ada'}\n*Email :* ${res.email || 'Tidak ada'}\n*Public Repo :* ${res.public_repos}\n*Public Gists :* ${res.public_gists}\n*Followers :* ${res.followers}\n*Following :* ${res.following}\n*Created At :* ${res.created_at} *Updated At :* ${res.updated_at}` });
        const { setLimit } = await import('../../lib/game.js');
        setLimit(message, db);
      } catch {
        message.reply('Username Tidak ditemukan!');
      }
    },
  },
];
