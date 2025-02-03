import { connect } from '@starknet-io/get-starknet'; // v4.0.3 min
import { WalletAccount, RpcProvider } from 'starknet'; // v6.18.0 min

export const connectWallet = async (): Promise<WalletAccount | undefined> => {
  try {
    const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
    if (RPC_URL == null) {
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
    console.log('Error :', error);
    return;
  }
};
