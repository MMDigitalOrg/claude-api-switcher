#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SETTINGS_PATH = path.join(process.env.HOME, '.claude', 'settings.json');
const CLAUDE_JSON_PATH = path.join(process.env.HOME, '.claude.json');
const VISION_MCP_NAME = 'zai-mcp-server';

const MODELS = {
  anthropic: {
    name: 'Anthropic (Opus 4.7)',
    multiModal: true,
    visionMcp: null,
    apiKeyEnv: 'ANTHROPIC_AUTH_TOKEN',
    apiEndpointEnv: 'ANTHROPIC_BASE_URL',
    defaultEndpoint: null,
    modelName: 'claude-opus-4.7'
  },
  glm: {
    name: 'GLM (via Z.ai proxy)',
    multiModal: false,
    visionMcp: 'zai-mcp-server',
    apiKeyEnv: 'ANTHROPIC_AUTH_TOKEN',
    apiEndpointEnv: 'ANTHROPIC_BASE_URL',
    defaultEndpoint: 'https://api.z.ai/api/anthropic',
    modelName: 'glm-4-flashx'
  },
  kimi: {
    name: 'Kimi K2.6 (Moonshot AI)',
    multiModal: true,
    visionMcp: null,
    apiKeyEnv: 'KIMI_API_KEY',
    apiEndpointEnv: 'KIMI_BASE_URL',
    defaultEndpoint: 'https://api.moonshot.ai/v1',
    modelName: 'kimi-k2.6'
  },
  deepseek: {
    name: 'Deepseek AI',
    multiModal: true,
    visionMcp: null,
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    apiEndpointEnv: 'DEEPSEEK_BASE_URL',
    defaultEndpoint: 'https://api.deepseek.com',
    modelName: 'deepseek-chat'
  },
  minimax: {
    name: 'Minimax',
    multiModal: true,
    visionMcp: null,
    apiKeyEnv: 'MINIMAX_API_KEY',
    apiEndpointEnv: 'MINIMAX_BASE_URL',
    defaultEndpoint: 'https://api.minimaxi.com/anthropic',
    modelName: 'minimax-multimodal-vl-2.5'
  }
};

const COMMANDS = ['list', 'status', 'setup'];
const MODEL_KEYS = Object.keys(MODELS);
const ALL_COMMANDS = [...COMMANDS, ...MODEL_KEYS];
const command = process.argv[2];
const modelArgument = process.argv[3];

if (!command || !ALL_COMMANDS.includes(command)) {
  console.log('Usage: claude-api-switch <command>');
  console.log('Commands:');
  console.log('  list       - List available models');
  console.log('  status     - Show current model + status');
  console.log('  setup <model> - Configure API key for a model');
  console.log('  <model>    - Switch to specific model');
  console.log('');
  console.log('Available models:', MODEL_KEYS.join(', '));
  process.exit(1);
}

function readSettings() {
  try {
    const data = fs.readFileSync(SETTINGS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading settings.json:', error.message);
    process.exit(1);
  }
}

function writeSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing settings.json:', error.message);
    process.exit(1);
  }
}

