---
name: setup
description: Install tint-my-claudecode hooks for automatic session color-coding
allowed-tools: Bash, Write, Edit
---

Set up automatic session color-coding by creating a wrapper script and configuring Claude Code hooks.

**Steps:**

1. Create the wrapper directory and script at `~/.claude/tint/tint.mjs`:
```bash
mkdir -p "$HOME/.claude/tint"
```

Then use the Write tool to create `~/.claude/tint/tint.mjs`:
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
  console.log('[tint] Plugin not found. Run: /plugin install tint-my-claudecode');
  process.exit(0);
}

await import(pathToFileURL(scriptPath).href);
```

2. Make it executable:
```bash
chmod +x "$HOME/.claude/tint/tint.mjs"
```

3. Add hooks to `~/.claude/settings.json` — read the file, then add:
- `SessionStart`: `node "$HOME/.claude/tint/tint.mjs"` (timeout: 3)
- `SessionEnd`: `node "$HOME/.claude/tint/tint.mjs" --reset` (timeout: 2)

4. Reply: "✅ tint-my-claudecode setup complete! Restart Claude Code to activate."
