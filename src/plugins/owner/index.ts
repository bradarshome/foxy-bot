// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';
import { commands as ownerBasic } from './basic.js';
import { commands as ownerUserMgmt } from './user-mgmt.js';
import { commands as ownerPremium } from './premium.js';
import { commands as ownerSession } from './session.js';
import { commands as ownerSettings } from './settings.js';
import { commands as ownerSystem } from './system.js';

export const commands: PluginCommand[] = [
  ...ownerBasic,
  ...ownerUserMgmt,
  ...ownerPremium,
  ...ownerSession,
  ...ownerSettings,
  ...ownerSystem,
];
