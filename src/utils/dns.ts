import dns from 'dns';
import { logger } from './logger.js';

export function setupCustomDns(): void {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    logger.system('Custom DNS Google & Cloudflare configured');
  } catch (error) {
    logger.warn('DNS', `Failed to set custom DNS: ${(error as Error).message}`);
  }
}
