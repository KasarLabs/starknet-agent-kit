import { RpcProvider } from 'starknet';
import * as fs from 'fs';
import { CreateOZAccountSignature } from 'src/lib/agent/plugins/openzeppelin/actions/createAccount';
import { DeployOZAccountSignature } from 'src/lib/agent/plugins/openzeppelin/actions/deployAccount';

describe('OZ Account Creation and Deployment', () => {
    let provider: RpcProvider;

    beforeAll(() => {
        provider = new RpcProvider({ 
            nodeUrl: process.env.STARKNET_RPC_URL
        });
    });

    it('should create a new account and save details', async () => {
        if (process.env.RUN_DEPLOYMENT_TEST) {
            return;
        }

        const result = await CreateOZAccountSignature();
        
        const accountData = JSON.parse(result);

        if (accountData.status !== 'success') {
            console.log(accountData.error);
        }
        expect(accountData.deployStatus).toBe('success');
        expect(accountData.transaction_type).toBe('CREATE_ACCOUNT');
        expect(accountData.wallet).toBe('OpenZeppelin');
    
        expect(accountData.publicKey).toMatch(/^0x[a-fA-F0-9]+$/);
        expect(accountData.privateKey).toMatch(/^0x[a-fA-F0-9]+$/);
        expect(accountData.contractAddress).toMatch(/^0x[a-fA-F0-9]+$/);

        console.log('\n=== DÉTAILS DU COMPTE ===');
        console.log('Adresse:', accountData.contractAddress);
        console.log('Clé publique:', accountData.publicKey);
        console.log('Clé privée:', accountData.privateKey);
        console.log('\nFrais de déploiement estimés:', accountData.deployFee.overall_fee);
        
        const accountInfo = {
            ...accountData,
        };
        
        fs.writeFileSync('account_details.json', JSON.stringify(accountInfo, null, 2));
        
    }, 30000); // Timeout de 30 secondes


    it('should deploy the account', async () => {
        if (!process.env.RUN_DEPLOYMENT_TEST) {
            console.log('Test de déploiement ignoré. Définissez RUN_DEPLOYMENT_TEST=true pour l\'exécuter');
            return;
        }

        const accountDetails = JSON.parse(fs.readFileSync('account_details.json', 'utf8'));
        
        console.log('\nDéploiement du compte...');
        const result = await DeployOZAccountSignature(accountDetails);
        
        const deployResult = JSON.parse(result);
        expect(deployResult.status).toBe('success');
        
        if (deployResult.status === 'success') {
            console.log('Compte déployé avec succès!');
            console.log('Hash de transaction:', deployResult.transactionHash);
        } else {
            console.error('Échec du déploiement:', deployResult.error);
        }
    }, 300000); // Timeout de 5 minutes pour le déploiement
});