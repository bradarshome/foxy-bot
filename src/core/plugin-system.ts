// @ts-nocheck
import type { WASocket } from 'baileys';
import type { PluginCommand, PluginContext, FoxyMessage } from '../types/message.js';

export type { PluginCommand, PluginContext, FoxyMessage };

// Plugin registry
const pluginRegistry: Map<string, PluginCommand> = new Map();

// Register a plugin command
export function registerPlugin(command: PluginCommand): void {
  const names = [command.name, ...(command.aliases || [])];
  for (const name of names) {
    pluginRegistry.set(name.toLowerCase(), command);
  }
}

// Get command by name
export function getCommand(name: string): PluginCommand | undefined {
  return pluginRegistry.get(name.toLowerCase());
}

// Get all commands
export function getAllCommands(): PluginCommand[] {
  const seen = new Set<string>();
  const commands: PluginCommand[] = [];
  for (const [name, cmd] of pluginRegistry) {
    if (!seen.has(cmd.name)) {
      seen.add(cmd.name);
      commands.push(cmd);
    }
  }
  return commands;
}

// Get commands by category
export function getCommandsByCategory(category: string): PluginCommand[] {
  return getAllCommands().filter((cmd) => cmd.category?.toLowerCase() === category.toLowerCase());
}

// Get all unique categories
export function getCategories(): string[] {
  const categories = new Set<string>();
  for (const cmd of getAllCommands()) {
    if (cmd.category) categories.add(cmd.category);
  }
  return Array.from(categories).sort();
}

// Load all plugins from a module
export function loadPlugins(module: any): void {
  if (module.default && Array.isArray(module.default)) {
    for (const cmd of module.default) {
      registerPlugin(cmd);
    }
  } else if (module.commands && Array.isArray(module.commands)) {
    for (const cmd of module.commands) {
      registerPlugin(cmd);
    }
  } else if (typeof module.registerAll === 'function') {
    module.registerAll();
  }
}

// Handle command execution
export async function handleCommand(
  socket: WASocket,
  message: FoxyMessage,
  store: any,
  db: any,
  prefix: string,
  command: string,
  args: string[],
  text: string,
  isCreator: boolean
): Promise<boolean> {
  const plugin = getCommand(command);
  if (!plugin) return false;

  // Permission checks
  const botNumber = socket.decodeJid?.(socket.user!.id) || '';
  const sender = message.sender;
  const chat = message.chat;
  const user = db?.users?.[sender] || {};
  const group = db?.groups?.[chat] || {};
  const premium = db?.premium || [];
  const settings = db?.set?.[botNumber] || {};

  const isPremium = isCreator || premium.some((p: any) => p.id === sender);
  const isVip = isCreator || user.vip;
  const isBan = isCreator || user.ban;
  const isLimit = isCreator || user.limit > 0;
  const isNsfw = group.nsfw;

  const context: PluginContext = {
    socket,
    message,
    store,
    db,
    prefix,
    command,
    args,
    text,
    isCreator,
    isPremium,
    isVip,
    isBan,
    isLimit,
    isNsfw,
  };

  // Check permissions
  if (plugin.ownerOnly && !isCreator) {
    await message.reply(db?.mess?.owner || 'Owner only!');
    return true;
  }
  if (plugin.groupOnly && !message.isGroup) {
    await message.reply(db?.mess?.group || 'Group only!');
    return true;
  }
  if (plugin.privateOnly && message.isGroup) {
    await message.reply(db?.mess?.private || 'Private chat only!');
    return true;
  }
  if (plugin.adminOnly && !message.isAdmin) {
    await message.reply(db?.mess?.admin || 'Admin only!');
    return true;
  }
  if (plugin.botAdminOnly && !message.isBotAdmin) {
    await message.reply(db?.mess?.botAdmin || 'Bot must be admin!');
    return true;
  }
  if (plugin.premiumOnly && !isCreator && !isPremium) {
    await message.reply(db?.mess?.prem || 'Premium only!');
    return true;
  }
  if (plugin.limit && !isLimit) {
    await message.reply(db?.mess?.limit || 'Limit exhausted!');
    return true;
  }

  // Execute command
  try {
    await plugin.handler(context);
    // Deduct limit if specified
    if (plugin.limit && !isCreator) {
      user.limit = (user.limit || 0) - plugin.limit;
    }
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await message.reply(`Error: ${msg}`);
    console.error(`[Plugin Error] ${command}:`, error);
    return true;
  }
}

// Export for dynamic imports
export { pluginRegistry };
