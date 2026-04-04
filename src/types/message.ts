import type { WAMessage, WASocket } from 'baileys'

// Extended message object with additional properties
export interface FoxyMessage extends WAMessage {
  id: string;
  chat: string;
  fromMe: boolean;
  isBot: boolean;
  isGroup: boolean;
  sender: string;
  metadata?: any;
  admins?: any[];
  isAdmin: boolean;
  isBotAdmin: boolean;
  type: string;
  msg: any;
  body: string;
  mentionedJid: string[];
  text: string;
  prefix: string;
  command: string;
  args: string[];
  device: string;
  expiration: number;
  timestamp: number;
  isMedia: boolean;
  mime?: string;
  size?: number;
  height?: number;
  width?: number;
  isAnimated?: boolean;
  quoted: QuotedMessage | null;
  download: () => Promise<Buffer>;
  copy: () => FoxyMessage;
  react: (emoji: string) => Promise<any>;
  reply: (content: string | object, options?: ReplyOptions) => Promise<any>;
}

export interface QuotedMessage {
  id: string;
  chat: string;
  sender: string;
  fromMe: boolean;
  isBot: boolean;
  isGroup: boolean;
  type: string;
  msg: any;
  text: string;
  body: string;
  prefix: string;
  command: string;
  mentionedJid: string[];
  mime?: string;
  size?: number;
  height?: number;
  width?: number;
  isAnimated?: boolean;
  download: () => Promise<Buffer>;
  delete: () => Promise<any>;
  fakeObj: () => any;
}

export interface ReplyOptions {
  quoted?: WAMessage;
  chat?: string;
  caption?: string;
  mentions?: string[];
  ephemeralExpiration?: number;
  [key: string]: any;
}

// Plugin interface
export interface PluginContext {
  socket: WASocket;
  message: FoxyMessage;
  store: any;
  db: any;
  prefix: string;
  command: string;
  args: string[];
  text: string;
  isCreator: boolean;
  isPremium: boolean;
  isVip: boolean;
  isBan: boolean;
  isLimit: boolean;
  isNsfw: boolean;
}

// Plugin command definition
export interface PluginCommand {
  name: string;
  aliases?: string[];
  description?: string;
  category?: string;
  ownerOnly?: boolean;
  groupOnly?: boolean;
  privateOnly?: boolean;
  adminOnly?: boolean;
  botAdminOnly?: boolean;
  premiumOnly?: boolean;
  limit?: number;
  handler: (context: PluginContext) => Promise<void> | void;
}
