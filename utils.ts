export function uint8ArrayToHex(uint8Array: Uint8Array): string {
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

export function formatBalance(qty: bigint, decimals: number): string {
    const balance = String("0").repeat(decimals) + qty.toString();
    const rightCleaned = balance.slice(-decimals).replace(/(\d)0+$/gm, '$1');
    const leftCleaned = BigInt(balance.slice(0, balance.length - decimals)).toString();
    // console.log(qty, decimals, balance, rightCleaned, leftCleaned)
    return leftCleaned + "." + rightCleaned;
}