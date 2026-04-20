# tint-my-claudecode

Automatically assigns a unique color tint to each Claude Code terminal session — identify sessions at a glance without reading context.

## How it works

- On session start: derives a deterministic color from the session ID (360 unique hues via HSL)
- Applies a subtle background tint (20% blend over dark base)
- Sets the terminal title to `● colorName — project:branch`
- On session end: resets to default terminal background
- Same session always gets the same color (deterministic, not random)

## Terminal support

| Terminal | Tab color | Background tint | Title |
|----------|-----------|-----------------|-------|
| Ghostty / cmux | ✅ | ✅ | ✅ |
| iTerm2 | ✅ | ✅ | ✅ |
| Others | ❌ | ❌ | ✅ |

## Installation

```bash
# 1. Add marketplace to ~/.claude/settings.json
```

```json
{
  "extraKnownMarketplaces": {
    "hoonahn": {
      "source": {
        "source": "github",
        "repo": "hoonahn/tint-my-claudecode"
      }
    }
  }
}
```

```bash
# 2. Install plugin
/plugin install tint-my-claudecode

# 3. Run setup to configure hooks
/setup
```

## Skills

### `/setup`
Installs hooks for automatic session color-coding. Run once after installation.

### `/tag-session [color]`
Manually change the current session color.

```
/tag-session            # random reroll
/tag-session violet     # set by name
/tag-session 230        # set by hue angle (0-359)
```

**Color names:** `red` `orange` `yellow` `green` `teal` `blue` `violet` `pink` `rose`

## License

MIT
