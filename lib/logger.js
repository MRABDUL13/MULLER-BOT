import pino from 'pino';
import config from '../config/config.js';

const SECRET_KEYS = /session|credential|private[_-]?key|api[_-]?key|password|token|secret|authstate|creds/i;

const pinoLogger = pino({
  level: config.logLevel || 'info',
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  messageKey: 'msg',
  formatters: {
    level(label) {
      return { level: label };
    }
  }
});

function sanitize(value) {
  if (value instanceof Error) {
    return value.message;
  }
  if (typeof value === 'string') {
    return SECRET_KEYS.test(value) ? '[redacted]' : value;
  }
  if (value && typeof value === 'object') {
    const clone = Array.isArray(value) ? [] : {};
    for (const [key, nested] of Object.entries(value)) {
      clone[key] = SECRET_KEYS.test(key) ? '[redacted]' : sanitize(nested);
    }
    return clone;
  }
  return value;
}

function write(level, message, extra) {
  const tag = `[${level.toUpperCase()}]`;
  const text = `${tag} ${message}`;
  if (extra !== undefined) {
    pinoLogger[level]({ extra: sanitize(extra) }, text);
  } else {
    pinoLogger[level](text);
  }
}

const logger = {
  info(message, extra) {
    write('info', message, extra);
  },
  warn(message, extra) {
    write('warn', message, extra);
  },
  error(message, extra) {
    write('error', message, extra);
  },
  debug(message, extra) {
    write('debug', message, extra);
  },
  child() {
    return logger;
  },
  baileys: pino({ level: 'silent' })
};

export default logger;
