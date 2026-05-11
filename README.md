# Claude API Switcher

A CLI tool to switch between multiple AI models for Claude Code, including GLM (via Z.ai proxy), Anthropic, Kimi, Deepseek, and Minimax.

## Features

- **Multi-model support**: Switch between Anthropic, GLM, Kimi, Deepseek, and Minimax
- **API key management**: Interactive API key setup and storage for each model
- **Vision MCP coordination**: Automatically enables/disables Vision MCP based on model capabilities
- **Smart configuration**: Manages both API endpoints and MCP server configuration
- **Status reporting**: Shows current model, API key status, MCP status, and warnings

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
claude-api-switch list          # List available models
claude-api-switch status        # Show current model + status
claude-api-switch setup <model> # Configure API key for a model
claude-api-switch <model>        # Switch to specific model
```

## Available Models

| Model | Multi-modal | Vision MCP | API Key Env |
|-------|-------------|-------------|-------------|
| **anthropic** | Yes | Disabled | `ANTHROPIC_AUTH_TOKEN` |
| **glm** | No | Enabled | `ANTHROPIC_AUTH_TOKEN` |
| **kimi** | Yes | Disabled | `KIMI_API_KEY` |
| **deepseek** | Yes | Disabled | `DEEPSEEK_API_KEY` |
| **minimax** | Yes | Disabled | `MINIMAX_API_KEY` |

## Model Details

### Anthropic (Opus 4.7)
- **Multi-modal**: Yes (native vision capabilities)
- **API Endpoint**: Default Anthropic endpoint
- **Model Name**: `claude-opus-4.7`
- **Vision MCP**: Not needed (natively multi-modal)

### GLM (via Z.ai proxy)
- **Multi-modal**: No (text-only models)
- **API Endpoint**: `https://api.z.ai/api/anthropic`
- **Model Name**: `glm-4-flashx`
- **Vision MCP**: `zai-mcp-server` (required for image understanding)

### Kimi K2.6 (Moonshot AI)
- **Multi-modal**: Yes (native vision capabilities)
- **API Endpoint**: `https://api.moonshot.ai/v1`
- **Model Name**: `kimi-k2.6`
- **Vision MCP**: Not needed (natively multi-modal)

### Deepseek AI
- **Multi-modal**: Yes (DeepSeek-VL2 mixture-of-experts vision)
- **API Endpoint**: `https://api.deepseek.com`
- **Model Name**: `deepseek-chat`
- **Vision MCP**: Not needed (natively multi-modal)

### Minimax
- **Multi-modal**: Yes (Minimax-VL2.5 multi-modal)
- **API Endpoint**: `https://api.minimaxi.com/anthropic`
- **Model Name**: `minimax-multimodal-vl-2.5`
- **Vision MCP**: Not needed (natively multi-modal)

## Examples

### List available models
```bash
$ claude-api-switch list
Available AI Models:

 anthropic
  Name: Anthropic (Opus 4.7)
  Multi-modal: Native multi-modal
  API Endpoint: default Anthropic endpoint
  Model Name: claude-opus-4.7

 glm
  Name: GLM (via Z.ai proxy)
  Multi-modal: Text-only (needs Vision MCP)
  API Endpoint: https://api.z.ai/api/anthropic
  Model Name: glm-4-flashx

 kimi
  Name: Kimi K2.6 (Moonshot AI)
  Multi-modal: Native multi-modal
  API Endpoint: https://api.moonshot.ai/v1
  Model Name: kimi-k2.6

 deepseek
  Name: Deepseek AI
  Multi-modal: Native multi-modal
  API Endpoint: https://api.deepseek.com
  Model Name: deepseek-chat

 minimax
  Name: Minimax
  Multi-modal: Native multi-modal
  API Endpoint: https://api.minimaxi.com/anthropic
  Model Name: minimax-multimodal-vl-2.5
```

### Check current status
```bash
$ claude-api-switch status
Current Configuration:

Current model: GLM (via Z.ai proxy)
API Endpoint: https://api.z.ai/api/anthropic
Model Name: glm-4-flashx
API Key: ✓ Configured (ANTHROPIC_AUTH_TOKEN)
Vision MCP: ✓ Enabled

Available models: anthropic, glm, kimi, deepseek, minimax
```

### Setup API key for a model
```bash
$ claude-api-switch setup kimi
Setup API key for Kimi K2.6 (Moonshot AI)
API Key Environment Variable: KIMI_API_KEY

Enter your Kimi K2.6 (Moonshot AI) API key: sk-1234567890abc
✓ API key saved for Kimi K2.6 (Moonshot AI)
Stored in: KIMI_API_KEY
```

### Switch to a model
```bash
$ claude-api-switch anthropic
Switching to Anthropic (Opus 4.7)...
✓ Successfully switched to Anthropic (Opus 4.7)
API Key: ANTHROPIC_AUTH_TOKEN
✓ Vision MCP disabled (native multi-modal)
```

## How It Works

The tool manages two configuration files:

**~/.claude/settings.json** (API configuration):
- Stores API keys for each model in environment variables
- Sets/clears API endpoints for different providers
- Maintains current model selection

**~/.claude.json** (MCP server configuration):
- Enables/disables `zai-mcp-server` (Vision MCP) based on model
- Multi-modal models (Anthropic, Kimi, Deepseek, Minimax): Vision MCP disabled
- Text-only models (GLM): Vision MCP enabled

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

3. **Configure API keys for each model you want to use:**
   ```bash
   claude-api-switch setup kimi
   claude-api-switch setup deepseek
   claude-api-switch setup minimax
   ```

**Repo:** https://github.com/MMDigitalOrg/claude-api-switcher

**Package Name:** `@mmdigitalorg/claude-api-switcher` (scoped to MMDigitalOrg organization)

## Notes

- **GLM models** are text-only and require Vision MCP (`zai-mcp-server`) for image understanding
- **Anthropic, Kimi, Deepseek, Minimax** are natively multi-modal and don't need Vision MCP
- **API keys** are stored securely in `~/.claude/settings.json` environment variables
- The tool automatically manages both API endpoint configuration and MCP server coordination
- **Default behavior**: If no model is explicitly set, Claude Code uses default Anthropic endpoint

## License

MIT
