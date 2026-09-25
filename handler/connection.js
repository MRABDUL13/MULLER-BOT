import fs from 'node:fs/promises';
import path from 'node:path';
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState
} from 'baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import config from '../config/config.js';
import logger from '../lib/logger.js';
import { store } from '../lib/store.js';
import { normalizeNumber, sleep } from '../lib/utils.js';
import { bindEvents } from './events.js';

const MAX_BACKOFF_MS = 5 * 60 * 1000;
const INITIAL_BACKOFF_MS = 2000;

let sock = null;
let shuttingDown = false;
let reconnectTimer = null;
let reconnectAttempt = 0;
let pairingRequested = false;
let signalsBound = false;

function disconnectStatus(lastDisconnect) {
  return lastDisconnect?.error instanceof Boom
    ? lastDisconnect.error.output?.statusCode
    : lastDisconnect?.error?.output?.statusCode;
}

function shouldReconnect(statusCode) {
  if (shuttingDown) return false;
  if (statusCode === DisconnectReason.loggedOut) return false;
  if (statusCode === DisconnectReason.forbidden) return false;
  if (statusCode === DisconnectReason.badSession) return false;
  if (statusCode === DisconnectReason.multideviceMismatch) return false;
  return true;
}

async function clearSessionIfInvalid(statusCode) {
  if (statusCode !== DisconnectReason.loggedOut && statusCode !== DisconnectReason.badSession) {
    return;
  }
  logger.warn('Session is no longer valid. Delete sessions/ and authenticate again.');
}

async function requestPairing(currentSock) {
  if (pairingRequested || currentSock.authState?.creds?.registered) return;
  const number = normalizeNumber(config.phoneNumber || config.ownerNumber);
  if (!number) {
    logger.error('PHONE_NUMBER is required when AUTH_METHOD=pairing');
    return;
  }
  pairingRequested = true;
  try {
    const code = await currentSock.requestPairingCode(number);
    const formatted = String(code || '').replace(/(.{4})/g, '$1-').replace(/-$/, '');
    process.stdout.write('\n========================================\n');
    process.stdout.write(` MULLER BOT pairing code: ${formatted}\n`);
    process.stdout.write(' WhatsApp > Linked Devices > Link with phone number\n');
    process.stdout.write('========================================\n\n');
  } catch (error) {
    pairingRequested = false;
    logger.error('Failed to request pairing code', { error: error.message });
  }
}

function scheduleReconnect() {
  if (shuttingDown || reconnectTimer) return;
  reconnectAttempt += 1;
  const delay = Math.min(MAX_BACKOFF_MS, INITIAL_BACKOFF_MS * 2 ** Math.min(reconnectAttempt, 8));
  logger.warn(`Reconnecting in ${Math.round(delay / 1000)}s (attempt ${reconnectAttempt})`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    startConnection().catch((error) => {
      logger.error('Reconnect failed', { error: error.message });
      scheduleReconnect();
    });
  }, delay);
}

export async function startConnection() {
  if (shuttingDown) return null;
  if (sock) {
    try {
      sock.end(undefined);
    } catch {
      // ignore
    }
    sock = null;
  }
  await fs.mkdir(config.sessionDir, { recursive: true });
  await fs.mkdir(config.tmpDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(config.sessionDir);
  let version;
  try {
    const result = await fetchLatestBaileysVersion();
    version = result.version;
  } catch {
    version = undefined;
  }

  sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger.baileys)
    },
    logger: logger.baileys,
    browser: Browsers.ubuntu(config.botName),
    markOnlineOnConnect: false,
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    cachedGroupMetadata: async (jid) => store.getCachedGroup(jid),
    getMessage: async (key) => store.getMessage(key)
  });

  store.bind(sock.ev);
  bindEvents(sock);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && config.authMethod === 'qr') {
      logger.info('Scan the QR code with WhatsApp > Linked Devices');
      qrcode.generate(qr, { small: true });
    }

    if (qr && config.authMethod === 'pairing' && !sock.authState?.creds?.registered) {
      await requestPairing(sock);
    }

    if (connection === 'connecting') {
      logger.info('Connecting to WhatsApp...');
    }

    if (connection === 'open') {
      reconnectAttempt = 0;
      pairingRequested = false;
      logger.info(`${config.botName} connected`);
    }

    if (connection === 'close') {
      const statusCode = disconnectStatus(lastDisconnect);
      logger.warn('Connection closed', { statusCode });
      await clearSessionIfInvalid(statusCode);
      try {
        sock?.end?.(undefined);
      } catch {
        // ignore
      }
      sock = null;
      pairingRequested = false;
      if (shouldReconnect(statusCode) || statusCode === DisconnectReason.restartRequired) {
        scheduleReconnect();
      } else {
        logger.error('Not reconnecting. Check authentication and try again.');
      }
    }
  });

  return sock;
}

export function getSocket() {
  return sock;
}

export async function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  logger.info('Shutting down');
  try {
    sock?.end?.(undefined);
  } catch {
    // ignore
  }
  await sleep(300);
  process.exit(exitCode);
}

export function bindProcessSignals() {
  if (signalsBound) return;
  signalsBound = true;
  process.on('SIGINT', () => shutdown(0));
  process.on('SIGTERM', () => shutdown(0));
  process.on('uncaughtException', (error) => {
    logger.error('uncaughtException', { error: error.message });
  });
  process.on('unhandledRejection', (error) => {
    logger.error('unhandledRejection', { error: error?.message || String(error) });
  });
}

export function sessionPath() {
  return path.resolve(config.sessionDir);
}
