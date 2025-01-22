import { connect, disconnect, setWalletName, DisconnectOptions } from "get-starknet";

export class StarkNetLib {
  private wallet: any = null;

  async connectWallet() {
    try {
      const starknet = await connect();
      
      if (!starknet) {
        throw new Error("No wallet found");
      }

      await starknet.enable();
      this.wallet = starknet;
      return {
        address: starknet.selectedAddress,
        chainId: starknet.chainId
      };
    } catch (error) {
      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  isConnected() {
    return this.wallet !== null;
  }

  getAddress() {
    return this.wallet?.selectedAddress;
  }

  // Exemple de fonction pour un transfert simple
  async transfer(recipient: string, amount: string) {
    if (!this.wallet) {
      throw new Error("Wallet not connected");
    }

    const tx = {
      contractAddress: recipient,
      entrypoint: "transfer",
      calldata: [amount]
    };

    return await this.wallet.account.execute(tx);
  }
  
  async handleDisconnect(options?: DisconnectOptions) {
    return async () => {
      await disconnect({clearLastWallet: true})
      setWalletName("")
    }
  }
}
