import type { WASocket } from 'baileys'

// Extended WASocket with custom methods
export type ExtendedSocket = WASocket & {
  serializeM: (m: any) => Promise<void>;
  decodeJid: (jid: string) => string;
  findJidByLid: (lid: string, store: any, resolve?: boolean) => string | null;
  getName: (jid: string, withoutContact?: boolean) => Promise<string>;
  sendContact: (jid: string, kon: string[], quoted?: any, opts?: any) => Promise<any>;
  profilePictureUrl: (jid: string, type?: string, timeoutMs?: number) => Promise<string | undefined>;
  setStatus: (status: string) => void;
  relayMessageV2: (jid: string, message: any, options?: any) => Promise<any>;
  sendPoll: (jid: string, name: string, values: string[], quoted: any, selectableCount?: number) => Promise<any>;
  sendFileUrl: (jid: string, url: string, caption: string, quoted: any, options?: any) => Promise<any>;
  sendFromOwner: (jids: string[], text: string, quoted: any, options?: any) => Promise<void>;
  sendText: (jid: string, text: string, quoted: any, options?: any) => Promise<any>;
  sendAsSticker: (jid: string, path: string | Buffer, quoted: any, options?: any) => Promise<any>;
  downloadMediaMessage: (message: any) => Promise<Buffer>;
  downloadAndSaveMediaMessage: (message: any, filename?: string, attachExtension?: boolean) => Promise<string>;
  getFile: (PATH: string | Buffer) => Promise<{ filename: string; mime: string; ext: string; isTemp: boolean }>;
  appendResponseMessage: (m: any, text: string) => Promise<void>;
  sendMedia: (jid: string, pathMedia: string | Buffer, fileName?: string, caption?: string, quoted?: any, options?: any) => Promise<any>;
  sendAlbumMessage: (jid: string, content: any, options?: any) => Promise<any>;
  sendListMsg: (jid: string, content: any, options?: any) => Promise<any>;
  sendButtonMsg: (jid: string, content: any, options?: any) => Promise<any>;
  newsletterMsg: (key: string, content: any, timeout?: number) => Promise<any>;
  sendCarouselMsg: (jid: string, body: string, footer: string, cards: any[], options?: any) => Promise<any>;
  sendGroupInviteV4: (jid: string, participant: string, inviteCode: string, inviteExpiration: string, groupName?: string, caption?: string, jpegThumbnail?: Buffer | null, options?: any) => Promise<any>;
  public: boolean;
};
