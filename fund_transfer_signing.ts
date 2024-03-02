import { WeierstrassSignatureType, ec, Signer, hash, CallData, RpcProvider, TransactionType, constants, encode, cairo, Account, Contract } from "starknet";

import * as mStarknet from '@scure/starknet';
import * as bip32 from "@scure/bip32";
import * as bip39 from '@scure/bip39';

const provider = new RpcProvider({ nodeUrl: "https://starknet-goerli.infura.io/v3/6345ca3fadb74eafb7bf38b922258b1e" });

const mnemonic = "road donate inch warm beyond sea wink shoot fashion gain put vocal";

const contractAXclassHash = "0x01a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003";
const ethContractAddress  = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
const strkContractAddress = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';
const version = '0x1';
const maxFee = '0x6659d45d645';
const chainId = constants.StarknetChainId.SN_GOERLI;

const address_idx = 0;
const amount = cairo.uint256(5 * (10**8)).low; // 0.00000000500000000
const receipientAddress = '0x0063de007721dDD7CCCA23Dd9345b70F77Af7B2FCcED9E3df1f390D0f1c61E9D';

// const mnemonic = "boy repair subway sketch rare quarter impulse frame chapter sponsor kingdom engine";
// const contractAXclassHash = "0x01a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003";
// const mnemonic = "electric exotic puppy icon enrich cradle field apology cricket remain vintage candy margin human myself smile cattle wild bean damp public spend marriage unusual";

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
    const hdKeyi = hdKey2.derive(path);

    // get stark PrivKey, PubKey and AccountAddress 
    const starkKeyPrivAX = "0x" + mStarknet.grindKey(hdKeyi.privateKey!);
    const starkKeyPubAX = ec.starkCurve.getStarkKey(starkKeyPrivAX);

    const constructorAXCallData=CallData.compile([starkKeyPubAX,0]);
    const accountAXAddress = hash.calculateContractAddressFromHash(starkKeyPubAX, contractAXclassHash, constructorAXCallData, 0);

    console.log("path =", path, "\n");
    console.log('publicKey =', starkKeyPubAX);
    console.log("privateKey =", starkKeyPrivAX, '\n');

    console.log('Account Send address=', accountAXAddress, "\n");

    console.log('Account Receive address=', receipientAddress, "\n");


    // ************************Start Single txn**********************************************
    const nonce = await provider.getNonceForAddress(accountAXAddress)

    const callData = [
      version,
      ethContractAddress,
      hash.getSelectorFromName('transfer'),
      '0x3',
      receipientAddress,
      amount,
      '0x0'
    ];
    console.log({callData});

    // hash msg
    const msgHash = hash.calculateTransactionHash(
      accountAXAddress,
      version,
      callData,
      maxFee,
      chainId,
      nonce
    );
    console.log({msgHash});

    // create signature
    var signature = ec.starkCurve.sign(msgHash, starkKeyPrivAX);
    console.log(signature.toCompactHex())

    // verify signature
    const fullPubKeyAX = encode.addHexPrefix(encode.buf2hex(ec.starkCurve.getPublicKey(starkKeyPrivAX, false)));
    console.log({fullPubKeyAX})
    const signatureVerifiedStatus = ec.starkCurve.verify(signature, msgHash, fullPubKeyAX);
    console.log({signatureVerifiedStatus});
    
    await fetchBalances(accountAXAddress);
    await fetchBalances(receipientAddress);

    // broadcast txn
    // const txn = await provider.invokeFunction({
    //   contractAddress: accountAXAddress,
    //   entrypoint: 'transfer',
    //   calldata: callData,
    //   signature: signature
    // }, {
    //   nonce: nonce,
    //   version: version,
    //   maxFee: maxFee
    // });

    // console.log(txn);

    // await delay(2000);


    await fetchBalances(accountAXAddress);
    await fetchBalances(receipientAddress);
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

const contracts: {eth: Contract | null, strk: Contract | null} = {eth: null, strk: null};

async function initContracts() {
  if (!contracts['eth']) {
    contracts['eth'] = new Contract((await provider.getClassAt(ethContractAddress)).abi, ethContractAddress, provider);
  }

  if (!contracts['strk']) {
    contracts['strk'] = new Contract((await provider.getClassAt(strkContractAddress)).abi, strkContractAddress, provider);
  }
}

async function fetchBalances(accountAXAddress: string) {
  await initContracts();
  const ethBalance = await (contracts.eth!).balanceOf(accountAXAddress) as bigint;
  const strkBalance = await (contracts.strk!).balanceOf(accountAXAddress) as bigint;

  console.log(formatBalance(ethBalance, 18) + " ETH", formatBalance(strkBalance, 18) + " STRK");
}
function formatBalance(qty: bigint, decimals: number): string {
  const balance = String("0").repeat(decimals) + qty.toString();
  const rightCleaned = balance.slice(-decimals).replace(/(\d)0+$/gm, '$1');
  const leftCleaned = BigInt(balance.slice(0, balance.length - decimals)).toString();
  return leftCleaned + "." + rightCleaned;
}

run()


 // var calls= {
    //   contractAddress: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
    //   entrypoint: 'transfer',
    //   calldata: {
    //     recipient: '0x63de007721ddd7ccca23dd9345b70f77af7b2fcced9e3df1f390d0f1c61e9d',
    //     amount: cairo.uint256(5 * (10**8))
    //   };
    // var signerDetails= {
    //     walletAddress: '0x5b54886cff6e7684da3cf1e1ba93c34084698f19fea5be95b9ed8f417d75739',
    //     nonce: 13n,
    //     maxFee: 7033500063301n,
    //     version: 1n,
    //     chainId: '0x534e5f474f45524c49',
    //     cairoVersion: '1'
    //   }
    // var signature = {
    //     r: 2371580946298057679561522730453241527135447322408446145497337198575818214580n,
    //     s: 1352320565039703957516221818517123195328501844211270369314532262907855489944n,
    //     recovery: 0
    //   }
    // var calldata: [
    //     '1',
    //     '2009894490435840142178314390393166646092438090257831307886760648929397478285',
    //     '232670485425082704932579856502088130646006032362877466777181098476241604910',
    //     '3',
    //     '176450059648142162851843100739258978226942203017826966520476484140991389341',
    //     '500000000',
    //     '0'
    //   ]

    //   getTxnDetails: {
    //     calldata: [
    //       '0x1',
    //       '0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
    //       '0x83afd3f4caedc6eebf44246fe54e38c95e3179a5ec9ea81740eca5b482d12e',
    //       '0x3',
    //       '0x63de007721ddd7ccca23dd9345b70f77af7b2fcced9e3df1f390d0f1c61e9d',
    //       '0x1dcd6500',
    //       '0x0'
    //     ],
    //     max_fee: '0x6659d45d645',
    //     nonce: '0xc',
    //     sender_address: '0x5b54886cff6e7684da3cf1e1ba93c34084698f19fea5be95b9ed8f417d75739',
    //     signature: [
    //       '0x68ebcc2b00a26b4611504ca684441b8756497717e4a8521f0694d58fd76ca1d',
    //       '0x74dced02218bbdb82ee3b3d8d7be07aeb15574ced56c679acde729ab681e5c6'
    //     ],
    //     transaction_hash: '0x661ddac0a6714272d66651540e19182a0689201cbbfada95d61882c86dbbce1',
    //     type: 'INVOKE',
    //     version: '0x1'
    //   }
    // }
