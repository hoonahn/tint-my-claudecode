#!/usr/bin/env bash
set -e

REPO="hoonahn/tint-my-claudecode"
RAW="https://raw.githubusercontent.com/${REPO}/main"

echo "🎨 Installing tint-my-claudecode..."
echo ""

# Check for claude CLI
if ! command -v claude &>/dev/null; then
  echo "❌ Claude Code CLI not found."
  echo "   Install it from: https://claude.ai/code"
  exit 1
fi

# Download install prompt and run agent
PROMPT=$(curl -fsSL "${RAW}/install-prompt.md")

echo "🤖 Running Claude Code agent to handle installation..."
echo ""

claude -p "$PROMPT" \
  --allowedTools "Read,Write,Edit,Bash(mkdir:*),Bash(chmod:*),Bash(node:*),Bash(gh:*)" \
  --output-format text

echo ""
echo "🎨 Setup complete. Restart Claude Code to activate."
