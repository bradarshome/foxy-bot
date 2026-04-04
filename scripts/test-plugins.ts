// @ts-nocheck
/**
 * Plugin Health Check Script
 * 
 * Memuat semua plugin, validasi struktur, dan cek API connectivity.
 * Output: tabel warna di terminal + ringkasan error.
 * 
 * Usage:
 *   npm run test:plugins
 *   tsx scripts/test-plugins.ts
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// ANSI colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

interface PluginResult {
  file: string;
  status: 'pass' | 'fail';
  commands: number;
  error?: string;
}

interface ApiResult {
  name: string;
  url: string;
  status: 'pass' | 'fail';
  statusCode?: number;
  latency?: number;
  error?: string;
}

interface TestReport {
  plugins: PluginResult[];
  apis: ApiResult[];
  totalPlugins: number;
  passedPlugins: number;
  failedPlugins: number;
  totalApis: number;
  passedApis: number;
  failedApis: number;
  startTime: number;
  endTime: number;
}

// Load settings.js for API config
function loadSettings(): any {
  const settingsPath = path.join(process.cwd(), 'settings.js');
  if (fs.existsSync(settingsPath)) {
    return require(settingsPath);
  }
  return null;
}

// Ping URL and return status
async function pingUrl(url: string, timeout = 10000): Promise<{ ok: boolean; statusCode?: number; latency?: number; error?: string }> {
  const start = Date.now();
  try {
    const http = await import('http');
    const https = await import('https');
    const client = url.startsWith('https') ? https : http;
    
    return new Promise((resolve) => {
      const req = client.get(url, { timeout }, (res) => {
        const latency = Date.now() - start;
        res.resume();
        res.on('end', () => {
          resolve({ ok: res.statusCode! < 500, statusCode: res.statusCode, latency });
        });
      });
      req.on('error', (err) => {
        resolve({ ok: false, latency: Date.now() - start, error: err.message });
      });
      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, latency: Date.now() - start, error: 'Request timeout' });
      });
    });
  } catch (err: any) {
    return { ok: false, latency: Date.now() - start, error: err.message };
  }
}

// Test single plugin file
async function testPluginFile(filePath: string, relativePath: string): Promise<PluginResult> {
  try {
    const module = await import(filePath);
    const commands = module.commands || module.default;
    
    if (!commands || !Array.isArray(commands)) {
      return {
        file: relativePath,
        status: 'fail',
        commands: 0,
        error: 'Tidak ada export "commands" array',
      };
    }

    // Validate each command
    for (const cmd of commands) {
      if (!cmd.name) {
        return {
          file: relativePath,
          status: 'fail',
          commands: commands.length,
          error: `Command tanpa "name" di index ${commands.indexOf(cmd)}`,
        };
      }
      if (typeof cmd.handler !== 'function') {
        return {
          file: relativePath,
          status: 'fail',
          commands: commands.length,
          error: `Command "${cmd.name}" tidak punya "handler" function`,
        };
      }
    }

    return {
      file: relativePath,
      status: 'pass',
      commands: commands.length,
    };
  } catch (err: any) {
    return {
      file: relativePath,
      status: 'fail',
      commands: 0,
      error: err.message || String(err),
    };
  }
}

// Discover all plugin files
function discoverPlugins(): { filePath: string; relativePath: string }[] {
  const pluginsDir = path.join(process.cwd(), 'src', 'plugins');
  const results: { filePath: string; relativePath: string }[] = [];

  function scan(dir: string, relative: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(relative, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules
        if (entry.name === 'node_modules') continue;
        scan(fullPath, relPath);
      } else if (entry.name === 'index.ts' && relative !== 'plugins') {
        // Load index files from each category folder
        results.push({
          filePath: fullPath,
          relativePath: 'src/' + relPath,
        });
      }
    }
  }

  scan(pluginsDir, 'plugins');
  return results;
}

// Test API endpoints
async function testApis(): Promise<ApiResult[]> {
  const settings = loadSettings();
  const apis = settings?.APIs || {
    foxy: 'https://api.naze.biz.id',
    neosantara: 'https://api.neosantara.xyz/v1',
  };

  const results: ApiResult[] = [];

  for (const [name, url] of Object.entries(apis)) {
    const result = await pingUrl(url as string);
    results.push({
      name,
      url: url as string,
      status: result.ok ? 'pass' : 'fail',
      statusCode: result.statusCode,
      latency: result.latency,
      error: result.error,
    });
  }

  return results;
}

// Print results to terminal
function printResults(report: TestReport): void {
  const duration = ((report.endTime - report.startTime) / 1000).toFixed(2);

  console.log('\n' + BOLD + CYAN + '╔══════════════════════════════════════════════════════╗' + RESET);
  console.log(BOLD + CYAN + '║' + RESET + BOLD + '          🦊 Foxy Bot - Plugin Health Check          ' + BOLD + CYAN + '║' + RESET);
  console.log(BOLD + CYAN + '╚══════════════════════════════════════════════════════╝' + RESET);

  // Plugin results
  console.log('\n' + BOLD + '📦 Plugin Test Results' + RESET);
  console.log(DIM + '─'.repeat(60) + RESET);

  for (const plugin of report.plugins) {
    const icon = plugin.status === 'pass' ? `${GREEN}✅${RESET}` : `${RED}❌${RESET}`;
    const cmdInfo = plugin.status === 'pass' 
      ? `${GREEN}${plugin.commands} commands${RESET}`
      : `${RED}0 commands${RESET}`;
    
    console.log(`  ${icon} ${plugin.file.padEnd(40)} ${cmdInfo}`);
    
    if (plugin.error) {
      console.log(`     ${RED}└─ ${plugin.error}${RESET}`);
    }
  }

  // API results
  console.log('\n' + BOLD + '🌐 API Connectivity Test' + RESET);
  console.log(DIM + '─'.repeat(60) + RESET);

  for (const api of report.apis) {
    const icon = api.status === 'pass' ? `${GREEN}✅${RESET}` : `${RED}❌${RESET}`;
    const latency = api.latency ? `${api.latency}ms` : '-';
    const status = api.statusCode ? `HTTP ${api.statusCode}` : '';
    
    console.log(`  ${icon} ${api.name.padEnd(20)} ${api.url.padEnd(45)} ${latency} ${status}`);
    
    if (api.error) {
      console.log(`     ${RED}└─ ${api.error}${RESET}`);
    }
  }

  // Summary
  console.log('\n' + BOLD + '📊 Summary' + RESET);
  console.log(DIM + '─'.repeat(60) + RESET);
  
  const pluginStatus = report.failedPlugins === 0 
    ? `${GREEN}ALL PASS${RESET}` 
    : `${RED}${report.failedPlugins} FAILED${RESET}`;
  const apiStatus = report.failedApis === 0 
    ? `${GREEN}ALL PASS${RESET}` 
    : `${RED}${report.failedApis} FAILED${RESET}`;

  console.log(`  Plugins:  ${report.passedPlugins}/${report.totalPlugins} passed  →  ${pluginStatus}`);
  console.log(`  APIs:     ${report.passedApis}/${report.totalApis} passed  →  ${apiStatus}`);
  console.log(`  Duration: ${duration}s`);
  console.log('');

  // Exit code
  if (report.failedPlugins > 0 || report.failedApis > 0) {
    process.exit(1);
  }
}

// Generate markdown report for Telegram/CI
function generateMarkdownReport(report: TestReport): string {
  const duration = ((report.endTime - report.startTime) / 1000).toFixed(2);
  let md = '';

  // Header
  md += `🦊 *Foxy Bot - Plugin Test Report*\n\n`;
  
  // Plugin errors
  const failedPlugins = report.plugins.filter(p => p.status === 'fail');
  if (failedPlugins.length > 0) {
    md += `❌ *${failedPlugins.length} Plugin Error*\n\n`;
    for (const plugin of failedPlugins) {
      md += `• \`${plugin.file}\`\n`;
      md += `  \`${plugin.error}\`\n\n`;
    }
  }

  // API errors
  const failedApis = report.apis.filter(a => a.status === 'fail');
  if (failedApis.length > 0) {
    md += `⚠️ *${failedApis.length} API Tidak Reachable*\n\n`;
    for (const api of failedApis) {
      md += `• \`${api.name}\` — ${api.url}\n`;
      if (api.error) md += `  \`${api.error}\`\n`;
      if (api.statusCode) md += `  \`HTTP ${api.statusCode}\`\n`;
      md += `\n`;
    }
  }

  // Summary
  md += `📊 *Summary*\n`;
  md += `• Plugins: ${report.passedPlugins}/${report.totalPlugins} ✅\n`;
  md += `• APIs: ${report.passedApis}/${report.totalApis} ✅\n`;
  md += `• Duration: ${duration}s\n`;

  return md;
}

// Main function
async function main(): Promise<void> {
  const report: TestReport = {
    plugins: [],
    apis: [],
    totalPlugins: 0,
    passedPlugins: 0,
    failedPlugins: 0,
    totalApis: 0,
    passedApis: 0,
    failedApis: 0,
    startTime: Date.now(),
    endTime: 0,
  };

  console.log('\n🔍 Memulai Plugin Health Check...');

  // Load settings first (sets global variables)
  loadSettings();

  // Test plugins
  const pluginFiles = discoverPlugins();
  report.totalPlugins = pluginFiles.length;

  for (const plugin of pluginFiles) {
    const result = await testPluginFile(plugin.filePath, plugin.relativePath);
    report.plugins.push(result);
    if (result.status === 'pass') {
      report.passedPlugins++;
    } else {
      report.failedPlugins++;
    }
  }

  // Test APIs
  report.apis = await testApis();
  report.totalApis = report.apis.length;
  report.passedApis = report.apis.filter(a => a.status === 'pass').length;
  report.failedApis = report.apis.filter(a => a.status === 'fail').length;

  report.endTime = Date.now();

  // Print results
  printResults(report);

  // Save report for CI/CD
  const reportPath = path.join(process.cwd(), 'test-results.md');
  fs.writeFileSync(reportPath, generateMarkdownReport(report));
  console.log(`📄 Report saved to: test-results.md`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
