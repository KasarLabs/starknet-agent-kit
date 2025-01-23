import { connect } from '@starknet-io/get-starknet'; // v4.0.3 min
import { WalletAccount, wallet, RpcProvider, RPC } from 'starknet'; // v6.18.0 min

interface StarknetWallet {
  connectWallet: () => Promise<string>;
  disconnect: () => void;
}

export const connectWallet = async (): Promise<WalletAccount|undefined> => {
  try {
    const RPC_URL = "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_7/Xj-rCxxzGcBnS3HwqOnBqO8TMa8NRGky";
    if (RPC_URL == null) {
      console.log(RPC_URL)
      throw new Error(
        'The Rpc account is not setup in the front-end .env file '
      );
    }
    const provider = new RpcProvider({ nodeUrl: RPC_URL });

    const selectedWallet = await connect({
      modalMode: 'alwaysAsk',
      modalTheme: 'dark',
    });
    if (selectedWallet == null) {
      throw new Error('Error with your selected wallet ');
    }
    const myWalletAccount = await WalletAccount.connect(
      provider,
      selectedWallet
    );
    return myWalletAccount;
  } catch (error) {
    console.log("Error :", error);
    return 
  }
};
