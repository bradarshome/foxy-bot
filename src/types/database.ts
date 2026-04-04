// User data stored in database
export interface UserData {
  vip: boolean;
  ban: boolean;
  afkTime: number;
  afkReason: string;
  register: boolean;
  limit: number;
  money: number;
  lastclaim: number;
  lastbegal: number;
  lastrampok: number;
}

// Group data stored in database
export interface GroupData {
  url: string;
  text: Record<string, string>;
  warn: Record<string, number>;
  tagsw: Record<string, number>;
  nsfw: boolean;
  mute: boolean;
  leave: boolean;
  setinfo: boolean;
  antilink: boolean;
  demote: boolean;
  antitoxic: boolean;
  promote: boolean;
  welcome: boolean;
  antivirtex: boolean;
  antitagsw: boolean;
  antidelete: boolean;
  antihidetag: boolean;
  waktusholat: boolean;
}

// Bot settings per instance
export interface BotSettings {
  lang: string;
  limit: number;
  money: number;
  status: number;
  log: boolean;
  join: boolean;
  public: boolean;
  anticall: boolean;
  original: boolean;
  readsw: boolean;
  autobio: boolean;
  autoread: boolean;
  antispam: boolean;
  autotyping: boolean;
  grouponly: boolean;
  multiprefix: boolean;
  privateonly: boolean;
  didyoumean: boolean;
  author: string;
  authorPrefix: string;
  autobackup: boolean;
  botname: string;
  packname: string;
  template: string;
  owner: string[];
}

// Game state
export interface GameState {
  suit: Record<string, any>;
  chess: Record<string, any>;
  chat_ai: Record<string, any[]>;
  menfes: Record<string, any>;
  tekateki: Record<string, any>;
  tictactoe: Record<string, any>;
  tebaklirik: Record<string, any>;
  kuismath: Record<string, any>;
  blackjack: Record<string, any>;
  tebaklagu: Record<string, any>;
  tebakkata: Record<string, any>;
  family100: Record<string, any>;
  susunkata: Record<string, any>;
  tebakbom: Record<string, any>;
  ulartangga: Record<string, any>;
  tebakkimia: Record<string, any>;
  caklontong: Record<string, any>;
  tebakangka: Record<string, any>;
  tebaknegara: Record<string, any>;
  tebakgambar: Record<string, any>;
  tebakbendera: Record<string, any>;
}

// Premium/Sewa entry
export interface PremiumEntry {
  id: string;
  expired: number;
  url?: string;
}

// Hit counter for commands
export interface HitData {
  totalcmd: number;
  todaycmd: number;
  [command: string]: number | string;
}

// Main database structure
export interface Database {
  hit: HitData;
  set: Record<string, BotSettings>;
  cmd: Record<string, { text: string }>;
  store: Record<string, any>;
  users: Record<string, UserData>;
  game: GameState;
  groups: Record<string, GroupData>;
  database: Record<string, any>;
  premium: PremiumEntry[];
  sewa: PremiumEntry[];
  cases?: string[];
}
