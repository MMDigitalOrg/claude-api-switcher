#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SETTINGS_PATH = path.join(process.env.HOME, '.claude', 'settings.json');
const PROXY_URL = 'https://api.z.ai/api/anthropic';

const commands = ['proxy', 'direct', 'status'];
const command = process.argv[2];

if (!command || !commands.includes(command)) {
  console.log('Usage: claude-api-switch <command>');
  console.log('Commands:');
  console.log('  proxy   - Switch to proxy endpoint');
  console.log('  direct  - Switch to direct Anthropic API');
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

function getCurrentMode(settings) {
  if (!settings.env || !settings.env.ANTHROPIC_BASE_URL) {
    return 'direct';
  }
  return settings.env.ANTHROPIC_BASE_URL === PROXY_URL ? 'proxy' : 'unknown';
}

function main() {
  const settings = readSettings();

  if (!settings.env) {
    settings.env = {};
  }

  if (command === 'status') {
    const mode = getCurrentMode(settings);
    console.log(`Current mode: ${mode}`);
    if (mode === 'proxy') {
      console.log(`Proxy URL: ${settings.env.ANTHROPIC_BASE_URL}`);
    }
    return;
  }

  if (command === 'proxy') {
    settings.env.ANTHROPIC_BASE_URL = PROXY_URL;
    writeSettings(settings);
    console.log('✓ Switched to proxy mode');
    return;
  }

  if (command === 'direct') {
    delete settings.env.ANTHROPIC_BASE_URL;
    writeSettings(settings);
    console.log('✓ Switched to direct Anthropic API');
    return;
  }
}

main();
