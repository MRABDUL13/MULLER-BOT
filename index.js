import config, { applyPersistedSettings } from './config/config.js';
import { db } from './lib/database.js';
import logger from './lib/logger.js';
import { loadCommands } from './handler/commands.js';
import { bindProcessSignals, startConnection } from './handler/connection.js';

async function main() {
  bindProcessSignals();
  await db.init();
  applyPersistedSettings(db.getSettings());
  await loadCommands();
  logger.info(`${config.botName} starting`, {
    mode: config.mode,
    authMethod: config.authMethod,
    prefix: config.prefix
  });
  await startConnection();
}

main().catch((error) => {
  logger.error('Fatal startup error', { error: error.message });
  process.exit(1);
});
