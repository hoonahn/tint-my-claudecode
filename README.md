# tint-my-claudecode

Automatically assigns a unique color tint to each Claude Code terminal session — identify sessions at a glance without reading context.

## How it works

- On session start: derives a deterministic color from the session ID (360 unique hues via HSL)
- Applies a subtle background tint (20% blend over dark base)
- On session end: resets to default terminal background
- Same session always gets the same color (deterministic, not random)

## Terminal support

| Terminal | Background tint |
|----------|-----------------|
| Ghostty / cmux | ✅ |
| iTerm2 | ✅ |
| Others | ❌ |

## Installation

```bash
curl -fsSL https://raw.githubusercontent.com/hoonahn/tint-my-claudecode/main/install.sh | bash
```

The installer runs a Claude Code agent that handles everything automatically.

## Skills

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
