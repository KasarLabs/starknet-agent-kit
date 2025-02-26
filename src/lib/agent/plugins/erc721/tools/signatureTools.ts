// tools_signature.ts
import {
    transferFromSchema,
    approveSchema,
    setApprovalForAllSchema,
    safeTransferFromSchema,
    declareDeployERC721Schema
  } from '../schemas/schema';
  import { StarknetSignatureToolRegistry } from 'src/lib/agent/tools/signatureTools';
  import { transferFromSignature } from '../actions/transferFrom';
  import { approveSignature } from '../actions/approve';
  import { setApprovalForAllSignature } from '../actions/setApprovalForAll';
  import { safeTransferFromSignature } from '../actions/safeTransferFrom';
  import { declareAndDeployERC721Signature } from '../actions/declareAndDeploy';
  
  export const registerSignatureToolsERC721 = () => {
    StarknetSignatureToolRegistry.RegisterSignatureTools({
      name: 'erc721_transferFromSignature',
      description: 'Return transferFrom json transaction for ERC721 NFT',
      schema: transferFromSchema,
      execute: transferFromSignature,
    });
  
    StarknetSignatureToolRegistry.RegisterSignatureTools({
      name: 'erc721_approveSignature',
      description: 'Return approve json transaction for ERC721 NFT',
      schema: approveSchema,
      execute: approveSignature,
    });
  
    StarknetSignatureToolRegistry.RegisterSignatureTools({
      name: 'erc721_setApprovalForAllSignature',
      description: 'Return setApprovalForAll json transaction for ERC721 NFT',
      schema: setApprovalForAllSchema,
      execute: setApprovalForAllSignature,
    });
  
    StarknetSignatureToolRegistry.RegisterSignatureTools({
      name: 'erc721_safeTransferFromSignature',
      description: 'Return safeTransferFrom json transaction for ERC721 NFT',
      schema: safeTransferFromSchema,
      execute: safeTransferFromSignature,
    });

    StarknetSignatureToolRegistry.RegisterSignatureTools({
      name: 'erc721_declareAndDeploySignature',
      description: 'Return deployContract json transaction for create and deploy new ERC721 contract',
      schema: declareDeployERC721Schema,
      execute: declareAndDeployERC721Signature
    });
  };