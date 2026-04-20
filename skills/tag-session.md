---
description: Reroll or set a specific color for the current Claude Code terminal session
argument-hint: "[color-name|hue-0-359]"
allowed-tools: Bash
---

Change the terminal session color.

**Color names:** `red` `orange` `yellow` `green` `teal` `blue` `violet` `pink` `rose`
**Or use a hue angle:** `0`–`359`

**Steps:**

1. Parse `$ARGUMENTS`:
   - Empty → reroll (random color, different from current)
   - Color name (e.g. `violet`) → apply that tone
   - Number (e.g. `230`) → apply that exact hue

2. Run the appropriate command:

```bash
# No args → reroll
node "$HOME/.claude/tint/tint.mjs" --reroll

# Color name
node "$HOME/.claude/tint/tint.mjs" --color=<NAME>

# Hue number
node "$HOME/.claude/tint/tint.mjs" --color=<HUE>
```

3. Reply: "🎨 Session color → **\<colorName\>** (hue \<N\>°)"
