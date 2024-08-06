import { WeierstrassSignatureType, ec, Signer, hash, CallData, RpcProvider, TransactionType, constants, encode } from "starknet";

import * as mStarknet from '@scure/starknet';
import * as bip32 from "@scure/bip32";
import * as bip39 from '@scure/bip39';

const address_idx = 12;

const mnemonic = "road donate inch warm beyond sea wink shoot fashion gain put vocal";
const contractAXclassHash = "0x029927c8af6bccf3f6fda035981e765a7bdbf18a2dc0d630494f8758aa908e2b";

const run = async () => {

    const masterSeed = bip39.mnemonicToSeedSync(mnemonic);
    console.log('mnemonic=', mnemonic, "\n");
    console.log('seed=', uint8ArrayToHex(masterSeed), "\n");


    // stark master key derivation
    const hdKey1 = bip32.HDKey.fromMasterSeed(masterSeed).derive("m/44'/60'/0'/0/0");
    const hdKey2 = bip32.HDKey.fromMasterSeed(hdKey1.privateKey!)

    console.log('hdKey1 PrivKey=', uint8ArrayToHex(hdKey1.privateKey!));
    console.log('hdKey2 PrivKey=', uint8ArrayToHex(hdKey2.privateKey!), "\n");

    const pathBase = "m/44'/9004'/0'/0/";

    const path = pathBase + String(address_idx);
    console.log("path =", path, "\n");

    const hdKeyi = hdKey2.derive(path);
    console.log('hdKeyi PrivKey=', uint8ArrayToHex(hdKeyi.privateKey!));


    // get stark PrivKey, PubKey and AccountAddress 

    const starkKeyPrivAX = "0x" + mStarknet.grindKey(hdKeyi.privateKey!);
    console.log("privateKey =", starkKeyPrivAX);

    const starkKeyPubAX = ec.starkCurve.getStarkKey(starkKeyPrivAX);
    console.log('publicKey =', starkKeyPubAX);
    
    const constructorAXCallData=CallData.compile([starkKeyPubAX,0]);
    const accountAXAddress = hash.calculateContractAddressFromHash(starkKeyPubAX, contractAXclassHash, constructorAXCallData, 0);
    console.log('Account address=', accountAXAddress, "\n");


    // ************************Start Account Deployment txn**********************************************

    const provider = new RpcProvider({ nodeUrl: "https://starknet-goerli.infura.io/v3/6345ca3fadb74eafb7bf38b922258b1e" });
    
    // Get txn details
    // console.log("TransactionByHash: ", await provider.getTransactionByHash("0x2c95c8b580664c1a2a8281ff0ac54ad7ff0e0b96ee778ed364cdd1f3f6dc84b"));


    // Prepare unsigned transaction hash

    const txnVersion = 1;
    const maxFee = 0x8110e6d36a8;
    const transactionAXDeployHash = hash.calculateDeployAccountTransactionHash(accountAXAddress, contractAXclassHash, constructorAXCallData, starkKeyPubAX, txnVersion, maxFee, constants.StarknetChainId.SN_GOERLI, 0);
    console.log({transactionAXDeployHash});


    // Prepare signature

    const signature:WeierstrassSignatureType = ec.starkCurve.sign(transactionAXDeployHash, starkKeyPrivAX);
    console.log("{ \nsignature");
    console.log("     r =", "0x" + uint8ArrayToHex(signature.toCompactRawBytes().slice(0, 32)));
    console.log("     s =", "0x" + uint8ArrayToHex(signature.toCompactRawBytes().slice(32)));
    console.log("}");


    // Prepare signed transaction

    const signedTxnAXAccountDeploy = provider.buildTransaction({
        type: TransactionType.DEPLOY_ACCOUNT,
        nonce: 0,
        classHash: contractAXclassHash,
        signature: signature,
        addressSalt: starkKeyPubAX,
        constructorCalldata: constructorAXCallData,
        maxFee: maxFee,
        version: txnVersion
    });
    console.log({signedTxnAXAccountDeploy});


    // Prepare signer

    const signer = new Signer(starkKeyPrivAX);
    const signer1 = await signer.signDeployAccountTransaction({
        classHash: contractAXclassHash,
        contractAddress: accountAXAddress,
        constructorCalldata: constructorAXCallData,
        addressSalt: starkKeyPubAX,
        maxFee: maxFee,
        version: txnVersion,
        chainId: constants.StarknetChainId.SN_GOERLI,
        nonce: constants.ZERO,
    });
    
    // console.log("\nsigner1 =",(signer1 as WeierstrassSignatureType).toCompactHex());
    console.log("{ \nsigner1");
    console.log("     r =", "0x" + uint8ArrayToHex((signer1 as WeierstrassSignatureType).toCompactRawBytes().slice(0, 32)));
    console.log("     s =", "0x" + uint8ArrayToHex((signer1 as WeierstrassSignatureType).toCompactRawBytes().slice(32)));
    console.log("}");


    // Verify signed txn

    const fullPubKeyAX = encode.addHexPrefix(encode.buf2hex(ec.starkCurve.getPublicKey(starkKeyPrivAX, false)));
    console.log({fullPubKeyAX})
    const signatureVerifiedStatus = ec.starkCurve.verify(ec.starkCurve.Signature.fromCompact((signer1 as WeierstrassSignatureType).toCompactHex()), transactionAXDeployHash, fullPubKeyAX);
    console.log({signatureVerifiedStatus});



}

function uint8ArrayToHex(uint8Array: Uint8Array): string {
    let hexString = '';
    for (const byte of uint8Array) {
        // Convert each byte to its hexadecimal representation
        let hex = byte.toString(16);
        // Pad single-digit hex values with a leading zero
        if (hex.length === 1) {
            hex = '0' + hex;
        }
        // Concatenate the hexadecimal values
        hexString += hex;
    }
    return hexString;
}

run()
