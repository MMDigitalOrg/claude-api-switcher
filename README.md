# Claude API Switcher

A CLI tool to switch between using Anthropic API through a proxy endpoint (GLM models) and the official Anthropic API directly (Claude models) for Claude Code.

## Features

- **API Endpoint Switching**: Toggle between proxy and direct Anthropic API
- **Vision MCP Management**: Automatically enables/disables Vision MCP based on model capabilities
- **Smart Coordination**: Ensures API mode and MCP configuration stay in sync
- **Status Reporting**: Shows current mode with warnings for mismatched states

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
claude-api-switch proxy     # Switch to proxy + enable Vision MCP (GLM models)
claude-api-switch direct    # Switch to direct Anthropic API + disable Vision MCP (Claude models)
claude-api-switch status    # Show current mode and Vision MCP status
```

## What It Does

This tool modifies your Claude Code configuration:

**API Configuration** (`~/.claude/settings.json`):
- **Proxy mode**: Sets `ANTHROPIC_BASE_URL` to `https://api.z.ai/api/anthropic` (GLM models)
- **Direct mode**: Removes `ANTHROPIC_BASE_URL` (uses default Anthropic endpoint - Claude models)

**MCP Server Configuration** (`~/.claude.json`):
- **Proxy mode**: Enables `zai-mcp-server` (Vision MCP) for image understanding
- **Direct mode**: Disables `zai-mcp-server` (Claude models are natively multi-modal)

## Model Capabilities

| API Mode | Models | Multi-modal | Vision MCP |
|----------|--------|-------------|-------------|
| Proxy | GLM | No | ✅ Enabled |
| Direct | Claude (Opus 4.7, Sonnet 4.6) | Yes | ❌ Disabled |

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
