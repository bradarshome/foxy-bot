// @ts-nocheck
/**
 * Telegram Notifier Script
 * 
 * Kirim pesan ke Telegram via Bot API.
 * Digunakan oleh test-plugins.ts dan GitHub Actions workflow.
 * 
 * Environment variables:
 *   TELEGRAM_BOT_TOKEN  - Token bot dari @BotFather
 *   TELEGRAM_CHAT_ID    - Chat ID tujuan
 * 
 * Usage:
 *   tsx scripts/telegram.ts "Pesan test"
 *   cat test-results.md | tsx scripts/telegram.ts --stdin
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

interface TelegramConfig {
  botToken: string;
  chatId: string;
}

function getConfig(): TelegramConfig | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('⚠️  TELEGRAM_BOT_TOKEN dan TELEGRAM_CHAT_ID belum diset.');
    console.error('   Set di environment atau .env file.');
    return null;
  }

  return { botToken, chatId };
}

function escapeMarkdown(text: string): string {
  // Escape MarkdownV2 special characters
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

async function sendMessage(config: TelegramConfig, text: string, parseMode = 'Markdown'): Promise<boolean> {
  const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
  const body = JSON.stringify({
    chat_id: config.chatId,
    text,
    parse_mode: parseMode,
    disable_web_page_preview: true,
  });

  return new Promise((resolve) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const result = JSON.parse(data);
        if (result.ok) {
          console.log('✅ Pesan terkirim ke Telegram');
          resolve(true);
        } else {
          console.error(`❌ Gagal kirim pesan: ${result.description}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error(`❌ Error: ${err.message}`);
      resolve(false);
    });

    req.write(body);
    req.end();
  });
}

function buildTestReport(logs: string): string {
  const hasError = logs.includes('❌') || logs.includes('FAILED');
  if (!hasError) return '';

  // Extract error lines
  const errorLines: string[] = [];
  const lines = logs.split('\n');
  let inError = false;

  for (const line of lines) {
    if (line.includes('❌') || line.includes('└─')) {
      errorLines.push(line);
    }
  }

  if (errorLines.length === 0) return '';

  let message = `🦊 *Foxy Bot — Test Gagal*\n\n`;
  message += `❌ Plugin/API error terdeteksi:\n\n`;

  for (const line of errorLines.slice(0, 20)) {
    // Format code blocks
    if (line.includes('└─')) {
      const errText = line.replace('└─ ', '').trim();
      message += `\`${errText}\`\n`;
    } else if (line.includes('❌')) {
      const cleanLine = line.replace('❌', '').trim();
      message += `• \`${cleanLine}\`\n`;
    }
  }

  if (errorLines.length > 20) {
    message += `\n_dan ${errorLines.length - 20} error lainnya..._`;
  }

  // Add GitHub Actions link if available
  const runId = process.env.GITHUB_RUN_ID;
  const repo = process.env.GITHUB_REPOSITORY;
  if (runId && repo) {
    message += `\n\n🔗 [Lihat full log](https://github.com/${repo}/actions/runs/${runId})`;
  }

  return message;
}

async function main(): Promise<void> {
  const config = getConfig();
  if (!config) {
    process.exit(0); // Not an error, just not configured
  }

  const args = process.argv.slice(2);
  let message = '';

  // Check for stdin
  if (args.includes('--stdin')) {
    const reportPath = path.join(process.cwd(), 'test-results.md');
    if (fs.existsSync(reportPath)) {
      message = fs.readFileSync(reportPath, 'utf-8');
    }
  }

  // Or take message from args
  if (!message && args.length > 0 && !args[0].startsWith('--')) {
    message = args.join(' ');
  }

  if (!message) {
    // Try to read test-results.md
    const reportPath = path.join(process.cwd(), 'test-results.md');
    if (fs.existsSync(reportPath)) {
      message = fs.readFileSync(reportPath, 'utf-8');
    }
  }

  if (!message) {
    console.log('⚠️  Tidak ada pesan untuk dikirim');
    process.exit(0);
  }

  const success = await sendMessage(config, message);
  process.exit(success ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

// Export for use by other modules
export { sendMessage, getConfig, buildTestReport };
