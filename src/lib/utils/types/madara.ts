export interface InstallMadaraParams {
    installDir?: string;
    shell?: 'zsh' | 'bash' | 'fish' | 'ash';
  }
  
  export interface LaunchNodeParams {
    nodeType: 'mainnet' | 'testnet' | 'integration';
    port?: number;
    l1Endpoint: string;
    dataDir?: string;
    customConfig?: Record<string, any>;
  }