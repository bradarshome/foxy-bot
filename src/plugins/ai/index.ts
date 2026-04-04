import type { PluginCommand } from '../../core/plugin-system.js';
import { commands as aiBasic } from './basic.js';

export const commands: PluginCommand[] = [...aiBasic];
