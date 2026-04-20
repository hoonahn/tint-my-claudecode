Install the `tint-my-claudecode` Claude Code plugin. Complete all steps autonomously.

## What this plugin does
Automatically assigns a unique color tint to each Claude Code terminal session based on the session ID — so you can identify sessions visually without reading context. Supports Ghostty/cmux (OSC 11) and iTerm2.

## Installation steps

### 1. Add marketplace to ~/.claude/settings.json

Read `~/.claude/settings.json`, then add to the `extraKnownMarketplaces` field (create it if missing):

```json
"hoonahn": {
  "source": {
    "source": "github",
    "repo": "hoonahn/tint-my-claudecode"
  }
}
```

### 2. Create the wrapper script

Create directory `~/.claude/tint/` and write `~/.claude/tint/tint.mjs` with this content:

```javascript
#!/usr/bin/env node
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const home = homedir();
const configDir = process.env.CLAUDE_CONFIG_DIR || join(home, '.claude');
const base = join(configDir, 'plugins', 'cache');

let scriptPath = null;
try {
  for (const marketplace of readdirSync(base)) {
    const mDir = join(base, marketplace, 'tint-my-claudecode');
    if (!existsSync(mDir)) continue;
    const versions = readdirSync(mDir)
      .filter(v => existsSync(join(mDir, v, 'scripts', 'apply-color.mjs')))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    if (versions.length > 0) {
      scriptPath = join(mDir, versions.at(-1), 'scripts', 'apply-color.mjs');
      break;
    }
  }
} catch { /* ignore */ }

if (!scriptPath) {
  console.log('[tint] Plugin not installed. Run: /plugin install tint-my-claudecode');
  process.exit(0);
}

await import(pathToFileURL(scriptPath).href);
```

Make it executable: `chmod +x ~/.claude/tint/tint.mjs`

### 3. Add hooks to ~/.claude/settings.json

Add these two hooks (create the sections if missing):

- **SessionStart**: `node $HOME/.claude/tint/tint.mjs` (timeout: 3)
- **SessionEnd**: `node $HOME/.claude/tint/tint.mjs --reset` (timeout: 2)

### 4. Confirm completion

Tell the user:
```
✅ tint-my-claudecode installed!

Next steps:
1. Restart Claude Code
2. Run: /plugin install tint-my-claudecode
3. Done — each session will now get a unique color automatically

To change color: /tag-session [color-name|hue]
```
