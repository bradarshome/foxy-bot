import type { PluginCommand } from '../../core/plugin-system.js';
import { commands as toolsBasic } from './basic.js';

export const commands: PluginCommand[] = [...toolsBasic];
