
// import { Hono } from "hono"

// const app = new Hono()

// const KMS_URL = process.env.KMS_URL || 'http://localhost:4000/sign'; // The URL of the KMS VM
// const MESSAGE = { userId: "1", channelId: "9" }; // The message to be signed

// function signMessage(message: string) {
//     const msg = new TextEncoder().encode(message);
//     const sig = ed25519.sign(msg, USER_ID_1_PRIV_KEY);
//     return {
//       sig: Buffer.from(sig).toString('hex'),
//       pubKey: USER_ID_1_PUB_KEY
//     }
//   }
  

// // async function requestSignature() {
// //   try {
// //     const signedMessage = kmsClient.signMessage(message)
// //   } catch (e) {

// //   }
// // }

// app.get("/", (c) => c.text("Hello, Hono!"))


// app.get('/signMessage', async (c) => {
//     try {
//       // Request a signature from the KMS VM
//       const response = await fetch(KMS_URL, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message: MESSAGE }),
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to get signature from KMS');
//       }
  
//       const data = await response.json();
//       const { signedMessage, publicKey } = data;
  
//       // Verify the signed message
//       const isValid = verifyMessage(MESSAGE, signedMessage, publicKey);
  
//       if (isValid) {
//         return c.json({ success: true, message: 'Signature verified successfully', signedMessage });
//       } else {
//         return c.json({ success: false, message: 'Failed to verify signature' });
//       }
//     } catch (error) {
//       return c.json({ success: false, message: error.message });
//     }
//   });
  



// app.get('/requestSig', async (c) => {
//   try {
//     // Request a signature from the KMS VM
//     const response = await fetch(KMS_URL, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ message: MESSAGE }),
//     });
    
//     if (!response.ok) {
//       throw new Error('Failed to get signature from KMS');
//     }

//     const data = await response.json();
//     const { signedMessage, publicKey } = data;

//     // Verify the signed message
//     const isValid = verifyMessage(MESSAGE, signedMessage, publicKey);

//     if (isValid) {
//       return c.json({ success: true, message: 'Signature verified successfully', signedMessage });
//     } else {
//       return c.json({ success: false, message: 'Failed to verify signature' });
//     }
//   } catch (error) {
//     return c.json({ success: false, message: error.message });
//   }
// });

// export { listenClient, writeClient }

// Bun.serve({
//   fetch: app.fetch,
//   port: process.env.PORT || 3030,
// })

// console.log(`Hono server started on http://localhost:${process.env.PORT || 3030}`)