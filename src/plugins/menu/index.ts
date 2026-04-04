import type { PluginCommand } from '../../core/plugin-system.js';
import { commands as menuBasic } from './basic.js';

export const commands: PluginCommand[] = [...menuBasic];
