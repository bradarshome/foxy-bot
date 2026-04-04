import type { PluginCommand } from '../../core/plugin-system.js';
import { commands as downloaderBasic } from './basic.js';

export const commands: PluginCommand[] = [...downloaderBasic];
