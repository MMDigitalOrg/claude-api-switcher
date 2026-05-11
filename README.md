# Claude API Switcher

A simple CLI tool to switch between using Anthropic API through a proxy endpoint and the official Anthropic API directly for Claude Code.

## Installation

### Global Install
```bash
npm install -g github:MMDigitalOrg/claude-api-switcher
```

### Run with npx (no installation needed)
```bash
npx github:MMDigitalOrg/claude-api-switcher status
```

### Clone and Install Locally
```bash
git clone https://github.com/MMDigitalOrg/claude-api-switcher.git
cd claude-api-switcher
npm install -g .
# This installs as @mmdigitalorg/claude-api-switcher
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

On each computer:

1. **Install directly from GitHub:**
   ```bash
   npm install -g github:MMDigitalOrg/claude-api-switcher
   ```

2. **Or use npx without installation:**
   ```bash
   npx github:MMDigitalOrg/claude-api-switcher status
   ```

**Repo:** https://github.com/MMDigitalOrg/claude-api-switcher

**Package Name:** `@mmdigitalorg/claude-api-switcher` (scoped to MMDigitalOrg organization)

## License

MIT
