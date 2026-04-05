// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';
import { commands as gameBasic } from './basic.js';
import { commands as gameQuiz } from './quiz.js';

export const commands: PluginCommand[] = [
  ...gameBasic,
  ...gameQuiz,
];
