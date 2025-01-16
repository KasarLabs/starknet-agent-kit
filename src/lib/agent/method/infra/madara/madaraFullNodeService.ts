// src/lib/agent/method/infra/madara/madaraUpService.ts

import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import { InstallMadaraParams, LaunchNodeParams } from 'src/lib/utils/types/madara';

const execAsync = promisify(exec);

const NETWORK_CONFIGS: Record<LaunchNodeParams['nodeType'], { name: string }> = {
  mainnet: {
    name: 'mainnet'
  },
  testnet: {
    name: 'testnet'
  },
  integration: {
    name: 'integration'
  }
} as const;

async function portAvailable(port: number): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`lsof -i:${port}`);
    return stdout.trim() === '';
  } catch {
    return true;
  }
}

async function createDirIfNotExists(dir: string): Promise<void> {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function checkNodeHealth(port: number, maxAttempts = 5): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`http://localhost:${port}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'starknet_chainId',
          params: [],
          id: 1
        })
      });
      
      if (response.ok) return true;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  return false;
}

export const installMadara = async (input: InstallMadaraParams): Promise<string> => {
  try {
    const homeDir = os.homedir();
    const baseDir = process.env.XDG_CONFIG_HOME || homeDir;
    const madaraDir = input.installDir || path.join(baseDir, '.madara');
    const binDir = path.join(madaraDir, 'bin');
    
    await createDirIfNotExists(binDir);
    
    const binUrl = 'https://raw.githubusercontent.com/madara-alliance/madara/main/madaraup/madaraup';
    const binPath = path.join(binDir, 'madara');
    
    await execAsync(`curl -# -L ${binUrl} -o ${binPath}`);
    await fs.chmod(binPath, '755');

    const shell = input.shell || process.env.SHELL?.split('/').pop() || 'bash';
    const profilePath = path.join(homeDir, shell === 'zsh' ? '.zshrc' : '.bashrc');
    await fs.appendFile(profilePath, `\nexport PATH="$PATH:${binDir}"`);

    return JSON.stringify({
      status: 'success',
      message: `Madara installed successfully. Please run 'source ${profilePath}' to update your PATH.`,
      binPath
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const launchNode = async (input: LaunchNodeParams): Promise<string> => {
  try {
    const network = input.nodeType;
    const port = input.port || 9944;
    const networkConfig = NETWORK_CONFIGS[network];

    // Check port availability
    const isPortFree = await portAvailable(port);
    if (!isPortFree) {
      throw new Error(`Port ${port} is already in use`);
    }

    // Setup directories
    const homeDir = os.homedir();
    const madaraDir = path.join(homeDir, '.madara');
    const logDir = path.join(madaraDir, 'logs');
    const dataDir = input.dataDir || path.join(madaraDir, 'data');
    
    await Promise.all([
      createDirIfNotExists(logDir),
      createDirIfNotExists(dataDir)
    ]);

    const logFile = path.join(logDir, 'node.log');

    // Build command with --full mode
    const command = [
      'madara',
      '--full',
      `--network ${networkConfig.name}`,
      `--rpc-port ${port}`,
      `--l1-endpoint ${input.l1Endpoint}`,
      `--base-path ${dataDir}`
    ];

    // Add any additional custom configuration
    if (input.customConfig) {
      Object.entries(input.customConfig).forEach(([key, value]) => {
        command.push(`--${key} ${value}`);
      });
    }

    console.log('Launching node with command:', command.join(' '));
    await execAsync(`${command.join(' ')} > ${logFile} 2>&1 &`);

    // Check if node started successfully
    const isHealthy = await checkNodeHealth(port);
    if (!isHealthy) {
      const recentLogs = await fs.readFile(logFile, 'utf8')
        .then(content => content.split('\n').slice(-20).join('\n'))
        .catch(() => 'Unable to read logs');

      return JSON.stringify({
        status: 'partial_success',
        message: 'Node process started but not responding to RPC calls',
        endpoint: `http://localhost:${port}`,
        logFile,
        recentLogs
      });
    }

    return JSON.stringify({
      status: 'success',
      message: `Madara ${network} node launched successfully`,
      endpoint: `http://localhost:${port}`,
      logFile,
      network
    });

  } catch (error) {
    console.error('Launch failed:', error);
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};