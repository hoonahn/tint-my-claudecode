---
name: tag-session
description: Reroll or set a specific color for the current Claude Code terminal session
argument-hint: "[color-name|hue-0-359]"
allowed-tools: Bash
---

Change the terminal session color. Run exactly one command and reply with the result.

**Color names:** `red` `orange` `yellow` `green` `teal` `blue` `violet` `pink` `rose`
**Or use a hue angle:** `0`–`359`

Parse `$ARGUMENTS` and run ONE command:

```bash
# No args → reroll
node "$HOME/.claude/tint/tint.mjs" --reroll

# Color name or hue number
node "$HOME/.claude/tint/tint.mjs" --color=$ARGUMENTS
```

The command prints `<colorName> <hue>` on stdout. Use that to reply:

"🎨 Session color → **\<colorName\>** (hue \<N\>°)"
