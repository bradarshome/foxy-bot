import { execSync } from 'child_process';
import os from 'os';
import chalk from 'chalk';
import pkg from '../../package.json' with { type: 'json' };

function getUsername(): string {
  try {
    return os.userInfo().username;
  } catch {
    return process.env.USER || process.env.USERNAME || 'unknown';
  }
}

export function printSystemInfo(): void {
  const username = getUsername();
  const hostname = os.hostname();

  console.log(chalk.green.bold(`╔═════[${chalk.cyan(username)}@${chalk.cyan(hostname)}]═════`));
  const print = (label: string, value: string) =>
    console.log(`${chalk.green.bold('║')} ${chalk.cyan.bold(label.padEnd(16))}${chalk.yellow.bold(':')} ${value}`);

  print('OS', `${os.platform()} ${os.release()} ${os.arch()}`);
  print('Uptime', `${Math.floor(os.uptime() / 3600)} h ${Math.floor((os.uptime() % 3600) / 60)} m`);
  print('Shell', process.env.SHELL || process.env.COMSPEC || 'unknown');
  print('CPU', os.cpus()[0]?.model.trim() || 'unknown');
  print('Memory', `${(os.freemem() / 1024 / 1024).toFixed(0)} MiB / ${(os.totalmem() / 1024 / 1024).toFixed(0)} MiB`);
  print('Script version', `v${pkg.version}`);
  print('Node.js', process.version);
  print('Baileys', pkg.dependencies.baileys);
  print('Date & Time', new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta', hour12: false }));
  console.log(chalk.green.bold('╚' + '═'.repeat(30)));
}

export function assertInstalled(cmd: string, name: string, exitCode: number): void {
  try {
    execSync(cmd, { stdio: 'ignore' });
  } catch {
    console.error(chalk.redBright(`❌  ${name} is not installed or not in PATH.`));
    console.error(`Please install it first and run the script again.`);
    process.exit(exitCode);
  }
}
