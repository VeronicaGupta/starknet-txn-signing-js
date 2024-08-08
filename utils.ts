export function uint8ArrayToHex(uint8Array: Uint8Array): string {
    let hexString = '0x';
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

export function formatBalance(qty: bigint, decimals: number): string {
    const balance = String("0").repeat(decimals) + qty.toString();
    const rightCleaned = balance.slice(-decimals).replace(/(\d)0+$/gm, '$1');
    const leftCleaned = BigInt(balance.slice(0, balance.length - decimals)).toString();
    // console.log(qty, decimals, balance, rightCleaned, leftCleaned)
    return leftCleaned + "." + rightCleaned;
}

import { WeierstrassSignatureType, ec, encode, Signature} from "starknet";
// import type { Hex } from '@noble/curves/abstract/utils';

// export function getSignature(starkPrivKey: Hex, msgHash: Hex){
//      // Prepare signature

//      const signature:WeierstrassSignatureType = ec.starkCurve.sign(msgHash, starkPrivKey);
//      console.log("{ \nsignature");
//      console.log("     r =", "0x" + uint8ArrayToHex(signature.toCompactRawBytes().slice(0, 32)));
//      console.log("     s =", "0x" + uint8ArrayToHex(signature.toCompactRawBytes().slice(32)));
//      console.log("}"); 

//      return signature as WeierstrassSignatureType;
// }

// export function verifySignature(starkPrivKey: Hex, msgHash: Hex, signerSig: Signature): any{

//      // Prepare signer
     
//      // console.log("\nsigner1 =",(signer1 as WeierstrassSignatureType).toCompactHex());
//      console.log("{ \nsigner1");
//      console.log("     r =", "0x" + uint8ArrayToHex((signerSig as WeierstrassSignatureType).toCompactRawBytes().slice(0, 32)));
//      console.log("     s =", "0x" + uint8ArrayToHex((signerSig as WeierstrassSignatureType).toCompactRawBytes().slice(32)));
//      console.log("}");
 
 
//      // Verify signed txn
 
//      const fullPubKeyAX = encode.addHexPrefix(encode.buf2hex(ec.starkCurve.getPublicKey(starkPrivKey, false)));
//      console.log({fullPubKeyAX})
//      const signatureVerifiedStatus = ec.starkCurve.verify(ec.starkCurve.Signature.fromCompact((signerSig as WeierstrassSignatureType).toCompactHex()), msgHash, fullPubKeyAX);
//      console.log({signatureVerifiedStatus});

//      return signatureVerifiedStatus;
// }