import { RPC_URL } from "src/lib/constant";
import {
  RpcProvider,
  Account,
  Contract,
  starknetId,
  num,
  uint256,
  BigNumberish,
} from "starknet";

// Adresse du contrat ETH sur StarkNet mainnet
const ETH_ADDRESS =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

// ABI minimal pour interagir avec l'ERC20 ETH sur StarkNet (ici, on ne met que approve)
const ethAbi = [
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "felt" },
      { name: "amount", type: "Uint256" },
    ],
    outputs: [],
  },
  // Vous pouvez ajouter d'autres méthodes si besoin, ex: "transfer", "balanceOf", etc.
];

// Adresses StarkNet ID
const STARKNETID_NAMING_CONTRACT =
  "0x06ac597f8116f886fa1c97a23fa4e08299975ecaf6b598873ca6792b9bbfb678";
const STARKNETID_IDENTITY_CONTRACT =
  "0x0783a9097b26eae0586373b2ce0ed3529ddc44069d1e0fbc4f66d42b69d6850d";

// ABI pour le Naming contract
const namingABI = [
  {
    name: "buy",
    type: "function",
    inputs: [
      { name: "id", type: "felt" }, // ou "u128"
      { name: "domain", type: "felt" }, // ou "felt252"
      { name: "days", type: "felt" }, // ou "u16"
      { name: "resolver", type: "felt" }, // contract address
      { name: "sponsor", type: "felt" }, // contract address
      { name: "discount_id", type: "felt" }, // felt
      { name: "metadata", type: "felt" }, // felt
    ],
    outputs: [],
  },
  {
    inputs: [
      { name: "domain_len", type: "felt" },
      { name: "domain", type: "felt*" },
    ],
    name: "domain_to_id",
    outputs: [{ name: "token_id", type: "felt" }],
    type: "function",
  },
];

export type CreateDomainParams = {
  domain: string;
  recipient: string;
};

export const createDomain = async (
  params: CreateDomainParams,
  privateKey: string
) => {
  try {
    const walletAddress = process.env.PUBLIC_ADDRESS;
    if (!walletAddress) {
      throw new Error("Wallet address not configured");
    }

    // Vérifie le format du domaine
    const isValidDomain = /^[a-z0-9][a-z0-9-]{0,47}\.stark$/.test(params.domain);
    if (!isValidDomain) {
      throw new Error(
        "Invalid domain format. Must be lowercase alphanumeric, may include hyphens, and end with .stark"
      );
    }

    // Initialise le provider et le compte
    const provider = new RpcProvider({ nodeUrl: RPC_URL });
    const account = new Account(provider, walletAddress, privateKey);

    // Prépare l'encodage du domaine
    const domainName = params.domain.replace(".stark", "");
    const encodedDomain = starknetId.useEncoded(domainName);
    console.log("Debug - Encoded domain:", encodedDomain);
    console.log("Debug - Domain name:", domainName);

    // 1) Créer une instance du contrat ETH pour faire le approve
    const ethContract = new Contract(ethAbi, ETH_ADDRESS, provider);
    ethContract.connect(account);

    // Déterminer le montant à approuver, par ex. 0.05 ETH
    // 0.05 * 10^18 = 50000000000000000 (pour 18 décimales)
    const rawAmount = BigInt("50000000000000000");
    const amountUint256 = uint256.bnToUint256(rawAmount);

    // Prépare la transaction 'approve'
    const approveCalldata = {
      contractAddress: ETH_ADDRESS,
      entrypoint: "approve",
      calldata: [
        STARKNETID_NAMING_CONTRACT, // spender
        amountUint256.low.toString(),
        amountUint256.high.toString(),
      ],
    };

    console.log("Debug - Approve calldata:", approveCalldata);

    // Estime et exécute l'approbation
    const approveEstimatedFee = await account.estimateInvokeFee(approveCalldata);
    const approveTx = await account.execute(approveCalldata, undefined, {
      maxFee: approveEstimatedFee.suggestedMaxFee,
    });

    console.log("Approve transaction hash:", approveTx.transaction_hash);

    // On attend la confirmation de l'approbation
    await provider.waitForTransaction(approveTx.transaction_hash, {
      retryInterval: 2000,
    });
    console.log("Approve confirmed");

    // 2) Créer l’instance du naming contract
    const namingContract = new Contract(namingABI, STARKNETID_NAMING_CONTRACT, provider);
    namingContract.connect(account);

    // 3) Appel de la fonction buy
    const buyCalldata = {
      contractAddress: STARKNETID_NAMING_CONTRACT,
      entrypoint: "buy",
      calldata: [
        // id (u128)
        num.toHex(1),
        // domain (felt252)
        num.toHex(encodedDomain),
        // days (u16) - ici 91, par ex. ~3 mois
        num.toHex(91),
        // resolver (contract address)
        num.toHex(0),
        // sponsor (contract address)
        num.toHex(0),
        // discount_id (felt252)
        num.toHex(0),
        // metadata (felt252)
        num.toHex(0),
      ],
    };

    console.log("Debug - Buy calldata:", buyCalldata);

    const estimatedFee = await account.estimateInvokeFee(buyCalldata);
    const buyTx = await account.execute(buyCalldata, undefined, {
      maxFee: estimatedFee.suggestedMaxFee,
    });

    console.log("Buy transaction hash:", buyTx.transaction_hash);

    // Attend la fin de la transaction "buy"
    await provider.waitForTransaction(buyTx.transaction_hash, {
      retryInterval: 2000,
    });

    // 4) Récupère le token ID
    const domainToIdResponse = await namingContract.call("domain_to_id", [
      num.toHex(1),
      num.toHex(encodedDomain),
    ]);
    const tokenId = domainToIdResponse[0];
    console.log("Token ID:", tokenId);

    // 5) Effectue le transfer vers le destinataire
    const transferCalldata = {
      contractAddress: STARKNETID_IDENTITY_CONTRACT,
      entrypoint: "transfer",
      calldata: [
        num.toHex(account.address),
        num.toHex(params.recipient),
        num.toHex(tokenId),
      ],
    };

    const transferTx = await account.execute(transferCalldata);
    console.log("Transfer transaction hash:", transferTx.transaction_hash);

    await provider.waitForTransaction(transferTx.transaction_hash);

    return {
      status: "success",
      approve_transaction_hash: approveTx.transaction_hash,
      buy_transaction_hash: buyTx.transaction_hash,
      transfer_transaction_hash: transferTx.transaction_hash,
      domain: params.domain,
      recipient: params.recipient,
      token_id: tokenId.toString(),
    };
  } catch (error) {
    console.error("Error creating domain:", error);
    throw error;
  }
};
