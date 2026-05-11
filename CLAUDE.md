# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude API Switcher is a CLI tool that manages Claude Code's AI model configuration. It switches between multiple model providers (Anthropic, GLM, Kimi, Deepseek, Minimax) by modifying two configuration files:

1. **~/.claude/settings.json** - Stores API keys and endpoint overrides for each model
2. **~/.claude.json** - Manages MCP server configuration, specifically enabling/disabling the Vision MCP (`zai-mcp-server`)

## Architecture

### Model Configuration

All models are defined in `bin/cli.js` under the `MODELS` constant. Each model configuration includes:

| Property | Purpose |
|----------|---------|
| `name` | Display name for the model |
| `multiModal` | Whether the model has native vision capabilities |
| `visionMcp` | Name of Vision MCP server needed (or `null` if natively multi-modal) |
| `apiKeyEnv` | Environment variable name for the API key |
| `apiEndpointEnv` | Environment variable name for the API endpoint (custom or override) |
| `defaultEndpoint` | Custom API endpoint URL, or `null` for default Anthropic endpoint |
| `modelName` | The Claude Code model name to use |

### Key Design Decisions

- **GLM models** are text-only and require Vision MCP (`zai-mcp-server`) for image understanding
- **Anthropic, Kimi, Deepseek, Minimax** are natively multi-modal and don't need Vision MCP
- When switching to a multi-modal model: Vision MCP is disabled from `.claude.json`
- When switching to GLM: Vision MCP is enabled in `.claude.json` with `npx -y @z_ai/mcp-server`

### Configuration Files

**~/.claude/settings.json** structure:
```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "...",
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",  // set for non-Anthropic endpoints
    "KIMI_API_KEY": "...",
    "DEEPSEEK_API_KEY": "...",
    "MINIMAX_API_KEY": "..."
  }
}
```

**~/.claude.json** structure:
```json
{
  "mcpServers": {
    "zai-mcp-server": {  // only present when GLM is active
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@z_ai/mcp-server"],
      "env": {
        "Z_AI_MODE": "ZAI",
        "Z_AI_API_KEY": "..."
      }
    }
  }
}
```

## Development

### Testing

```bash
node bin/cli.js status    # Test status command
```

The `npm test` script runs this command.

### Adding a New Model

To add a new AI model provider:

1. Add a new entry to the `MODELS` object in `bin/cli.js` with all required properties
2. Determine if the model is natively multi-modal or needs Vision MCP
3. Set `defaultEndpoint` to the provider's API URL if not using Anthropic's default

### No Build Step

This is a zero-dependency Node.js CLI. Changes to `bin/cli.js` take effect immediately after running with node or npm linking.

### Installation Commands

```bash
npm install -g .               # Local install after cloning
npm install -g github:MMDigitalOrg/claude-api-switcher  # Direct from GitHub
npx github:MMDigitalOrg/claude-api-switcher <command>  # No install
```
