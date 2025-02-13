// import {
//   CallData,
//   RpcProvider,
//   hash,
//   constants,
//   ec,
//   stark,
// } from 'starknet';
// import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
// import {
//   braavos_account_classhash,
//   braavos_proxy_classhash,
//   braavos_intiial_classhash,
// } from '../constant/contract';
// import { DeployBraavosParams } from '../types/deployAccountTypes';

// export const DeployBraavosAccount = async (
//   agent: StarknetAgentInterface,
//   params: DeployBraavosParams
// ) => {
//   try {
//     const provider = agent.getProvider();

//     const initializer = CallData.compile({ public_key: params.publicKey });
//     const constructorCalldata = CallData.compile({
//       implementation_address: braavos_intiial_classhash,
//       initializer_selector: hash.getSelectorFromName('initializer'),
//       calldata: [...initializer]
//     });

//     const txHash = hash.calculateDeployAccountTransactionHash({
//       contractAddress: params.precalculate_address,
//       classHash: braavos_proxy_classhash,
//       constructorCalldata: constructorCalldata,
//       salt: params.publicKey,
//       version: constants.TRANSACTION_VERSION.V2,
//       maxFee: constants.ZERO,
//       chainId: await provider.getChainId(),
//       nonce: constants.ZERO
//     });

//     const parsedOtherSigner = [0, 0, 0, 0, 0, 0, 0];
//     const { r, s } = ec.starkCurve.sign(
//       hash.computeHashOnElements([txHash, braavos_account_classhash, ...parsedOtherSigner]),
//       params.privateKey
//     );

//     const signature = [
//       r.toString(),
//       s.toString(),
//       braavos_account_classhash.toString(),
//       ...parsedOtherSigner.map(e => e.toString())
//     ];

//     const transaction = await provider.deployAccountContract(
//       {
//         classHash: braavos_proxy_classhash,
//         constructorCalldata,
//         addressSalt: params.publicKey,
//         signature
//       },
//       {
//         nonce: constants.ZERO,
//         version: constants.TRANSACTION_VERSION.V2
//       }
//     );

//     console.log(
//       '✅ Braavos wallet deployed at:',
//       transaction.contract_address,
//       ' : ',
//       transaction.transaction_hash
//     );

//     return {
//       status: 'success',
//       wallet: 'Braavos',
//       transaction_hash: transaction.transaction_hash,
//       contract_address: transaction.contract_address
//     };
//   } catch (error) {
//     return {
//       status: 'failure',
//       error: error instanceof Error ? error.message : 'Unknown error'
//     };
//   }
// };

// export const DeployBraavosAccountSignature = async (
//   params: DeployBraavosParams
// ) => {
//   try {
//     const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
    
//     const initializer = CallData.compile({ public_key: params.publicKey });
//     const constructorCalldata = CallData.compile({
//       implementation_address: braavos_intiial_classhash,
//       initializer_selector: hash.getSelectorFromName('initializer'),
//       calldata: [...initializer]
//     });

//     const deployAccountPayload = {
//       classHash: braavos_proxy_classhash,
//       constructorCalldata,
//       addressSalt: params.publicKey
//     };

//     const txHashForEstimate = hash.calculateDeployAccountTransactionHash({
//       contractAddress: params.precalculate_address,
//       classHash: braavos_proxy_classhash,
//       constructorCalldata: constructorCalldata,
//       salt: params.publicKey,
//       version: constants.TRANSACTION_VERSION.V2,
//       maxFee: constants.ZERO,
//       chainId: await provider.getChainId(),
//       nonce: constants.ZERO
//     });

//     const parsedOtherSigner = [0, 0, 0, 0, 0, 0, 0];
//     const { r, s } = ec.starkCurve.sign(
//       hash.computeHashOnElements([txHashForEstimate, braavos_account_classhash, ...parsedOtherSigner]),
//       params.privateKey
//     );

//     const signatureForEstimate = [
//       r.toString(),
//       s.toString(),
//       braavos_account_classhash.toString(),
//       ...parsedOtherSigner.map(e => e.toString())
//     ];

//     const estimatedFee = await provider.getDeployAccountEstimateFee(
//       { ...deployAccountPayload, signature: signatureForEstimate },
//       { version: constants.TRANSACTION_VERSION.V2, nonce: constants.ZERO }
//     );

//     const maxFee = stark.estimatedFeeToMaxFee(estimatedFee.overall_fee);

//     const transaction = await provider.deployAccountContract(
//       {
//         classHash: braavos_proxy_classhash,
//         constructorCalldata,
//         addressSalt: params.publicKey,
//         signature: signatureForEstimate
//       },
//       {
//         nonce: constants.ZERO,
//         maxFee,
//         version: constants.TRANSACTION_VERSION.V2
//       }
//     );

//     console.log(
//       '✅ Braavos wallet with signature deployed at:',
//       transaction.contract_address,
//       ' : ',
//       transaction.transaction_hash
//     );

//     return JSON.stringify({
//       status: 'success',
//       wallet: 'Braavos',
//       transaction_hash: transaction.transaction_hash,
//       contract_address: transaction.contract_address
//     });
//   } catch (error) {
//     return JSON.stringify({
//       status: 'failure',
//       error: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };
