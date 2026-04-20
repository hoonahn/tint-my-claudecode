---
description: Install tint-my-claudecode hooks for automatic session color-coding
allowed-tools: Bash
---

Set up automatic session color-coding by creating a wrapper script and configuring Claude Code hooks.

**Steps:**

1. Find the plugin installation path:
```bash
node -e "
const p=require('path'),f=require('fs'),h=require('os').homedir();
const base=p.join(h,'.claude','plugins','cache');
// search all marketplaces
const script=require('fs').readdirSync(base,{withFileTypes:true})
  .filter(d=>d.isDirectory()).flatMap(m=>
    f.readdirSync(p.join(base,m.name),{withFileTypes:true})
      .filter(d=>d.isDirectory()&&d.name==='tint-my-claudecode')
      .map(d=>p.join(base,m.name,d.name))
  ).flatMap(dir=>
    f.readdirSync(dir,{withFileTypes:true})
      .filter(d=>d.isDirectory())
      .map(v=>p.join(dir,v.name,'scripts','apply-color.mjs'))
      .filter(s=>f.existsSync(s))
  )[0];
console.log(script||'NOT_FOUND');
"
```

2. Create the wrapper directory and script at `~/.claude/tint/tint.mjs`:
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
const base = join(home, '.claude', 'plugins', 'cache');

// Find latest installed version of tint-my-claudecode
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

3. Make it executable:
```bash
chmod +x "$HOME/.claude/tint/tint.mjs"
```

4. Add hooks to `~/.claude/settings.json` — read the file, then add:
- `SessionStart`: `node $HOME/.claude/tint/tint.mjs`
- `SessionEnd`: `node $HOME/.claude/tint/tint.mjs --reset`

5. Reply: "✅ tint-my-claudecode setup complete! Restart Claude Code to activate."
