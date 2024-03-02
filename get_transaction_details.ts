import { Signature } from "@scure/starknet";
import { RpcProvider, WeierstrassSignatureType, cairo } from "starknet";

const provider = new RpcProvider({ nodeUrl: "https://starknet-goerli.infura.io/v3/6345ca3fadb74eafb7bf38b922258b1e" });

// const provider = new RpcProvider({ nodeUrl: "https://starknet-sepolia.core.chainstack.com/5689acc929b8d768454402601bfc44c4" });

const run = async () => {
    // const getTxnDetails = provider.getTransactionByHash("0x06fa9414257fb6b8db4cb949e97ac7f707cca492e862e4d9bbb9735abf9ef213");
    const getTxnDetails = await provider.getTransactionByHash("0x267be3f5c9709e70bcc1f5256723f6733db5a6fc30997ae053f583e35bc8d7");

    console.log({getTxnDetails});
    console.log("sig:", (getTxnDetails as any).signature[0]+(getTxnDetails as any).signature[1].slice(2));

    const pubKey = {publicKey: '0x496886c53d4d46a0863876d21e726ca8887300a0d436e6c82f509639a5edd4c'};
    const nonce = await provider.getNonceForAddress('0x5b54886cff6e7684da3cf1e1ba93c34084698f19fea5be95b9ed8f417d75739');

    console.log("pubkey:", pubKey.publicKey.slice(2));
    console.log("nonce:", nonce)

    const amount = cairo.uint256(5 * (10**8));
    let bigNumber = BigInt(amount);
    console.log('Hex:'+ bigNumber.toString(16)+' to bigInt '+bigNumber);
    console.log(bigNumber.toString(16));
}


run()

// {
//     "jsonrpc": "2.0",
//     "result": {
//       "transaction_hash": "0x6fa9414257fb6b8db4cb949e97ac7f707cca492e862e4d9bbb9735abf9ef213",
//       "type": "INVOKE",
//       "version": "0x3",
//       "nonce": "0x1",
//       "sender_address": "0x222c5c9d511765af4e20de1561424442e19e52f03061e47a0bee3a9b7e5964",
//       "signature": [
//         "0x3add29031b755c94430b20681769bb45f66e41d0df5d2526593bc1b9b8cfca7",
//         "0x54c3459624ccff272a8ca3078b3acaf36a764bfa8412553f91740704b4abf28"
//       ],
//       "calldata": [
//         "0x1",
//         "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
//         "0x83afd3f4caedc6eebf44246fe54e38c95e3179a5ec9ea81740eca5b482d12e",
//         "0x3",
//         "0x63de007721ddd7ccca23dd9345b70f77af7b2fcced9e3df1f390d0f1c61e9d",
//         "0x703b4d2a5000",
//         "0x0"
//       ],
//       "resource_bounds": {
//         "l1_gas": {
//           "max_amount": "0x1054",
//           "max_price_per_unit": "0x784408d7"
//         },
//         "l2_gas": {
//           "max_amount": "0x0",
//           "max_price_per_unit": "0x0"
//         }
//       },
//       "tip": "0x0",
//       "paymaster_data": [],
//       "account_deployment_data": [],
//       "nonce_data_availability_mode": "L1",
//       "fee_data_availability_mode": "L1"
//     },
//     "id": 1
//   }

// {
//     "jsonrpc": "2.0",
//     "result": {
//       "transaction_hash": "0x44c373c32228283d4ffbe14e958ebd6737abdec76d63a6895453a9be11360cd",
//       "type": "INVOKE",
//       "version": "0x3",
//       "nonce": "0x3",
//       "sender_address": "0x222c5c9d511765af4e20de1561424442e19e52f03061e47a0bee3a9b7e5964",
//       "signature": [
//         "0x1d53a6afe64cb98df923aa12cd7033a6e9693cc91e15af80a9c0f80dc4e1803",
//         "0x4ac5bc7160c63cb6ac820ca7b8091857489cb17f7902c2257de13512f86fc66"
//       ],
//       "calldata": [
//         "0x1",
//         "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
//         "0x83afd3f4caedc6eebf44246fe54e38c95e3179a5ec9ea81740eca5b482d12e",
//         "0x3",
//         "0x5f8b4d8f2fb11183874a7505c817bea266470417de4d8eb7cda88ae7dcbbb22",
//         "0x50f1ed629000",
//         "0x0"
//       ],
//       "resource_bounds": {
//         "l1_gas": {
//           "max_amount": "0x1054",
//           "max_price_per_unit": "0x57310881"
//         },
//         "l2_gas": {
//           "max_amount": "0x0",
//           "max_price_per_unit": "0x0"
//         }
//       },
//       "tip": "0x0",
//       "paymaster_data": [],
//       "account_deployment_data": [],
//       "nonce_data_availability_mode": "L1",
//       "fee_data_availability_mode": "L1"
//     },
//     "id": 1
//   }

// {
//     "jsonrpc": "2.0",
//     "result": {
//       "transaction_hash": "0x267be3f5c9709e70bcc1f5256723f6733db5a6fc30997ae053f583e35bc8d7",
//       "type": "INVOKE",
//       "version": "0x1",
//       "nonce": "0x6",
//       "max_fee": "0x6659d459f52",
//       "sender_address": "0x5b54886cff6e7684da3cf1e1ba93c34084698f19fea5be95b9ed8f417d75739",
//       "signature": [
//         "0x512eeb687e2774e4b028b34351012c7fe2927f67ea5f926ed5089752d4afd57",
//         "0x67f7ee13ec67be13e737989880d64c9e4e6c0b51860dc347c0832eb49cd28bd"
//       ],
//       "calldata": [
//         "0x1",
//         "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
//         "0x83afd3f4caedc6eebf44246fe54e38c95e3179a5ec9ea81740eca5b482d12e",
//         "0x3",
//         "0x3c7cacd75286c2ddc26ce66f2139610645bf3e47958ae6f8b55d7bb6e8623dc",
//         "0x1dcd6500",
//         "0x0"
//       ]
//     },
//     "id": 1
//   }
