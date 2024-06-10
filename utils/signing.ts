// import { ed25519, ed25519ph } from '@noble/curves/ed25519';

// // Generate private and public keys
// const privateKey = ed25519.utils.randomPrivateKey();
// const publicKey = ed25519.getPublicKey(privateKey);


// const USER_ID_1_PRIV_KEY = 
// const USER_ID_1_PUB_KEY = 

// const USER_ID = 1
// const CHANNEL_ID = 9

// type Message = { itemId: bigint, channelId: bigint }

// function signMessage({userId, message}: {userId: bigint, message: Message}) {

//     const USER_ID_1_PRIV_KEY = process.env.USER_1_PRIVATE_KEY

//     return {
//         msg,
//         signature,
//         signer
//     }

// }

// /**
//  * Sign a message using the private key.
//  * @param message The message to sign.
//  * @returns The signature.
//  */
// export function signMessage(message: string) {
//   const msg = new TextEncoder().encode(message);
//   const sig = ed25519.sign(msg, USER_ID_1_PRIV_KEY);
//   return {
//     sig: Buffer.from(sig).toString('hex'),
//     pubKey: USER_ID_1_PUB_KEY
//   }
// }

// /**
//  * Verify a signed message using the public key.
//  * @param message The original message.
//  * @param signedMessage The signed message.
//  * @param pubKey The public key used for verification.
//  * @returns True if the signature is valid, false otherwise.
//  */
// export function verifyMessage(message: string, signedMessage: string, pubKey: string): boolean {
//   const msg = new TextEncoder().encode(message);
//   const sig = Buffer.from(signedMessage, 'hex');
//   const pub = Buffer.from(pubKey, 'hex');
//   return ed25519.verify(sig, msg, pub);
// }

// /**
//  * Get the public key.
//  * @returns The public key as a string.
//  */
// export function getPublicKey(): string {
//   return Buffer.from(publicKey).toString('hex');
// }
