// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';
import { commands as groupBasic } from './basic.js';
import { commands as groupSettings } from './settings.js';

export const commands: PluginCommand[] = [
  ...groupBasic,
  ...groupSettings,
];
