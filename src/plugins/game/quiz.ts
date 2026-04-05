// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';

export const commands: PluginCommand[] = [
  {
    name: 'tekateki',
    description: 'Teka-teki game',
    category: 'Game',
    handler: async ({ socket, message, text, db }) => {
      const tekateki = db.game.tekateki || {};
      db.game.tekateki = tekateki;
      const { sleep, rdGame, iGame } = await import('../../../lib/function.cjs');

      if (iGame(tekateki, message.chat)) return message.reply('Masih Ada Sesi Yang Belum Diselesaikan!');
      if (text) {
        for (const key of Object.keys(tekateki)) {
          if (key.startsWith(message.chat) && tekateki[key].id) {
            const jawaban = text.toLowerCase();
            if (jawaban === tekateki[key].jawaban) {
              db.users[message.sender].money += 3499;
              message.reply(`*Benar!* 🎉 +3499\nJawaban: ${tekateki[key].jawaban}`);
              delete tekateki[key];
              return;
            }
          }
        }
        return message.reply('Jawaban salah!');
      }

      const { result: hasil } = await (global as any).fetchApi('/games/tekateki');
      const { key } = await message.reply(`🎮 Teka Teki Berikut:\n\n${hasil.soal}\n\nWaktu: 60s\nHadiah *+3499*`);
      tekateki[message.chat + key.id] = { jawaban: hasil.jawaban.toLowerCase(), id: key.id };
      await sleep(60000);
      if (rdGame(tekateki, message.chat, key.id)) {
        message.reply('Waktu Habis\nJawaban: ' + tekateki[message.chat + key.id].jawaban);
        delete tekateki[message.chat + key.id];
      }
    },
  },
  {
    name: 'tebaklirik',
    description: 'Tebak lirik lagu',
    category: 'Game',
    handler: async ({ socket, message, text, db }) => {
      const tebaklirik = db.game.tebaklirik || {};
      db.game.tebaklirik = tebaklirik;
      const { sleep, rdGame, iGame } = await import('../../../lib/function.cjs');

      if (iGame(tebaklirik, message.chat)) return message.reply('Masih Ada Sesi Yang Belum Diselesaikan!');
      if (text) {
        for (const key of Object.keys(tebaklirik)) {
          if (key.startsWith(message.chat) && tebaklirik[key].id) {
            if (text.toLowerCase() === tebaklirik[key].jawaban) {
              db.users[message.sender].money += 4299;
              message.reply(`*Benar!* 🎉 +4299\nJawaban: ${tebaklirik[key].jawaban}`);
              delete tebaklirik[key];
              return;
            }
          }
        }
        return message.reply('Jawaban salah!');
      }

      const { result: hasil } = await (global as any).fetchApi('/games/tebaklirik');
      const { key } = await message.reply(`🎮 Tebak Lirik Berikut:\n\n${hasil.soal}\n\nWaktu: 90s\nHadiah *+4299*`);
      tebaklirik[message.chat + key.id] = { jawaban: hasil.jawaban.toLowerCase(), id: key.id };
      await sleep(90000);
      if (rdGame(tebaklirik, message.chat, key.id)) {
        message.reply('Waktu Habis\nJawaban: ' + tebaklirik[message.chat + key.id].jawaban);
        delete tebaklirik[message.chat + key.id];
      }
    },
  },
  {
    name: 'tebakkata',
    description: 'Tebak kata',
    category: 'Game',
    handler: async ({ socket, message, text, db }) => {
      const tebakkata = db.game.tebakkata || {};
      db.game.tebakkata = tebakkata;
      const { sleep, rdGame, iGame } = await import('../../../lib/function.cjs');

      if (iGame(tebakkata, message.chat)) return message.reply('Masih Ada Sesi Yang Belum Diselesaikan!');
      if (text) {
        for (const key of Object.keys(tebakkata)) {
          if (key.startsWith(message.chat) && tebakkata[key].id) {
            if (text.toLowerCase() === tebakkata[key].jawaban) {
              db.users[message.sender].money += 3499;
              message.reply(`*Benar!* 🎉 +3499`);
              delete tebakkata[key];
              return;
            }
          }
        }
        return message.reply('Jawaban salah!');
      }

      const { result: hasil } = await (global as any).fetchApi('/games/tebakkata');
      const { key } = await message.reply(`🎮 Tebak Kata Berikut:\n\n${hasil.soal}\n\nWaktu: 60s\nHadiah *+3499*`);
      tebakkata[message.chat + key.id] = { jawaban: hasil.jawaban.toLowerCase(), id: key.id };
      await sleep(60000);
      if (rdGame(tebakkata, message.chat, key.id)) {
        message.reply('Waktu Habis\nJawaban: ' + tebakkata[message.chat + key.id].jawaban);
        delete tebakkata[message.chat + key.id];
      }
    },
  },
  {
    name: 'family100',
    description: 'Family 100 game',
    category: 'Game',
    groupOnly: true,
    handler: async ({ socket, message, text, db }) => {
      const family100 = db.game.family100 || {};
      db.game.family100 = family100;
      const { sleep } = await import('../../../lib/function.cjs');

      if (family100.hasOwnProperty(message.chat)) return message.reply('Masih Ada Sesi Yang Belum Diselesaikan!');
      if (text) {
        const game = family100[message.chat];
        const jawabanLower = text.toLowerCase();
        for (let i = 0; i < game.jawaban.length; i++) {
          if (game.jawaban[i].toLowerCase() === jawabanLower && !game.terjawab[i]) {
            game.terjawab[i] = true;
            db.users[message.sender].money += 500;
            const terjawabStr = game.jawaban.map((j, idx) => game.terjawab[idx] ? `✅ ${j}` : `❌`).join('\n');
            if (game.terjawab.every(Boolean)) {
              message.reply(`*SEMUA TERJAWAB!* 🎉\n\n${terjawabStr}`);
              delete family100[message.chat];
            } else {
              message.reply(`*Benar!* +500\n\n${terjawabStr}`);
            }
            return;
          }
        }
        return message.reply('Jawaban salah!');
      }

      const { result: hasil } = await (global as any).fetchApi('/games/family100');
      const { key } = await message.reply(`🎮 Family 100\n\n${hasil.soal}\n\nWaktu: 5m\nHadiah *+500 per jawaban*`);
      family100[message.chat] = { soal: hasil.soal, jawaban: hasil.jawaban, terjawab: Array.from(hasil.jawaban, () => false), id: key.id };
      await sleep(300000);
      if (family100.hasOwnProperty(message.chat)) {
        message.reply('Waktu Habis\nJawaban:\n- ' + family100[message.chat].jawaban.join('\n- '));
        delete family100[message.chat];
      }
    },
  },
  {
    name: 'susunkata',
    description: 'Susun kata',
    category: 'Game',
    handler: async ({ socket, message, text, db }) => {
      const susunkata = db.game.susunkata || {};
      db.game.susunkata = susunkata;
      const { sleep, rdGame, iGame } = await import('../../../lib/function.cjs');

      if (iGame(susunkata, message.chat)) return message.reply('Masih Ada Sesi Yang Belum Diselesaikan!');
      if (text) {
        for (const key of Object.keys(susunkata)) {
          if (key.startsWith(message.chat) && susunkata[key].id) {
            if (text.toLowerCase() === susunkata[key].jawaban) {
              db.users[message.sender].money += 2989;
              message.reply(`*Benar!* 🎉 +2989`);
              delete susunkata[key];
              return;
            }
          }
        }
        return message.reply('Jawaban salah!');
      }

      const { result: hasil } = await (global as any).fetchApi('/games/susunkata');
      const { key } = await message.reply(`🎮 Susun Kata Berikut:\n\n${hasil.soal}\nTipe: ${hasil.tipe}\n\nWaktu: 60s\nHadiah *+2989*`);
      susunkata[message.chat + key.id] = { jawaban: hasil.jawaban.toLowerCase(), id: key.id };
      await sleep(60000);
      if (rdGame(susunkata, message.chat, key.id)) {
        message.reply('Waktu Habis\nJawaban: ' + susunkata[message.chat + key.id].jawaban);
        delete susunkata[message.chat + key.id];
      }
    },
  },
  {
    name: 'tebakkimia',
    description: 'Tebak kimia',
    category: 'Game',
    handler: async ({ socket, message, text, db }) => {
      const tebakkimia = db.game.tebakkimia || {};
      db.game.tebakkimia = tebakkimia;
      const { sleep, rdGame, iGame } = await import('../../../lib/function.cjs');

      if (iGame(tebakkimia, message.chat)) return message.reply('Masih Ada Sesi Yang Belum Diselesaikan!');
      if (text) {
        for (const key of Object.keys(tebakkimia)) {
          if (key.startsWith(message.chat) && tebakkimia[key].id) {
            if (text.toLowerCase() === tebakkimia[key].jawaban) {
              db.users[message.sender].money += 3499;
              message.reply(`*Benar!* 🎉 +3499`);
              delete tebakkimia[key];
              return;
            }
          }
        }
        return message.reply('Jawaban salah!');
      }

      const { result: hasil } = await (global as any).fetchApi('/games/tebakkimia');
      const { key } = await message.reply(`🎮 Tebak Kimia Berikut:\n\n${hasil.unsur}\n\nWaktu: 60s\nHadiah *+3499*`);
      tebakkimia[message.chat + key.id] = { jawaban: hasil.lambang.toLowerCase(), id: key.id };
      await sleep(60000);
      if (rdGame(tebakkimia, message.chat, key.id)) {
        message.reply('Waktu Habis\nJawaban: ' + tebakkimia[message.chat + key.id].jawaban);
        delete tebakkimia[message.chat + key.id];
      }
    },
  },
  {
    name: 'caklontong',
    description: 'Cak lontong game',
    category: 'Game',
    handler: async ({ socket, message, text, db }) => {
      const caklontong = db.game.caklontong || {};
      db.game.caklontong = caklontong;
      const { sleep, rdGame, iGame } = await import('../../../lib/function.cjs');

      if (iGame(caklontong, message.chat)) return message.reply('Masih Ada Sesi Yang Belum Diselesaikan!');
      if (text) {
        for (const key of Object.keys(caklontong)) {
          if (key.startsWith(message.chat) && caklontong[key].id) {
            if (text.toLowerCase() === caklontong[key].jawaban) {
              db.users[message.sender].money += 9999;
              message.reply(`*Benar!* 🎉 +9999\n"${caklontong[key].deskripsi}"`);
              delete caklontong[key];
              return;
            }
          }
        }
        return message.reply('Jawaban salah!');
      }

      const { result: hasil } = await (global as any).fetchApi('/games/caklontong');
      const { key } = await message.reply(`🎮 Jawab Pertanyaan Berikut:\n\n${hasil.soal}\n\nWaktu: 60s\nHadiah *+9999*`);
      caklontong[message.chat + key.id] = { ...hasil, jawaban: hasil.jawaban.toLowerCase(), id: key.id };
      await sleep(60000);
      if (rdGame(caklontong, message.chat, key.id)) {
        message.reply(`Waktu Habis\nJawaban: ${caklontong[message.chat + key.id].jawaban}\n"${caklontong[message.chat + key.id].deskripsi}"`);
        delete caklontong[message.chat + key.id];
      }
    },
  },
  {
    name: 'tebaknegara',
    description: 'Tebak negara',
    category: 'Game',
    handler: async ({ socket, message, text, db }) => {
      const tebaknegara = db.game.tebaknegara || {};
      db.game.tebaknegara = tebaknegara;
      const { sleep, rdGame, iGame } = await import('../../../lib/function.cjs');

      if (iGame(tebaknegara, message.chat)) return message.reply('Masih Ada Sesi Yang Belum Diselesaikan!');
      if (text) {
        for (const key of Object.keys(tebaknegara)) {
          if (key.startsWith(message.chat) && tebaknegara[key].id) {
            if (text.toLowerCase() === tebaknegara[key].jawaban) {
              db.users[message.sender].money += 3499;
              message.reply(`*Benar!* 🎉 +3499`);
              delete tebaknegara[key];
              return;
            }
          }
        }
        return message.reply('Jawaban salah!');
      }

      const { result: hasil } = await (global as any).fetchApi('/games/tebaknegara');
      const { key } = await message.reply(`🎮 Tebak Negara Dari Tempat Berikut:\n\n*Tempat: ${hasil.tempat}*\n\nWaktu: 60s\nHadiah *+3499*`);
      tebaknegara[message.chat + key.id] = { jawaban: hasil.negara.toLowerCase(), id: key.id };
      await sleep(60000);
      if (rdGame(tebaknegara, message.chat, key.id)) {
        message.reply('Waktu Habis\nJawaban: ' + tebaknegara[message.chat + key.id].jawaban);
        delete tebaknegara[message.chat + key.id];
      }
    },
  },
  {
    name: 'tebakgambar',
    description: 'Tebak gambar',
    category: 'Game',
    handler: async ({ socket, message, text, db }) => {
      const tebakgambar = db.game.tebakgambar || {};
      db.game.tebakgambar = tebakgambar;
      const { sleep, rdGame, iGame } = await import('../../../lib/function.cjs');

      if (iGame(tebakgambar, message.chat)) return message.reply('Masih Ada Sesi Yang Belum Diselesaikan!');
      if (text) {
        for (const key of Object.keys(tebakgambar)) {
          if (key.startsWith(message.chat) && tebakgambar[key].id) {
            if (text.toLowerCase() === tebakgambar[key].jawaban) {
              db.users[message.sender].money += 3499;
              message.reply(`*Benar!* 🎉 +3499`);
              delete tebakgambar[key];
              return;
            }
          }
        }
        return message.reply('Jawaban salah!');
      }

      const { result: hasil } = await (global as any).fetchApi('/games/tebakgambar');
      const { key } = await socket.sendFileUrl(message.chat, hasil.img, `🎮 Tebak Gambar Berikut:\n\n${hasil.deskripsi}\n\nWaktu: 60s\nHadiah *+3499*`, message);
      tebakgambar[message.chat + key.id] = { jawaban: hasil.jawaban.toLowerCase(), id: key.id };
      await sleep(60000);
      if (rdGame(tebakgambar, message.chat, key.id)) {
        message.reply('Waktu Habis\nJawaban: ' + tebakgambar[message.chat + key.id].jawaban);
        delete tebakgambar[message.chat + key.id];
      }
    },
  },
  {
    name: 'tebakbendera',
    description: 'Tebak bendera',
    category: 'Game',
    handler: async ({ socket, message, text, db }) => {
      const tebakbendera = db.game.tebakbendera || {};
      db.game.tebakbendera = tebakbendera;
      const { sleep, rdGame, iGame } = await import('../../../lib/function.cjs');

      if (iGame(tebakbendera, message.chat)) return message.reply('Masih Ada Sesi Yang Belum Diselesaikan!');
      if (text) {
        for (const key of Object.keys(tebakbendera)) {
          if (key.startsWith(message.chat) && tebakbendera[key].id) {
            if (text.toLowerCase() === tebakbendera[key].jawaban) {
              db.users[message.sender].money += 3499;
              message.reply(`*Benar!* 🎉 +3499`);
              delete tebakbendera[key];
              return;
            }
          }
        }
        return message.reply('Jawaban salah!');
      }

      const { result: hasil } = await (global as any).fetchApi('/games/tebakbendera');
      const { key } = await message.reply(`🎮 Tebak Bendera:\n\n🏳️ ${hasil.bendera}\n\nWaktu: 60s\nHadiah *+3499*`);
      tebakbendera[message.chat + key.id] = { jawaban: hasil.negara.toLowerCase(), id: key.id };
      await sleep(60000);
      if (rdGame(tebakbendera, message.chat, key.id)) {
        message.reply('Waktu Habis\nJawaban: ' + tebakbendera[message.chat + key.id].jawaban);
        delete tebakbendera[message.chat + key.id];
      }
    },
  },
  {
    name: 'tebakangka',
    aliases: ['butawarna', 'colorblind'],
    description: 'Tebak angka',
    category: 'Game',
    handler: async ({ socket, message, text, db }) => {
      const tebakangka = db.game.tebakangka || {};
      db.game.tebakangka = tebakangka;

      if (text) {
        const game = tebakangka[message.sender];
        if (!game) return message.reply('Tidak ada sesi tebak angka!');
        const guess = parseInt(text);
        if (isNaN(guess)) return message.reply('Masukkan angka!');
        if (guess === game.angka) {
          db.users[message.sender].money += game.taruhan;
          message.reply(`*Benar!* 🎉 Angkanya ${game.angka}\n+${game.taruhan}`);
          delete tebakangka[message.sender];
        } else if (guess < game.angka) {
          game.tebakan++;
          message.reply(`Terlalu kecil! (Percobaan: ${game.tebakan}/${game.maxTebak})`);
        } else {
          game.tebakan++;
          message.reply(`Terlalu besar! (Percobaan: ${game.tebakan}/${game.maxTebak})`);
        }
        if (game.tebakan >= game.maxTebak) {
          db.users[message.sender].money -= game.taruhan;
          message.reply(`*Game Over!* Angkanya ${game.angka}\n-${game.taruhan}`);
          delete tebakangka[message.sender];
        }
        return;
      }

      const taruhan = 500;
      if (db.users[message.sender].money < taruhan) return message.reply('Uang tidak cukup!');
      tebakangka[message.sender] = { angka: Math.floor(Math.random() * 100) + 1, taruhan, tebakan: 0, maxTebak: 7 };
      message.reply(`*Tebak Angka*\n\nAku memikirkan angka 1-100\nKamu punya 7 kesempatan\nTaruhan: ${taruhan}\n\nKetik angka tebakanmu!`);
    },
  },
  {
    name: 'kuismath',
    aliases: ['math'],
    description: 'Math quiz',
    category: 'Game',
    handler: async ({ socket, message, text, db }) => {
      const kuismath = db.game.kuismath || {};
      db.game.kuismath = kuismath;
      const { sleep, rdGame, iGame } = await import('../../../lib/function.cjs');

      if (iGame(kuismath, message.chat)) return message.reply('Masih Ada Sesi Yang Belum Diselesaikan!');
      if (text) {
        for (const key of Object.keys(kuismath)) {
          if (key.startsWith(message.chat) && kuismath[key].id) {
            if (parseInt(text) === kuismath[key].jawaban) {
              db.users[message.sender].money += 500;
              message.reply(`*Benar!* 🎉 +500`);
              delete kuismath[key];
              return;
            }
          }
        }
        return message.reply('Jawaban salah!');
      }

      const a = Math.floor(Math.random() * 100) + 1;
      const b = Math.floor(Math.random() * 100) + 1;
      const ops = ['+', '-', '×'];
      const op = ops[Math.floor(Math.random() * ops.length)];
      let jawaban;
      if (op === '+') jawaban = a + b;
      else if (op === '-') jawaban = a - b;
      else jawaban = a * b;

      const { key } = await message.reply(`🎮 Math Quiz:\n\n${a} ${op} ${b} = ?\n\nWaktu: 30s\nHadiah *+500*`);
      kuismath[message.chat + key.id] = { jawaban, id: key.id };
      await sleep(30000);
      if (rdGame(kuismath, message.chat, key.id)) {
        message.reply('Waktu Habis\nJawaban: ' + kuismath[message.chat + key.id].jawaban);
        delete kuismath[message.chat + key.id];
      }
    },
  },
];
