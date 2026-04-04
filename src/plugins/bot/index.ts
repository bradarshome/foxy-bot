import type { PluginCommand } from '../../core/plugin-system.js';
import { commands as botBasic } from './basic.js';

export const commands: PluginCommand[] = [...botBasic];
