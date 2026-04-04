import type { PluginCommand } from '../../core/plugin-system.js';
import { commands as funBasic } from './basic.js';

export const commands: PluginCommand[] = [...funBasic];
