import { ec, hash, num, json, Contract, CallData, encode, WeierstrassSignatureType, BigNumberish } from 'starknet';

import { pedersen, ProjectivePoint } from './pedersen';

// path = m/44'/9004'/0'/0/1 
// mnemonic= road donate inch warm beyond sea wink shoot fashion gain put vocal 

// seed= a185e44359c94014fa23b86741d089cdf7b75fa22a7b819e227a726d0cf19d29b19b16b4e9bd9d6f7d52e67d46eb2faa7d7258b6886b75aeb5e7825e97f26ea3 

// ecdsaPrivateKey= c35288c47b0c3f6f7e984b27b67d50e8e939f53c890b1f80a22c479046ad37dc
// starkPrivateKey = 0x4e7924acdb8f28d7997ac80c84891cd92599c1457510970ec5c08d4252d479e
// starkPublicKey = 0xf843907263e07a57153dd068889b08a5b7372c7a3d51e588d9c5f1ed69a766
// starkAccount= 0x5b54886cff6e7684da3cf1e1ba93c34084698f19fea5be95b9ed8f417d75739 

import * as mStarknet from '@scure/starknet';
import * as bip32 from "@scure/bip32";
import * as bip39 from "@scure/bip39";

import { formatBalance, uint8ArrayToHex } from "./utils";
// import { get, uint8ArrayToHex } from "./utils";

const mnemonic = "road donate inch warm beyond sea wink shoot fashion gain put vocal";
const contractclassHashAX = "0x029927c8af6bccf3f6fda035981e765a7bdbf18a2dc0d630494f8758aa908e2b";
const contractAddress = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
const EthPath = "m/44'/60'/0'/0/0";
const StarkBasePath = "m/44'/9004'/0'/0/";
const address_idx0 = 1;

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
const starkPrivateKey = "0x" + mStarknet.grindKey(hdKeyi.privateKey!);
const starknetPublicKey = ec.starkCurve.getStarkKey(starkPrivateKey);


const data: BigNumberish[] = [1, 128, 18, 14];
// const result = "0x"+[...data, BigInt(data.length)].reduce((x, y) => BigInt(ec.starkCurve.pedersen(BigInt(x), BigInt(y))), BigInt(0)).toString(16);
const result = "0x"+[...data, BigInt(data.length)].reduce(  (x, y) => BigInt(  pedersen(BigInt(x), BigInt(y))  ), BigInt(0)   ).toString(16);

const msgHash = hash.computeHashOnElements(data);


const signature: WeierstrassSignatureType = ec.starkCurve.sign(msgHash, starkPrivateKey);
const fullPubKeyAX = ec.starkCurve.getPublicKey(starkPrivateKey, false);
const signatureVerifiedStatus = ec.starkCurve.verify(signature, msgHash, fullPubKeyAX);


console.log("ecdsaPrivateKey: ", uint8ArrayToHex(hdKeyi.privateKey!));
console.log("starkPrivateKey: ", starkPrivateKey);
console.log("starkPublicKey : ", starknetPublicKey);

console.log("derived msghash: ", result);
console.log("calcula msghash: ", msgHash);

console.log("fullStarkPubKey: ", uint8ArrayToHex(fullPubKeyAX))
console.log("signature: ", signature.toCompactHex());
console.log("verify signature: ", signatureVerifiedStatus);