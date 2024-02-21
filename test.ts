import { WeierstrassSignatureType, ec, Signer, hash, CallData, RpcProvider, TransactionType, constants, encode } from "starknet";


const run = async () => {
    const provider = new RpcProvider({ nodeUrl: "https://starknet-goerli.infura.io/v3/9643040ea0d04fd0ac5a38cb5f025b02" });
    console.log("TransactionByHash: ", await provider.getTransactionByHash("0x2c95c8b580664c1a2a8281ff0ac54ad7ff0e0b96ee778ed364cdd1f3f6dc84b"));

    const starkKeyPrivAX = '0x020603a4091502801212d162a58a905ca264a751706216544a2f6f5b4bd40778';
    const starkKeyPubAX = '0x07ae0572d0491d2de5e608194be2ab0bfcf7d6675b21736164d1c75e3233c000';
    const contractAXclassHash = "0x01a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003";
    const constructorAXCallData = CallData.compile([starkKeyPubAX,0]);

    // Steps to derive public address provided the public key
    const accountAXAddress = hash.calculateContractAddressFromHash(starkKeyPubAX, contractAXclassHash, constructorAXCallData, 0);
    console.log({accountAXAddress});    // expect match 0x00FB02809EF63cA017e1A7eB53A1FE654503785Aaca40165252c8d72522F0517

    // Steps to derive public key and prepare unsinged transaction hash (to be signed)
    const txnVersion = 1;
    const maxFee = 0x8110e6d36a8;
    const transactionDeployAXTxHash = hash.calculateDeployAccountTransactionHash(accountAXAddress, contractAXclassHash, constructorAXCallData, starkKeyPubAX, txnVersion, maxFee, constants.StarknetChainId.SN_GOERLI, 0);
    console.log({transactionDeployAXTxHash});   // expect match 0x2c95c8b580664c1a2a8281ff0ac54ad7ff0e0b96ee778ed364cdd1f3f6dc84b

    // Steps to broadcast the signature
    const signature = [
        '0x021d41834a5ab3ab1aa61cfd2e45f20422d41fe8b9be9aa4979410edac7691dd',
        '0x0151e2bff7c32cb66d80f8137dccd39effbe6e5ca2c73a89e063e0ed60eb8c8a'
    ];
    const preparedAXAccountDeployTxn = provider.buildTransaction({
        type: TransactionType.DEPLOY_ACCOUNT,
        nonce: 0,
        classHash: contractAXclassHash,
        signature: signature,
        addressSalt: starkKeyPubAX,
        constructorCalldata: constructorAXCallData,
        maxFee: maxFee,
        version: txnVersion
    });
    console.log({preparedAXAccountDeployTxn});

    const signer = new Signer(starkKeyPrivAX);
    const sig = await signer.signDeployAccountTransaction({
        classHash: contractAXclassHash,
        contractAddress: accountAXAddress,
        constructorCalldata: constructorAXCallData,
        addressSalt: starkKeyPubAX,
        maxFee: maxFee,
        version: txnVersion,
        chainId: constants.StarknetChainId.SN_GOERLI,
        nonce: 0,
    });
    console.log((sig as WeierstrassSignatureType).toCompactHex());

    const fullPubKeyAX = encode.addHexPrefix(encode.buf2hex(ec.starkCurve.getPublicKey(starkKeyPrivAX, false)));
    const status = ec.starkCurve.verify(ec.starkCurve.Signature.fromCompact((sig as WeierstrassSignatureType).toCompactHex()), transactionDeployAXTxHash, fullPubKeyAX);
    console.log({status, fullPubKeyAX});
}

run()