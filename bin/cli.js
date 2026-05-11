#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SETTINGS_PATH = path.join(process.env.HOME, '.claude', 'settings.json');
const CLAUDE_JSON_PATH = path.join(process.env.HOME, '.claude.json');
const PROXY_URL = 'https://api.z.ai/api/anthropic';
const VISION_MCP_NAME = 'zai-mcp-server';

const commands = ['proxy', 'direct', 'status'];
const command = process.argv[2];

if (!command || !commands.includes(command)) {
  console.log('Usage: claude-api-switch <command>');
  console.log('Commands:');
  console.log('  proxy   - Switch to proxy endpoint + enable Vision MCP');
  console.log('  direct  - Switch to direct Anthropic API + disable Vision MCP');
  console.log('  status  - Show current mode');
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

function getCurrentMode(settings) {
  if (!settings.env || !settings.env.ANTHROPIC_BASE_URL) {
    return 'direct';
  }
  return settings.env.ANTHROPIC_BASE_URL === PROXY_URL ? 'proxy' : 'unknown';
}

function getVisionMcpStatus(claudeJson) {
  if (!claudeJson.mcpServers || !claudeJson.mcpServers[VISION_MCP_NAME]) {
    return 'disabled';
  }
  return 'enabled';
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

function main() {
  const settings = readSettings();
  const claudeJson = readClaudeJson();

  if (!settings.env) {
    settings.env = {};
  }

  if (command === 'status') {
    const mode = getCurrentMode(settings);
    const visionMcpStatus = getVisionMcpStatus(claudeJson);

    console.log(`Current mode: ${mode}`);
    if (mode === 'proxy') {
      console.log(`Proxy URL: ${settings.env.ANTHROPIC_BASE_URL}`);
    }
    console.log(`Vision MCP: ${visionMcpStatus}`);

    const expectedVisionMcpStatus = mode === 'proxy' ? 'enabled' : 'disabled';
    if (visionMcpStatus !== expectedVisionMcpStatus) {
      console.log(`⚠ Warning: Vision MCP should be ${expectedVisionMcpStatus} for ${mode} mode`);
    }
    return;
  }

  if (command === 'proxy') {
    settings.env.ANTHROPIC_BASE_URL = PROXY_URL;
    enableVisionMcp(claudeJson);

    writeSettings(settings);
    writeClaudeJson(claudeJson);
    console.log('✓ Switched to proxy mode');
    console.log('✓ Vision MCP enabled (for GLM image understanding)');
    return;
  }

  if (command === 'direct') {
    delete settings.env.ANTHROPIC_BASE_URL;
    disableVisionMcp(claudeJson);

    writeSettings(settings);
    writeClaudeJson(claudeJson);
    console.log('✓ Switched to direct Anthropic API');
    console.log('✓ Vision MCP disabled (Claude models are multi-modal)');
    return;
  }
}

main();
