// @ts-nocheck
import type { PluginCommand } from '../../core/plugin-system.js';

export const commands: PluginCommand[] = [
  {
    name: 'ai',
    aliases: ['google', 'bard', 'gemini'],
    description: 'Ask AI',
    category: 'AI',
    handler: async ({ message, text, db }) => {
      if (!text) return message.reply(`Example: ${message.prefix + message.command} query`);
      try {
        const hasil = await (global as any).fetchApi('/ai/gemini-flash-lite', { query: text });
        message.reply(hasil.result.text);
      } catch {
        const { pickRandom } = await import('../../../lib/function.js');
        message.reply(pickRandom(['Fitur Ai sedang bermasalah!', 'Tidak dapat terhubung ke ai!', 'Sistem Ai sedang sibuk sekarang!', 'Fitur sedang tidak dapat digunakan!']));
      }
    },
  },
  {
    name: 'archipelago',
    aliases: ['grok', 'glm', 'claude'],
    description: 'Advanced AI models',
    category: 'AI',
    handler: async ({ message, text, db }) => {
      const APIs = db?.APIs || {};
      const APIKeys = db?.APIKeys || {};
      if (APIKeys[APIs.neosantara] === 'API_KEY_NEOSANTARA_AI') return message.reply('Silahkan Ganti Apikey Neosantara Ai!\nDi file settings.js');
      if (!text) return message.reply('Halo! Ada yang bisa dibantu hari ini?');
      try {
        let model: string;
        if (message.command == 'glm') model = 'glm-4.7-flash';
        else if (message.command == 'claude') model = 'claude-3-haiku';
        else if (message.command == 'archipelago') model = 'archipelago-70b';
        else model = 'grok-4.1-fast-non-reasoning';

        const response = await (global as any).fetchApi('/chat/completions', {
          model, messages: [{ role: 'user', content: text }],
        }, { api: 2, method: 'POST', headers: { 'Authorization': `Bearer ${APIKeys[APIs.neosantara]}` } });
        await message.reply(response.choices[0].message.content);
      } catch {
        message.reply('Waduh, ada kendala pas nanya ke Neosantara nih.');
      }
    },
  },
  {
    name: 'deepseek',
    aliases: ['r1'],
    description: 'DeepSeek R1 AI',
    category: 'AI',
    handler: async ({ message, text, db }) => {
      const APIs = db?.APIs || {};
      const APIKeys = db?.APIKeys || {};
      if (APIKeys[APIs.neosantara] === 'API_KEY_NEOSANTARA_AI') return message.reply('Silahkan Ganti Apikey Neosantara Ai!\nDi file settings.js');
      if (!text) return message.reply('Halo! Ada yang bisa dibantu hari ini?');
      await message.reply('Tunggu bentar, lagi mikir... 🧠');
      try {
        const response = await (global as any).fetchApi('/chat/completions', {
          model: 'deepseek-r1',
          messages: [{ role: 'user', content: text }],
          thinking: { type: 'enabled', budget_tokens: 2048 },
        }, { api: 2, method: 'POST', headers: { 'Authorization': `Bearer ${APIKeys[APIs.neosantara]}` } });
        const result = response.choices[0].message;
        const thought = result.reasoning_content ? `*Proses Mikir:*\n_${result.reasoning_content}_` : '';
        await message.reply(thought + result.content);
      } catch {
        message.reply('Waduh, ada kendala pas nanya ke Neosantara nih.');
      }
    },
  },
];
