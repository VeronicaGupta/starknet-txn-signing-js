import { WeierstrassSignatureType, ec, Signer, hash, CallData, RpcProvider, TransactionType, constants, encode, Account, Contract, cairo } from "starknet";

import * as mStarknet from '@scure/starknet';
import * as bip32 from "@scure/bip32";
import * as bip39 from "@scure/bip39";

import { formatBalance, uint8ArrayToHex } from "./utils";
// import { get, uint8ArrayToHex } from "./utils";

const mnemonic = "road donate inch warm beyond sea wink shoot fashion gain put vocal";
const contractclassHashAX = "0x029927c8af6bccf3f6fda035981e765a7bdbf18a2dc0d630494f8758aa908e2b";
const provider = new RpcProvider({ nodeUrl: "https://starknet-goerli.infura.io/v3/6345ca3fadb74eafb7bf38b922258b1e" });
const contractAddress = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
const EthPath = "m/44'/60'/0'/0/0";
const StarkBasePath = "m/44'/9004'/0'/0/";
const address_idx0 = 1;
const address_idx1 = 20;


const run = async () => {

    // ************************ Account Initialisation **********************************************

    const masterSeed = bip39.mnemonicToSeedSync(mnemonic);
    console.log('mnemonic=', mnemonic, "\n");
    console.log('seed=', uint8ArrayToHex(masterSeed), "\n");

    // stark master key derivation
    const hdKey1 = bip32.HDKey.fromMasterSeed(masterSeed).derive(EthPath);
    const hdKey2 = bip32.HDKey.fromMasterSeed(hdKey1.privateKey!)

    console.log('hdKey1 PrivKey=', uint8ArrayToHex(hdKey1.privateKey!));
    console.log('hdKey2 PrivKey=', uint8ArrayToHex(hdKey2.privateKey!), "\n");

    // Account 1
    var path = StarkBasePath + String(address_idx0);
    console.log("path =", path, "\n");
    var hdKeyi = hdKey2.derive(path);
    
    const starkKeyPrivAX0 = "0x" + mStarknet.grindKey(hdKeyi.privateKey!);
    const starkKeyPubAX0 = ec.starkCurve.getStarkKey(starkKeyPrivAX0);
    
    var callData = CallData.compile([starkKeyPubAX0,0]);
    const accountAddressAX0 = hash.calculateContractAddressFromHash(starkKeyPubAX0, contractclassHashAX, callData, 0);
    
    console.log('hdKeyi PrivKey=', uint8ArrayToHex(hdKeyi.privateKey!));
    console.log("privateKey =", starkKeyPrivAX0);
    console.log('publicKey =', starkKeyPubAX0);
    console.log('Account address=', accountAddressAX0, "\n");

    // Account 2
    path = StarkBasePath + String(address_idx1);
    console.log("path =", path, "\n");
    hdKeyi = hdKey2.derive(path);

    const starkKeyPrivAX1 = "0x" + mStarknet.grindKey(hdKeyi.privateKey!);
    const starkKeyPubAX1 = ec.starkCurve.getStarkKey(starkKeyPrivAX1);
    
    callData = CallData.compile([starkKeyPubAX1,0]);
    const accountAddressAX1 = hash.calculateContractAddressFromHash(starkKeyPubAX1, contractclassHashAX, callData, 0);

    console.log('hdKeyi PrivKey=', uint8ArrayToHex(hdKeyi.privateKey!));
    console.log("privateKey =", starkKeyPrivAX1);
    console.log('publicKey =', starkKeyPubAX1);
    console.log('Account address=', accountAddressAX1, "\n");


    // ************************ Account Deployment **********************************************

    const account0 = new Account(provider, accountAddressAX0, starkKeyPrivAX0);
    const account1 = new Account(provider, accountAddressAX1, starkKeyPrivAX1);

    const compiledSierra = provider.getClassAt(contractAddress);
    const contractAX0 = new Contract((await compiledSierra).abi, contractAddress, provider);
    contractAX0.connect(account0);
    console.log("\nAccount Connected to contract..\n");

    // Deploy Account
    // const callDataAX = new CallData((await compiledSierra).abi);
    // callData = callDataAX.compile("constructor", {
    //     owner: starkKeyPubAX0,
    //     guardian: 0
    // });
    // const deployAccountPayload = {
    //     classHash: contractclassHashAX,
    //     constructorCalldata: callData,
    //     contractAddress: accountAddressAX0,
    //     addressSalt: starkKeyPubAX0
    // };
    // const declareResponse = await account0.deployAccount(deployAccountPayload);
    // console.log({declareResponse});
    // await provider.waitForTransaction(declareResponse.transaction_hash);


    // ************************ Declare Contract **********************************************
    // var nonce = await provider.getNonceForAddress(contractAddress);
    // const chainId= constants.StarknetChainId.SN_GOERLI;
    // const txnVersion = 1;
    // const transactionContractDeclareHash = hash.calculateDeclareTransactionHash(contractAddress, accountAddressAX0, txnVersion, 0, chainId, nonce)
    
    // const declareMaxFee = await provider.getDeclareEstimateFee({
    //   contract: {
    //     abi:compiledSierra.abi, 
    //     entry_points_by_type: (await compiledSierra).entry_points_by_type, 
    //     },
    //   senderAddress: accountAddressAX0,
    //   signature: getSignature(starkKeyPrivAX0, transactionContractDeclareHash),
    //   compiledClassHash: contractclassHashAX
    // }, {nonce:nonce[0]})

    // const resp = await account0.declareIfNot({
    //   contract: (await compiledSierra)[0],
    //   compiledClassHash: contractclassHashAX
    // }, {nonce:nonce[0], maxFee:declareMaxFee.overall_fee});


    // ************************ Deploy Contract **********************************************

    // const callDataContract = new CallData((await compiledSierra).abi);
    // const constructor = callDataContract.compile("constructor", { intial_value: 100 });
    // const { suggestedMaxFee: estimatedFee1 } = await account0.estimateDeployFee({ classHash: contractclassHashAX, constructorCalldata: constructor });
    // const deployResponse = await account0.deployContract({
    //     classHash: contractclassHashAX
    // }, { maxFee: 9_000_000_000_000_000 });
    // console.log({deployResponse});

    
    // ************************ Funds Transfer **********************************************
    
    // Execute Transfer Transaction in one call
    const account0InitialBal = await contractAX0.balanceOf(account0.address) as bigint;
    const account1InitialBal = await contractAX0.balanceOf(account1.address) as bigint;
    console.log("Initial Balance 1 =", formatBalance(account0InitialBal, 18));
    console.log("Initial Balance 2 =", formatBalance(account1InitialBal, 18));

    console.log(cairo.uint256(5 * 10 ** 10));
    const transferResponse = await account0.execute(
        {
            contractAddress: contractAX0.address,
            entrypoint: 'transfer',
            calldata: {
              recipient: account1.address,
              amount: cairo.uint256(5 * (10**8)), // 0.00000000500000000
            },
          });
    await provider.waitForTransaction(transferResponse.transaction_hash);
    console.log({transferResponse})

    const account0CurrentBal = await contractAX0.balanceOf(account0.address) as bigint;
    const account1CurrentBal = await contractAX0.balanceOf(account1.address) as bigint;
    console.log("Current Balance 1 =", formatBalance(account0CurrentBal, 18));
    console.log("Current Balance 2 =", formatBalance(account1CurrentBal, 18));

    console.log("Fee Charged for transfer =", (account0InitialBal+account1InitialBal)-(account0CurrentBal+account1CurrentBal));

}

run()
