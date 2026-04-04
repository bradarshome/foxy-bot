import type { PluginCommand } from '../../core/plugin-system.js';
import { commands as searchBasic } from './basic.js';

export const commands: PluginCommand[] = [...searchBasic];