function readClaudeJson() {
  try {
    const data = fs.readFileSync(CLAUDE_JSON_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading .claude.json:', error.message);
    process.exit(1);
  }
}

function writeClaudeJson(claudeJson) {
  try {
    fs.writeFileSync(CLAUDE_JSON_PATH, JSON.stringify(claudeJson, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing .claude.json:', error.message);
    process.exit(1);
  }
}

function getCurrentModel(settings) {
  if (!settings.env) {
    return null;
  }

  for (const [modelKey, modelConfig] of Object.entries(MODELS)) {
    const apiKey = settings.env[modelConfig.apiKeyEnv];
    const endpoint = settings.env[modelConfig.apiEndpointEnv];

    if (apiKey) {
      if (modelConfig.defaultEndpoint) {
        if (endpoint === modelConfig.defaultEndpoint) {
          return modelKey;
        }
      } else {
        if (!endpoint) {
          return modelKey;
        }
      }
    }
  }

  return null;
}

function getApiKeyStatus(settings, modelKey) {
  const modelConfig = MODELS[modelKey];
  if (!settings.env) {
    return 'not configured';
  }
  return settings.env[modelConfig.apiKeyEnv] ? 'configured' : 'not configured';
}

function getVisionMcpStatus(claudeJson, modelKey) {
  if (!claudeJson.mcpServers) {
    return 'disabled';
  }

  const modelConfig = MODELS[modelKey];
  if (modelConfig.visionMcp) {
    return claudeJson.mcpServers[modelConfig.visionMcp] ? 'enabled' : 'disabled';
  }

  return 'disabled';
}

function enableVisionMcp(claudeJson) {
  if (!claudeJson.mcpServers) {
    claudeJson.mcpServers = {};
  }

  claudeJson.mcpServers[VISION_MCP_NAME] = {
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@z_ai/mcp-server'],
    env: {
      Z_AI_MODE: 'ZAI',
      Z_AI_API_KEY: claudeJson.mcpServers[VISION_MCP_NAME]?.env?.Z_AI_API_KEY || process.env.Z_AI_API_KEY
    }
  };
}

function disableVisionMcp(claudeJson) {
  if (claudeJson.mcpServers && claudeJson.mcpServers[VISION_MCP_NAME]) {
    delete claudeJson.mcpServers[VISION_MCP_NAME];
  }
}

function setupApiKey(modelKey) {
  const modelConfig = MODELS[modelKey];

  console.log(`Setup API key for ${modelConfig.name}`);
  console.log(`API Key Environment Variable: ${modelConfig.apiKeyEnv}`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(`Enter your ${modelConfig.name} API key: `, (apiKey) => {
    if (!apiKey || apiKey.trim() === '') {
      console.log('API key cannot be empty. Setup cancelled.');
      rl.close();
      process.exit(1);
    }

    const settings = readSettings();
    if (!settings.env) {
      settings.env = {};
    }

    settings.env[modelConfig.apiKeyEnv] = apiKey.trim();
    writeSettings(settings);

    console.log(`API key saved for ${modelConfig.name}`);
    console.log(`Stored in: ${modelConfig.apiKeyEnv}`);
    rl.close();
  });
}

function listModels() {
  console.log('\nAvailable AI Models:\n');

  for (const [modelKey, modelConfig] of Object.entries(MODELS)) {
    const multiModalStatus = modelConfig.multiModal ? 'Native multi-modal' : 'Text-only (needs Vision MCP)';
    const endpoint = modelConfig.defaultEndpoint || 'default Anthropic endpoint';

    console.log(` ${modelKey}`);
    console.log(`  Name: ${modelConfig.name}`);
    console.log(`  Multi-modal: ${multiModalStatus}`);
    console.log(`  API Endpoint: ${endpoint}`);
    console.log(`  Model Name: ${modelConfig.modelName}`);
    console.log('');
  }
}

function showStatus() {
  const settings = readSettings();
  const claudeJson = readClaudeJson();
  const currentModel = getCurrentModel(settings);

  console.log('\nCurrent Configuration:\n');

  if (currentModel) {
    const modelConfig = MODELS[currentModel];
    console.log(`Current model: ${modelConfig.name}`);

    const endpoint = settings.env[modelConfig.apiEndpointEnv] || modelConfig.defaultEndpoint;
    console.log(`API Endpoint: ${endpoint}`);
    console.log(`Model Name: ${modelConfig.modelName}`);

    const apiKeyStatus = getApiKeyStatus(settings, currentModel);
    const apiKeyDisplay = apiKeyStatus === 'configured' ? 'Configured' : 'Not configured';
    console.log(`API Key: ${apiKeyDisplay} (${modelConfig.apiKeyEnv})`);

    const visionMcpStatus = getVisionMcpStatus(claudeJson, currentModel);
    const visionMcpDisplay = visionMcpStatus === 'enabled' ? 'Enabled' : 'Disabled';
    console.log(`Vision MCP: ${visionMcpDisplay}`);

    if (modelConfig.multiModal) {
      console.log(`Note: This model is natively multi-modal - Vision MCP not needed`);
    }
  } else {
    console.log('Current model: None (using default Anthropic)');
    console.log('To configure a model, run: claude-api-switch setup <model>');
  }

  console.log('');
  console.log('Available models:', MODEL_KEYS.join(', '));
}

function switchModel(modelKey) {
  const modelConfig = MODELS[modelKey];

  if (!modelConfig) {
    console.log(`Unknown model: ${modelKey}`);
    console.log('Available models:', MODEL_KEYS.join(', '));
    process.exit(1);
  }

  const settings = readSettings();
  const claudeJson = readClaudeJson();

  if (!settings.env) {
    settings.env = {};
  }

  const apiKey = settings.env[modelConfig.apiKeyEnv];
  if (!apiKey) {
    console.log(`API key not configured for ${modelConfig.name}`);
    console.log(`Please run: claude-api-switch setup ${modelKey}`);
    console.log(`Environment variable: ${modelConfig.apiKeyEnv}`);
    process.exit(1);
  }

  console.log(`Switching to ${modelConfig.name}...`);

  if (modelConfig.apiEndpointEnv) {
    if (modelConfig.defaultEndpoint) {
      settings.env[modelConfig.apiEndpointEnv] = modelConfig.defaultEndpoint;
    } else {
      delete settings.env[modelConfig.apiEndpointEnv];
    }
  }

  if (modelConfig.multiModal) {
    disableVisionMcp(claudeJson);
    console.log('Vision MCP disabled (native multi-modal)');
  } else {
    enableVisionMcp(claudeJson);
    console.log('Vision MCP enabled (for image understanding)');
  }

  writeSettings(settings);
  writeClaudeJson(claudeJson);

  console.log(`Successfully switched to ${modelConfig.name}`);
  console.log(`API Key: ${modelConfig.apiKeyEnv}`);

  if (modelConfig.apiEndpointEnv && settings.env[modelConfig.apiEndpointEnv]) {
    console.log(`API Endpoint: ${settings.env[modelConfig.apiEndpointEnv]}`);
  }
}

function main() {
  if (command === 'list') {
    listModels();
    return;
  }

  if (command === 'status') {
    showStatus();
    return;
  }

  if (command === 'setup') {
    if (!modelArgument) {
      console.log('Usage: claude-api-switch setup <model>');
      console.log('Available models:', MODEL_KEYS.join(', '));
      process.exit(1);
    }

    if (!MODELS[modelArgument]) {
      console.log(`Unknown model: ${modelArgument}`);
      console.log('Available models:', MODEL_KEYS.join(', '));
      process.exit(1);
    }

    setupApiKey(modelArgument);
    return;
  }

  if (!modelArgument) {
    console.log('Usage: claude-api-switch <model>');
    console.log('Available models:', MODEL_KEYS.join(', '));
    process.exit(1);
  }

  switchModel(modelArgument);
}

main();