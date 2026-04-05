// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';

export const commands: PluginCommand[] = [
  {
    name: 'tictactoe',
    aliases: ['ttt', 'ttc'],
    description: 'Play Tic Tac Toe',
    category: 'Game',
    groupOnly: true,
    handler: async ({ socket, message, text, db }) => {
      const tictactoe = db.game.tictactoe || {};
      db.game.tictactoe = tictactoe;
      const { TicTacToe } = await import('../../../lib/tictactoe.cjs');
      const { sleep } = await import('../../../lib/function.cjs');

      if (Object.values(tictactoe).find(room => room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(message.sender))) {
        return message.reply(`Kamu masih didalam game!\nKetik *${message.prefix}delttt* Jika Ingin Mengakhiri sesi`);
      }

      let room = Object.values(tictactoe).find(room => room.state === 'WAITING' && (text ? room.name === text : true));
      if (room) {
        message.reply('Partner ditemukan!');
        room.o = message.chat;
        room.game.playerO = message.sender;
        room.state = 'PLAYING';
        if (!(room.game instanceof TicTacToe)) {
          room.game = Object.assign(new TicTacToe(room.game.playerX, room.game.playerO), room.game);
        }
        const arr = room.game.render().map(v => {
          return {X: '❌', O: '⭕', 1: '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣', 6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣'}[v];
        });
        const str = `Room ID: ${room.id}\n\n${arr.slice(0, 3).join('')}\n${arr.slice(3, 6).join('')}\n${arr.slice(6).join('')}\n\nMenunggu @${room.game.currentTurn.split('@')[0]}\n\nKetik *nyerah* untuk menyerah dan mengakui kekalahan`;
        if (room.x !== room.o) await socket.sendMessage(room.x, { text: str, mentions: [room.game.currentTurn] }, { quoted: message });
        await socket.sendMessage(room.o, { text: str, mentions: [room.game.currentTurn] }, { quoted: message });
      } else {
        room = {
          id: 'tictactoe-' + (+new Date),
          x: message.chat,
          o: '',
          game: new TicTacToe(message.sender, 'o'),
          state: 'WAITING',
        };
        if (text) room.name = text;
        socket.sendMessage(message.chat, { text: 'Menunggu partner' + (text ? ` mengetik command dibawah ini ${message.prefix}${message.command} ${text}` : '') }, { quoted: message });
        tictactoe[room.id] = room;
        await sleep(300000);
        if (tictactoe[room.id]) {
          message.reply(`_Waktu ${message.command} habis_`);
          delete tictactoe[room.id];
        }
      }
    },
  },
  {
    name: 'delttt',
    aliases: ['delttc', 'deltictactoe'],
    description: 'Delete tictactoe session',
    category: 'Game',
    handler: async ({ message, db }) => {
      const tictactoe = db.game.tictactoe || {};
      const room = Object.values(tictactoe).find(room => room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(message.sender));
      if (!room) return message.reply('Kamu sedang tidak berada di room tictactoe!');
      delete tictactoe[room.id];
      message.reply('Berhasil delete session room tictactoe!');
    },
  },
  {
    name: 'chess',
    aliases: ['catur', 'ct'],
    description: 'Play Chess',
    category: 'Game',
    groupOnly: true,
    handler: async ({ socket, message, text, db }) => {
      const chess = db.game.chess || {};
      db.game.chess = chess;
      const { Chess } = await import('chess.js');

      if (chess[message.chat]) return message.reply('Masih ada sesi catur yang belum selesai!');
      const game = new Chess();
      chess[message.chat] = { game, white: message.sender, black: null, turn: 'w' };
      message.reply(`*Permainan Catur Dimulai!*\n\nKamu bermain sebagai ♟️ Putih\nLawan mengetik *${message.prefix}chess* untuk bergabung\n\nKetik *${message.prefix}chess <move>* untuk bermain\nContoh: ${message.prefix}chess e4`);
    },
  },
  {
    name: 'suit',
    aliases: ['suitpvp'],
    description: 'Play Suit (Batu Gunting Kertas)',
    category: 'Game',
    groupOnly: true,
    handler: async ({ socket, message, text, db }) => {
      const suit = db.game.suit || {};
      db.game.suit = suit;
      const { sleep } = await import('../../../lib/function.cjs');

      if (suit[message.chat]) return message.reply('Masih ada sesi suit yang belum selesai!');
      if (!text) return message.reply(`Pilih: batu / gunting / kertas\nExample: ${message.prefix}suit batu`);

      const pilihan = ['batu', 'gunting', 'kertas'];
      const playerChoice = text.toLowerCase();
      if (!pilihan.includes(playerChoice)) return message.reply('Pilihan tidak valid! Pilih: batu / gunting / kertas');

      const botChoice = pilihan[Math.floor(Math.random() * pilihan.length)];
      let result;
      if (playerChoice === botChoice) {
        result = 'Seri!';
      } else if (
        (playerChoice === 'batu' && botChoice === 'gunting') ||
        (playerChoice === 'gunting' && botChoice === 'kertas') ||
        (playerChoice === 'kertas' && botChoice === 'batu')
      ) {
        result = 'Kamu Menang! 🎉';
      } else {
        result = 'Kamu Kalah! 😢';
      }

      message.reply(`*Suit*\n\nKamu: ${playerChoice}\nBot: ${botChoice}\n\n${result}`);
    },
  },
  {
    name: 'delsuit',
    aliases: ['deletesuit'],
    description: 'Delete suit session',
    category: 'Game',
    handler: async ({ message, db }) => {
      const suit = db.game.suit || {};
      if (suit[message.chat]) {
        delete suit[message.chat];
        message.reply('Sesi suit dihapus!');
      } else message.reply('Tidak ada sesi suit aktif!');
    },
  },
  {
    name: 'tebakbom',
    description: 'Guess the bomb game',
    category: 'Game',
    handler: async ({ socket, message, text, db }) => {
      const tebakbom = db.game.tebakbom || {};
      db.game.tebakbom = tebakbom;
      const { sleep } = await import('../../../lib/function.cjs');

      if (tebakbom[message.sender]) return message.reply('Masih Ada Sesi Yang Belum Diselesaikan!');

      if (text && /^\d$/.test(text) && tebakbom[message.sender]) {
        const num = parseInt(text) - 1;
        const game = tebakbom[message.sender];
        if (game.petak[num] === 2) {
          game.nyawa.pop();
          game.board[num] = '💣';
          if (game.nyawa.length === 0) {
            message.reply(`*GAME OVER*\n\n${game.board.join('')}\n\nKamu terkena bom!`);
            delete tebakbom[message.sender];
          } else {
            message.reply(`*TEBAK BOM*\n\n${game.board.join('')}\n\n💥 BOOM! Nyawa tersisa: ${game.nyawa.join('')}`);
          }
        } else {
          game.pick++;
          game.board[num] = '✅';
          if (game.pick >= game.lolos) {
            message.reply(`*KAMU MENANG!*\n\n${game.board.join('')}\n\nSelamat! Kamu berhasil menghindari semua bom!`);
            delete tebakbom[message.sender];
          } else {
            message.reply(`*TEBAK BOM*\n\n${game.board.join('')}\n\nAman! Lanjut pilih nomor lainnya!\nBomb: ${game.bomb}\nNyawa: ${game.nyawa.join('')}`);
          }
        }
        return;
      }

      tebakbom[message.sender] = {
        petak: [0, 0, 0, 2, 0, 2, 0, 2, 0, 0].sort(() => Math.random() - 0.5),
        board: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'],
        bomb: 3,
        lolos: 7,
        pick: 0,
        nyawa: ['❤️', '❤️', '❤️'],
      };

      await message.reply(`*TEBAK BOM*\n\n${tebakbom[message.sender].board.join('')}\n\nPilih lah nomor tersebut! dan jangan sampai terkena Bom!\nBomb: ${tebakbom[message.sender].bomb}\nNyawa: ${tebakbom[message.sender].nyawa.join('')}\n\nKetik *${message.prefix + message.command} <angka 1-10>*`);
      await sleep(120000);
      if (tebakbom[message.sender]) {
        message.reply(`_Waktu ${message.command} habis_`);
        delete tebakbom[message.sender];
      }
    },
  },
  {
    name: 'ulartangga',
    aliases: ['snakeladder', 'ut'],
    description: 'Play Snake and Ladder',
    category: 'Game',
    groupOnly: true,
    handler: async ({ socket, message, text, db }) => {
      const ulartangga = db.game.ulartangga || {};
      db.game.ulartangga = ulartangga;

      if (!ulartangga[message.chat]) {
        ulartangga[message.chat] = { players: {}, turn: message.sender };
      }
      const game = ulartangga[message.chat];
      if (!game.players[message.sender]) {
        game.players[message.sender] = { pos: 1, name: message.sender.split('@')[0] };
        message.reply(`*Ular Tangga*\n\n@${message.sender.split('@')[0]} bergabung! Posisi: 1\nKetik *${message.prefix + message.command}* untuk lempar dadu`);
        return;
      }

      const dadu = Math.floor(Math.random() * 6) + 1;
      const player = game.players[message.sender];
      player.pos += dadu;
      if (player.pos > 100) player.pos = 100 - (player.pos - 100);

      const tangga = { 3: 22, 5: 8, 11: 26, 20: 29, 28: 84, 50: 67, 71: 91, 80: 99 };
      const ular = { 97: 78, 93: 73, 65: 42, 37: 17, 27: 5, 13: 2 };

      let msg = `🎲 Dadu: ${dadu}\n@${message.sender.split('@')[0]} pindah ke posisi ${player.pos}`;

      if (tangga[player.pos]) {
        player.pos = tangga[player.pos];
        msg += `\n🪜 Naik tangga ke ${player.pos}!`;
      } else if (ular[player.pos]) {
        player.pos = ular[player.pos];
        msg += `\n🐍 Turun ular ke ${player.pos}!`;
      }

      if (player.pos === 100) {
        msg += `\n\n🏆 @${message.sender.split('@')[0]} MENANG!`;
        delete ulartangga[message.chat];
      }

      message.reply(`*Ular Tangga*\n\n${msg}`);
    },
  },
  {
    name: 'blackjack',
    aliases: ['bj'],
    description: 'Play Blackjack',
    category: 'Game',
    handler: async ({ socket, message, text, db }) => {
      const blackjack = db.game.blackjack || {};
      db.game.blackjack = blackjack;

      if (!text || isNaN(Number(text))) return message.reply(`Example: ${message.prefix + message.command} <taruhan>\nMinimal taruhan: 100`);
      const taruhan = parseInt(text);
      if (taruhan < 100) return message.reply('Minimal taruhan: 100');
      if (db.users[message.sender].money < taruhan) return message.reply('Uang kamu tidak cukup!');

      const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      const drawCard = () => cards[Math.floor(Math.random() * cards.length)];
      const calcScore = (hand) => {
        let score = 0, aces = 0;
        for (const card of hand) {
          if (card === 'A') { score += 11; aces++; }
          else if (['J', 'Q', 'K'].includes(card)) score += 10;
          else score += parseInt(card);
        }
        while (score > 21 && aces > 0) { score -= 10; aces--; }
        return score;
      };

      const playerHand = [drawCard(), drawCard()];
      const dealerHand = [drawCard(), drawCard()];
      const playerScore = calcScore(playerHand);

      if (playerScore === 21) {
        db.users[message.sender].money += taruhan;
        return message.reply(`*Blackjack!*\n\nKamu: ${playerHand.join(', ')} = 21 🎉\nBot: ${dealerHand.join(', ')}\n\nKamu menang +${taruhan}!`);
      }

      blackjack[message.sender] = { playerHand, dealerHand, taruhan, playerScore };
      message.reply(`*Blackjack*\n\nKamu: ${playerHand.join(', ')} = ${playerScore}\nBot: ${dealerHand[0]}, ?\n\nKetik *${message.prefix}hit* atau *${message.prefix}stand*`);
    },
  },
  {
    name: 'hit',
    description: 'Blackjack - Draw another card',
    category: 'Game',
    handler: async ({ socket, message, db }) => {
      const blackjack = db.game.blackjack || {};
      const game = blackjack[message.sender];
      if (!game) return message.reply('Tidak ada sesi blackjack aktif!');

      const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      const drawCard = () => cards[Math.floor(Math.random() * cards.length)];
      const calcScore = (hand) => {
        let score = 0, aces = 0;
        for (const card of hand) {
          if (card === 'A') { score += 11; aces++; }
          else if (['J', 'Q', 'K'].includes(card)) score += 10;
          else score += parseInt(card);
        }
        while (score > 21 && aces > 0) { score -= 10; aces--; }
        return score;
      };

      game.playerHand.push(drawCard());
      game.playerScore = calcScore(game.playerHand);

      if (game.playerScore > 21) {
        db.users[message.sender].money -= game.taruhan;
        delete blackjack[message.sender];
        return message.reply(`*Blackjack - BUST!*\n\nKamu: ${game.playerHand.join(', ')} = ${game.playerScore}\nKamu kalah -${game.taruhan}!`);
      }

      message.reply(`*Blackjack*\n\nKamu: ${game.playerHand.join(', ')} = ${game.playerScore}\nBot: ${game.dealerHand[0]}, ?\n\nKetik *${message.prefix}hit* atau *${message.prefix}stand*`);
    },
  },
  {
    name: 'stand',
    description: 'Blackjack - Stand',
    category: 'Game',
    handler: async ({ socket, message, db }) => {
      const blackjack = db.game.blackjack || {};
      const game = blackjack[message.sender];
      if (!game) return message.reply('Tidak ada sesi blackjack aktif!');

      const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      const drawCard = () => cards[Math.floor(Math.random() * cards.length)];
      const calcScore = (hand) => {
        let score = 0, aces = 0;
        for (const card of hand) {
          if (card === 'A') { score += 11; aces++; }
          else if (['J', 'Q', 'K'].includes(card)) score += 10;
          else score += parseInt(card);
        }
        while (score > 21 && aces > 0) { score -= 10; aces--; }
        return score;
      };

      while (calcScore(game.dealerHand) < 17) {
        game.dealerHand.push(drawCard());
      }

      const playerScore = game.playerScore;
      const dealerScore = calcScore(game.dealerHand);
      delete blackjack[message.sender];

      let result;
      if (dealerScore > 21 || playerScore > dealerScore) {
        db.users[message.sender].money += game.taruhan;
        result = `Kamu Menang! +${game.taruhan} 🎉`;
      } else if (playerScore === dealerScore) {
        result = 'Seri!';
      } else {
        db.users[message.sender].money -= game.taruhan;
        result = `Kamu Kalah! -${game.taruhan}`;
      }

      message.reply(`*Blackjack*\n\nKamu: ${game.playerHand.join(', ')} = ${playerScore}\nBot: ${game.dealerHand.join(', ')} = ${dealerScore}\n\n${result}`);
    },
  },
  {
    name: 'casino',
    description: 'Play Casino',
    category: 'Game',
    handler: async ({ socket, message, args, db }) => {
      if (!args[0] || !args[1]) return message.reply(`Example: ${message.prefix + message.command} <taruhan> <merah/hitam/hijau>`);
      const taruhan = parseInt(args[0]);
      const pilihan = args[1].toLowerCase();
      if (!['merah', 'hitam', 'hijau'].includes(pilihan)) return message.reply('Pilihan: merah / hitam / hijau');
      if (taruhan < 100) return message.reply('Minimal taruhan: 100');
      if (db.users[message.sender].money < taruhan) return message.reply('Uang kamu tidak cukup!');

      const angka = Math.floor(Math.random() * 38);
      let warna;
      if (angka === 0 || angka === 37) warna = 'hijau';
      else if ([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(angka)) warna = 'merah';
      else warna = 'hitam';

      let multiplier = warna === 'hijau' ? 35 : 2;
      if (pilihan === warna) {
        db.users[message.sender].money += taruhan * multiplier;
        message.reply(`*Casino*\n\nAngka: ${angka} (${warna})\nKamu: ${pilihan}\n\nKamu Menang! +${taruhan * multiplier} 🎉`);
      } else {
        db.users[message.sender].money -= taruhan;
        message.reply(`*Casino*\n\nAngka: ${angka} (${warna})\nKamu: ${pilihan}\n\nKamu Kalah! -${taruhan}`);
      }
    },
  },
  {
    name: 'slot',
    description: 'Play Slot Machine',
    category: 'Game',
    handler: async ({ socket, message, args, db }) => {
      if (!args[0]) return message.reply(`Example: ${message.prefix + message.command} <taruhan>`);
      const taruhan = parseInt(args[0]);
      if (taruhan < 100) return message.reply('Minimal taruhan: 100');
      if (db.users[message.sender].money < taruhan) return message.reply('Uang kamu tidak cukup!');

      const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];
      const reel = () => symbols[Math.floor(Math.random() * symbols.length)];
      const r1 = reel(), r2 = reel(), r3 = reel();

      if (r1 === r2 && r2 === r3) {
        db.users[message.sender].money += taruhan * 10;
        message.reply(`*Slot Machine*\n\n${r1} ${r2} ${r3}\n\n🎉 JACKPOT! +${taruhan * 10}`);
      } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        db.users[message.sender].money += taruhan * 2;
        message.reply(`*Slot Machine*\n\n${r1} ${r2} ${r3}\n\nLumayan! +${taruhan * 2}`);
      } else {
        db.users[message.sender].money -= taruhan;
        message.reply(`*Slot Machine*\n\n${r1} ${r2} ${r3}\n\nCoba lagi! -${taruhan}`);
      }
    },
  },
  {
    name: 'samgong',
    aliases: ['kartu'],
    description: 'Play Samgong (Card Game)',
    category: 'Game',
    handler: async ({ socket, message, db }) => {
      const kartu = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      const draw = () => kartu[Math.floor(Math.random() * kartu.length)];
      const playerCards = [draw(), draw(), draw()];
      const botCards = [draw(), draw(), draw()];

      const calcScore = (cards) => cards.reduce((sum, c) => {
        if (c === 'A') return sum + 1;
        if (['J', 'Q', 'K'].includes(c)) return sum + 10;
        return sum + parseInt(c);
      }, 0) % 10;

      const playerScore = calcScore(playerCards);
      const botScore = calcScore(botCards);

      let result;
      if (playerScore > botScore) {
        result = 'Kamu Menang! 🎉';
        db.users[message.sender].money += 500;
      } else if (playerScore < botScore) {
        result = 'Kamu Kalah! 😢';
        db.users[message.sender].money -= 500;
      } else {
        result = 'Seri!';
      }

      message.reply(`*Samgong*\n\nKamu: ${playerCards.join(', ')} = ${playerScore}\nBot: ${botCards.join(', ')} = ${botScore}\n\n${result}`);
    },
  },
  {
    name: 'begal',
    description: 'Rob someone',
    category: 'Game',
    handler: async ({ socket, message, text, db }) => {
      if (!text) return message.reply(`Tag orang yang mau dirampok!\nExample: ${message.prefix + message.command} @tag`);
      const target = message.mentionedJid?.[0] || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      if (!db.users[target]) return message.reply('Target tidak terdaftar!');
      if (db.users[target].money < 1000) return message.reply('Target terlalu miskin!');

      const success = Math.random() > 0.5;
      if (success) {
        const stolen = Math.floor(db.users[target].money * 0.1);
        db.users[target].money -= stolen;
        db.users[message.sender].money += stolen;
        message.reply(`*Begal Berhasil!*\n\nKamu berhasil merampok @${target.split('@')[0]} sebesar ${stolen} 💰`);
      } else {
        db.users[message.sender].money -= 500;
        message.reply(`*Begal Gagal!*\n\nKamu tertangkap dan kehilangan 500 💸`);
      }
    },
  },
  {
    name: 'rampok',
    aliases: ['merampok'],
    description: 'Rob someone (alias)',
    category: 'Game',
    handler: async ({ socket, message, text, db }) => {
      const begalCmd = commands.find(c => c.name === 'begal');
      if (begalCmd) await begalCmd.handler({ socket, message, text, db });
    },
  },
  {
    name: 'jadian',
    description: 'Find your partner',
    category: 'Game',
    groupOnly: true,
    handler: async ({ socket, message, db }) => {
      const participants = message.metadata.participants.map(p => p.id).filter(id => id !== message.sender && db.users[id]?.money >= 0);
      if (participants.length === 0) return message.reply('Tidak ada partner yang tersedia!');
      const partner = participants[Math.floor(Math.random() * participants.length)];
      message.reply(`*Jadian*\n\n@${message.sender.split('@')[0]} ❤️ @${partner.split('@')[0]}\n\nSelamat kalian jadian! 💕`, { mentions: [message.sender, partner] });
    },
  },
];
