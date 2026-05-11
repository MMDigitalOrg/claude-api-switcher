# Claude API Switcher

A simple CLI tool to switch between using Anthropic API through a proxy endpoint and the official Anthropic API directly for Claude Code.

## Installation

### Global Install
```bash
npm install -g claude-api-switcher
```

### Run with npx (no installation needed)
```bash
npx claude-api-switcher status
```

### Clone and Install Locally
```bash
git clone <repo-url>
cd claude-api-switcher
npm install -g .
```

## Usage

```bash
claude-api-switch proxy     # Switch to proxy endpoint
claude-api-switch direct    # Switch to direct Anthropic API
claude-api-switch status    # Show current mode
```

## What It Does

This tool modifies your Claude Code settings at `~/.claude/settings.json`:

- **Proxy mode**: Sets `ANTHROPIC_BASE_URL` to `https://api.z.ai/api/anthropic`
- **Direct mode**: Removes `ANTHROPIC_BASE_URL` entirely (uses default Anthropic endpoint)
- **Status**: Shows the current mode and proxy URL (if in proxy mode)

## Setup for Different Computers

1. Push this repo to GitHub
2. On each computer:
   ```bash
   npm install -g <your-github-username>/claude-api-switcher
   ```
   Or use npx without installation:
   ```bash
   npx <your-github-username>/claude-api-switcher status
   ```

## License

MIT
