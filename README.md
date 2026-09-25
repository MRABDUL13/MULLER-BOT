# MULLER BOT

Modular WhatsApp bot built with **Baileys `7.0.0-rc14`** (the published npm release of Baileys 7.0.0-rc.14). Designed for Linux servers, VPS, and cPanel Node.js hosting.

Smart. Fast. Reliable.

## 1. Requirements

- Node.js **20+** (21/22 recommended)
- A WhatsApp account you control
- Persistent disk for the `sessions/` folder
- Optional: `ffmpeg` if you want higher-quality sticker/video conversion later

## 2. Installation

```bash
# Clone or upload the project, then:
npm install
cp .env.example .env
```

Edit `.env` and set at least:

- `OWNER_NUMBER` — your number with country code, digits only
- `AUTH_METHOD` — `pairing` or `qr`
- `PHONE_NUMBER` — required for pairing-code login

```bash
npm start
```

## 3. Configuration

Copy `.env.example` to `.env`. Never commit `.env` or session files.

| Variable | Description |
| --- | --- |
| `BOT_NAME` | Display name |
| `OWNER_NUMBER` | Owner WhatsApp number (country code, digits only) |
| `PREFIX` | Command prefix (default `.`) |
| `MODE` | `public` or `private` |
| `SESSION_DIR` | Auth folder (default `./sessions`) |
| `LOG_LEVEL` | `info`, `warn`, `error`, `debug` |
| `AUTH_METHOD` | `pairing` or `qr` |
| `PHONE_NUMBER` | Number used for pairing-code login |
| `MAX_WARNINGS` | Warning threshold per group |
| `ANTILINK_IGNORE_ADMINS` | Skip admin links when antilink is on |
| `ANTILINK_KICK` | Remove members who hit the warning limit via antilink |
| `RATE_LIMIT_MAX` | Max commands per window |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window in milliseconds |

Owner can also change the prefix at runtime with `.prefix`.

## 4. Pairing / QR authentication

### Pairing code (`AUTH_METHOD=pairing`)

1. Set `PHONE_NUMBER` to the WhatsApp number (country code, digits only).
2. Start the bot.
3. The pairing code is printed in the terminal only.
4. On the phone: **WhatsApp > Linked Devices > Link a Device > Link with phone number**.
5. Enter the code. The session is saved in `sessions/`.

### QR code (`AUTH_METHOD=qr`)

1. Start the bot.
2. Scan the QR printed in the terminal.
3. The session is saved in `sessions/`.

After a successful login, restarts reuse the saved session. You do not need to pair again unless you log out or delete `sessions/`.

## 5. Running the bot

```bash
npm start
```

Development (auto-restart on file changes):

```bash
npm run dev
```

Process managers:

```bash
# pm2
pm2 start index.js --name muller-bot

# systemd: run `node index.js` from the project directory
```

## 6. Command structure

Default prefix: `.`

General: `.ping` `.alive` `.menu` `.help` `.owner` `.botinfo` `.runtime` `.speed` `.status` `.prefix`

Group: `.groupinfo` `.admins` `.tagall` `.hidetag` `.kick` `.add` `.promote` `.demote`

Security: `.antilink` `.welcome` `.goodbye` `.setwelcome` `.setgoodbye` `.warn` `.warnings` `.resetwarn` `.delete` `.mute` `.unmute`

Media: `.sticker` `.toimg` `.tourl`

Owner: `.broadcast` `.block` `.unblock` `.join` `.leave` `.restart`

The menu is generated from loaded command files. Commands that are not registered are never listed.

## 7. Adding commands

Create a file under `commands/<category>/yourcommand.js`:

```js
export default {
  name: 'ping',
  aliases: ['p'],
  category: 'general',
  description: 'Check bot response speed',
  usage: '.ping',
  permission: 'USER',
  async execute(ctx) {
    await ctx.reply('Pong');
  }
};
```

Permission values: `USER`, `GROUP_ADMIN`, `BOT_ADMIN`, `OWNER`.

The loader discovers every `*.js` file under `commands/` automatically. Do not maintain a hard-coded command list.

`ctx` includes `sock`, `msg`, `args`, `argText`, `prefix`, `sender`, `chat`, `isGroup`, `perms`, `db`, `store`, and `reply()`.

## 8. Owner configuration

Set `OWNER_NUMBER` in `.env`. Owner commands (`broadcast`, `block`, `unblock`, `join`, `leave`, `restart`, `prefix`) cannot be used by group admins.

Do not hard-code private numbers in source files.

## 9. Deployment

- Keep `sessions/` on persistent storage. Losing it requires a new login.
- Use a process manager so the bot restarts after crashes.
- Open outbound HTTPS/WSS. WhatsApp does not need inbound ports.
- On cPanel, use the Node.js selector (v20+) and set the startup file to `index.js`.
- Do not expose `sessions/` or `.env` through a web root.

## 10. Troubleshooting

| Problem | What to check |
| --- | --- |
| Pairing code never appears | `AUTH_METHOD=pairing`, valid `PHONE_NUMBER`, wait for the QR/connection event |
| Bot asks to login every restart | `sessions/` must be writable and not deleted |
| Commands ignored | Confirm prefix, `MODE=public`, and that the session is connected |
| Group admin commands fail | Bot must be a group admin for kick/add/promote/demote/delete/mute |
| Logged out | Delete `sessions/` only if you intend to re-authenticate, then login again |
| Node version error | Upgrade to Node.js 20+ |

Logs never include session keys, tokens, or pairing secrets.

## 11. Security

- Secrets live in `.env`, not in git.
- Session files are gitignored.
- Commands are permission-checked in a central module.
- Rate limiting reduces spam.
- There is no `.eval`, `.exec`, or `.shell` command.
- Media commands validate type/size and delete temp files.
- User-provided filenames are never executed.
- Antilink, warn, and delete failures are caught and never crash the process.

## Project layout

```text
index.js
package.json
config/config.js
handler/
commands/
lib/
data/
sessions/
```

Storage starts as JSON (`data/settings.json`, `data/warnings.json`) behind `lib/database.js`, so a later MongoDB/MySQL adapter can replace the file backend without rewriting commands.
