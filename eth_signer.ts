import { AlchemyProvider } from '@ethersproject/providers';
import { Wallet } from "@ethersproject/wallet";
import { x } from "@imtbl/sdk";

const {
    generateStarkPrivateKey,
    createStarkSigner
} = x;

const apiKey = '<YOUR_ALCHEMY_API_KEY>';
const ethPrivateKey = '<YOUR ETH PRIVATE KEY>';

// Create Ethereum signer
const ethNetwork = 'sepolia'; // Or 'mainnet'
const provider = new AlchemyProvider(ethNetwork, apiKey);
const ethSigner = new Wallet(ethPrivateKey).connect(provider);

// Create Stark signer
const starkPrivateKey = generateStarkPrivateKey(); // Or retrieve previously generated key
const starkSigner = createStarkSigner(starkPrivateKey);