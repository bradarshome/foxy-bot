# 🦊 Foxy Bot

> Bot WhatsApp Modern dengan TypeScript — Modular, Ringan, dan Mudah Dikembangkan.

<div align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-blue?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Baileys-7.0.0--rc.9-green?style=for-the-badge" alt="Baileys">
  <img src="https://img.shields.io/badge/License-MIT-orange?style=for-the-badge" alt="License">
</div>

---

## 📖 Tentang

Foxy Bot adalah bot WhatsApp yang dibuat menggunakan **Baileys** dan **TypeScript**. Proyek ini merupakan pengembangan ulang (fork) dari [nazedev/hitori](https://github.com/nazedev/hitori) dengan arsitektur yang lebih modern dan modular.

Semua fitur/command telah dipisahkan ke dalam file **plugin** terpisah, sehingga mudah untuk menambah, menghapus, atau memodifikasi fitur tanpa mengacaukan kode utama.

---

## ✨ Fitur Utama

| Kategori | Jumlah Fitur | Keterangan |
|----------|:------------:|------------|
| 🤖 Bot | 25+ | Profile, runtime, status, jadibot, afk, rvo, inspect, dll |
| 👥 Group | 18+ | Add, kick, promote, demote, warn, link, tagall, settings, dll |
| 🛠️ Tools | 35+ | Sticker, converter (toaudio, toimage, togif, dll), HD, QR, translate, dll |
| 📥 Downloader | 8 | YouTube, Instagram, TikTok, Facebook, Spotify, Mediafire |
| 🔍 Search | 15+ | Google Image, Pinterest, Spotify Search, WA Stalk, GitHub Stalk, dll |
| 🧠 AI | 4 | Gemini, Grok, Claude, DeepSeek R1 |
| 🎮 Fun | 20+ | Quotes, random, dadu, halah, cek sifat, jodoh, dll |
| 📋 Menu | 15+ | Allmenu, category menu, total fitur, script, donasi |
| 👑 Owner | 30+ | Shutdown, update, ban, premium, settings, backup, dll |

> **Total: 160+ fitur** yang siap pakai!

---

## 📋 Persyaratan Sistem

- **Node.js** versi 20 atau lebih baru
- **Git**
- **FFmpeg** (untuk fitur converter audio/video/sticker)
- **RAM minimal 512MB** (rekomendasi 1GB+)

---

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/bradarshome/foxy-bot.git
cd foxy-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Konfigurasi

Buat file `settings.js` dengan menyalin dari template:

```bash
cp settings.example.js settings.js
```

> **Penting:** File `settings.js` tidak disertakan di repository karena berisi data sensitif (API key, nomor owner). Kamu harus membuatnya sendiri dari `settings.example.js`.

Edit file `settings.js` dan ubah bagian berikut:

```js
global.owner = ["628xxxxxxxxxx"]     // Nomor owner (bisa lebih dari 1)
global.number_bot = "628xxxxxxxxxx"  // Nomor bot untuk pairing
global.botname = "Foxy Bot"          // Nama bot
global.author = "Foxy Bot"           // Author sticker
global.packname = "Bot WhatsApp"     // Packname sticker
```

Untuk fitur berbasis API (AI, downloader, tools), dapatkan API key dari:
- **Naze API**: https://naze.biz.id/profile
- **Neosantara AI**: https://app.neosantara.xyz/api-keys

Lalu masukkan ke `settings.js`:

```js
global.APIKeys = {
  'https://api.naze.biz.id': 'nz-xxxxx',
  'https://api.neosantara.xyz/v1': 'nsk_xxxxx',
}
```

### 4. Jalankan Bot

**Mode Development** (auto-reload saat ada perubahan kode):
```bash
npm run dev
```

**Mode Production** (setelah build):
```bash
npm run build
npm start
```

Saat pertama kali dijalankan, bot akan meminta nomor WhatsApp untuk pairing. Masukkan nomor dengan format kode negara (contoh: `628xxxxxxxxxx`). Kode pairing akan ditampilkan di terminal.

---

## 📂 Struktur Proyek

```
foxy-bot/
├── src/
│   ├── core/              # Inti sistem bot
│   │   ├── config.ts          # Loader konfigurasi dari settings.js
│   │   ├── database-manager.ts # Manajemen database & settings
│   │   ├── plugin-system.ts   # Sistem plugin & command router
│   │   ├── serializer.ts      # Message serializer & event handler
│   │   └── server.ts          # Express server
│   ├── plugins/           # Semua fitur/command bot
│   │   ├── owner/             # Command khusus owner
│   │   ├── group/             # Command manajemen grup
│   │   ├── bot/               # Command umum bot
│   │   ├── tools/             # Tools & converter
│   │   ├── ai/                # AI chat
│   │   ├── search/            # Pencarian & stalk
│   │   ├── downloader/        # Download media
│   │   ├── fun/               # Fitur hiburan
│   │   └── menu/              # Menu & help
│   ├── database/          # Database layer
│   │   ├── repository.ts      # JSON & MongoDB repository
│   │   └── commands.ts        # Fungsi command & premium
│   ├── types/             # Definisi tipe TypeScript
│   └── utils/             # Fungsi utilitas (logger, helpers)
│   └── index.ts           # Entry point utama
├── lib/                 # Library helper (CommonJS)
│   ├── converter.js         # Konversi media
│   ├── exif.js              # EXIF handler
│   ├── function.js          # Fungsi umum
│   ├── game.js              # Sistem game & ekonomi
│   ├── scraper.js           # Web scraper
│   └── uploader.js          # Upload media
├── database/            # Data bot (auto-generated)
│   └── temp/                # File temporary
├── settings.js          # Konfigurasi utama (JANGAN di-commit!)
├── settings.example.js  # Template konfigurasi
├── package.json
└── tsconfig.json
```

---

## 🧩 Menambah Fitur Baru

Semua command bot berada di folder `src/plugins/`. Untuk menambah fitur baru:

### 1. Buat file plugin baru

Misalnya, buat file `src/plugins/tools/contoh.ts`:

```typescript
import type { PluginCommand } from '../../core/plugin-system.js';

export const commands: PluginCommand[] = [
  {
    name: 'contoh',
    aliases: ['example'],
    description: 'Contoh command baru',
    category: 'Tools',
    limit: 1,
    handler: async ({ message, text, db }) => {
      if (!text) return message.reply('Masukkan teksnya!');
      message.reply(`Kamu mengetik: ${text}`);
    },
  },
];
```

### 2. Daftarkan di index folder

Edit `src/plugins/tools/index.ts`:

```typescript
import { commands as contohCommands } from './contoh.js';

export const commands: PluginCommand[] = [
  ...toolsBasic,
  ...contohCommands,  // Tambahkan ini
];
```

### 3. Jalankan ulang bot

```bash
npm run dev
```

Command baru akan otomatis terdaftar dan muncul di menu!

---

## ⚙️ Konfigurasi

Semua pengaturan ada di **`settings.js`**. Setiap perubahan akan otomatis ter-load tanpa perlu restart bot.

| Setting | Tipe | Keterangan |
|---------|------|------------|
| `global.owner` | Array | Nomor owner (format: `628xxx`) |
| `global.botname` | String | Nama bot |
| `global.author` | String | Author sticker |
| `global.packname` | String | Packname sticker |
| `global.listprefix` | Array | Daftar prefix command |
| `global.pairing_code` | Boolean | Gunakan pairing code (true/false) |
| `global.number_bot` | String | Nomor bot untuk pairing |
| `global.limit` | Object | Limit per role (free/premium/vip) |
| `global.money` | Object | Uang per role |
| `global.APIs` | Object | URL API |
| `global.APIKeys` | Object | API Key |
| `global.badWords` | Array | Daftar kata toxic |
| `global.timezone` | String | Zona waktu (contoh: `Asia/Jakarta`) |

---

## 🗄️ Database

Foxy Bot mendukung dua jenis penyimpanan database:

### JSON File (Default)
Data disimpan di file `database/database.json`. Cocok untuk penggunaan personal.

### MongoDB
Untuk penggunaan skala besar atau multi-instance. Ubah `tempatDB` dan `tempatStore` di `settings.js` ke URL MongoDB:

```js
global.tempatDB = 'mongodb+srv://user:pass@cluster.mongodb.net/foxybot'
global.tempatStore = 'mongodb+srv://user:pass@cluster.mongodb.net/foxybot-store'
```

---

## 📝 Command Owner Penting

| Command | Fungsi |
|---------|--------|
| `.shutdown` / `.off` | Matikan bot |
| `.update` / `.upgrade` | Update bot |
| `.setbio <teks>` | Ubah bio/status bot |
| `.setppbot` (reply gambar) | Ubah foto profil bot |
| `.join <link>` | Join grup via link |
| `.leave` | Keluar dari grup saat ini |
| `.ban <nomor>` | Ban user |
| `.unban <nomor>` | Unban user |
| `.addprem <nomor\|waktu>` | Tambah premium |
| `.delprem <nomor>` | Hapus premium |
| `.addowner <nomor>` | Tambah owner |
| `.delowner <nomor>` | Hapus owner |
| `.backup all` | Backup semua data |
| `.backup database` | Backup database |
| `.delsession true` | Hapus file session |
| `.delsampah true` | Hapus file temporary |
| `.runtime set` | Cek semua pengaturan bot |
| `.runtime mode public` | Set mode bot ke public |

---

## 🔧 NPM Scripts

| Script | Fungsi |
|--------|--------|
| `npm run dev` | Development mode (auto-reload) |
| `npm run build` | Compile TypeScript ke JavaScript |
| `npm start` | Jalankan versi production |
| `npm run typecheck` | Cek error TypeScript tanpa build |

---

## 🐛 Troubleshooting

### Bot tidak bisa connect
- Pastikan nomor WhatsApp yang dimasukkan benar (format: `628xxx`)
- Hapus folder `foxy-session/` lalu jalankan ulang
- Pastikan koneksi internet stabil

### FFmpeg tidak ditemukan
Install FFmpeg:
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# Windows (via winget)
winget install Gyan.FFmpeg

# macOS (via brew)
brew install ffmpeg
```

### Fitur API tidak bekerja
- Pastikan API key sudah benar di `settings.js`
- Cek status API di https://naze.biz.id
- Pastikan kuota API masih tersedia

### Error saat build
```bash
rm -rf dist/
npm run build
```

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

## 🤝 Kontributor

| [![NazeDev](https://github.com/nazedev.png?size=100)](https://github.com/nazedev) | [![Zaynn](https://github.com/ZaynRcK.png?size=100)](https://github.com/ZaynRcK) |
|:---:|:---:|
| [NazeDev](https://github.com/nazedev) — Pembuat Hitori | [Zaynn](https://github.com/ZaynRcK) — Penyedia Layanan API |

---

## 💖 Support

Jika kamu merasa proyek ini bermanfaat, kamu bisa mendukung melalui:
- [Saweria](https://saweria.co/naze)

---

> **Catatan:** Proyek ini dibuat untuk tujuan pembelajaran. Gunakan dengan bijak dan bertanggung jawab.
