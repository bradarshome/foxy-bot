// Global configuration loaded from .env
export interface Config {
  owner: string[];
  author: string;
  botname: string;
  packname: string;
  timezone: string;
  locale: string;
  listprefix: string[];
  listv: string[];
  tempatDB: string;
  tempatStore: string;
  pairingCode: boolean;
  numberBot: string;
  limit: {
    free: number;
    premium: number;
    vip: number;
  };
  money: {
    free: number;
    premium: number;
    vip: number;
  };
  mess: Record<string, string>;
  apis: Record<string, string>;
  apiKeys: Record<string, string>;
  jadwalSholat: Record<string, string>;
  badWords: string[];
  chatLength: number;
  fake: {
    anonim: string;
    thumbnailUrl: string;
  };
  my: {
    yt: string;
    gh: string;
    gc: string;
    ch: string;
  };
}

// Default configuration values
export const DEFAULT_CONFIG: Config = {
  owner: ['6282113821188'],
  author: 'Foxy Bot',
  botname: 'Foxy Bot',
  packname: 'Bot WhatsApp',
  timezone: 'Asia/Jakarta',
  locale: 'id',
  listprefix: ['+', '!', '.'],
  listv: ['•', '●', '■', '✿', '▲', '➩', '➢', '➣', '➤', '✦', '✧', '△', '❀', '○', '□', '♤', '♡', '◇', '♧', '々', '〆'],
  tempatDB: 'database.json',
  tempatStore: 'baileys_store.json',
  pairingCode: true,
  numberBot: '',
  limit: {
    free: 20,
    premium: 999,
    vip: 900,
  },
  money: {
    free: 10000,
    premium: 1000000,
    vip: 10000000,
  },
  mess: {
    key: 'Apikey limit! Please upgrade.',
    owner: 'Owner only!',
    admin: 'Admin only!',
    botAdmin: 'Bot must be admin!',
    onWa: 'Number not registered on WhatsApp!',
    group: 'Group only!',
    private: 'Private chat only!',
    quoted: 'Reply to a message!',
    limit: 'Limit exhausted!',
    prem: 'Premium only!',
    text: 'Please provide text!',
    media: 'Please provide media!',
    wait: 'Processing...',
    fail: 'Failed!',
    error: 'Error occurred!',
    done: 'Done!',
  },
  apis: {
    foxy: 'https://api.naze.biz.id',
    neosantara: 'https://api.neosantara.xyz/v1',
  },
  apiKeys: {
    'https://api.naze.biz.id': 'YOUR_API_KEY',
    'https://api.neosantara.xyz/v1': 'API_KEY_NEOSANTARA_AI',
  },
  jadwalSholat: {
    Subuh: '04:30',
    Dzuhur: '12:06',
    Ashar: '15:21',
    Maghrib: '18:08',
    Isya: '19:00',
  },
  badWords: ['dongo', 'konsol'],
  chatLength: 1000,
  fake: {
    anonim: 'https://telegra.ph/file/95670d63378f7f4210f03.png',
    thumbnailUrl: 'https://telegra.ph/file/fe4843a1261fc414542c4.jpg',
  },
  my: {
    yt: 'https://youtube.com/c/Nazedev',
    gh: 'https://github.com/nazedev',
    gc: 'https://chat.whatsapp.com/DPUC3uuqYZI9FNLdgtMp4n?mode=gi_t',
    ch: '120363250409960161@newsletter',
  },
};
