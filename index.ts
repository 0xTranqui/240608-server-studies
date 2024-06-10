import pg from "pg";
import { Hono } from "hono";
import { ed25519, ed25519ph } from "@noble/curves/ed25519";
import { blake3 } from "@noble/hashes/blake3";

const app = new Hono();
const PORT = process.env.PORT || 3030;

const KMS_URL = process.env.KMS_URL || "http://localhost:4000/sign"; // The URL of the KMS VM
const MESSAGE = JSON.stringify({ userId: "1", channelId: "9" }); // The message to be signed

// Generate private and public keys
const privateKey = ed25519.utils.randomPrivateKey();
const publicKey = ed25519.getPublicKey(privateKey);

const USER_ID_1_PRIV_KEY = process.env.USER_1_PRIVATE_KEY;
if (!USER_ID_1_PRIV_KEY) {
  throw new Error("USER_1_PRIVATE_KEY environment variable is not defined");
}
// Convert hex string to Uint8Array if necessary
const privKeyBytes = new Uint8Array(Buffer.from(USER_ID_1_PRIV_KEY, "hex"));
const USER_ID_1_PUB_KEY = ed25519.getPublicKey(USER_ID_1_PRIV_KEY);
// const pubKeyBytes = new Uint8Array(Buffer.from(USER_ID_1_PUB_KEY, "hex"));

const USER_ID = 1;
const CHANNEL_ID = 9;

const { Client } = pg;
const listenConnectionString = process.env.LISTEN_DATABASE_URL;
const writeConnectionString = process.env.WRITE_DATABASE_URL;

const listenClient = new Client({
  connectionString: listenConnectionString,
});

const writeClient = new Client({
  connectionString: writeConnectionString,
});

listenClient
  .connect()
  .then(() => console.log("Connected to Source DB successfully"))
  .catch((err) =>
    console.error("Connection error with Source DB:", (err as Error).stack)
  );

writeClient
  .connect()
  .then(() => {
    console.log("Connected to Destination DB successfully");
    ensureTableExists();
  })
  .catch((err) =>
    console.error("Connection error with Destination DB:", (err as Error).stack)
  );

export { listenClient, writeClient };

type SignatureResponse = { sig: string; signer: string };

// Type guard function to check if the data matches the expected type
function isSignatureResponse(data: any): data is SignatureResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.sig === "string" &&
    typeof data.signer === "string"
  );
}

/**
 * Sign a message using the private key.
 * @param message The message to sign.
 * @returns The signature.
 */
export function signMessage(message: string) {
  const msg = new TextEncoder().encode(message);
  const sig = ed25519.sign(msg, privKeyBytes);
  return {
    sig: Buffer.from(sig).toString("hex"),
    signer: USER_ID_1_PUB_KEY,
  };
}

/**
 * Verify a signed message using the public key.
 * @param message The original message.
 * @param signedMessage The signed message.
 * @param pubKey The public key used for verification.
 * @returns True if the signature is valid, false otherwise.
 */
export function verifyMessage(
  message: string,
  signedMessage: string,
  pubKey: string
): boolean {
  const msg = new TextEncoder().encode(message);
  const sig = Buffer.from(signedMessage, "hex");
  const pub = Buffer.from(pubKey, "hex");
  return ed25519.verify(sig, msg, pub);
}

async function ensureTableExists() {
  try {
    await writeClient.query("BEGIN");
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS public.submissions (
        submissionId BYTEA PRIMARY KEY,
        submissionContents TEXT NOT NULL,
        submissionSig TEXT,
        submissionSigner TEXT
      )
    `;
    await writeClient.query(createTableQuery);
    await writeClient.query("COMMIT");
    console.log("Schema and table verified/created successfully");
  } catch (err) {
    await writeClient.query("ROLLBACK");
    console.error(
      "Error in schema/table creation in destination DB:",
      (err as Error).stack
    );
  }
}

process.on("SIGINT", () => {
  Promise.all([listenClient.end(), writeClient.end()])
    .then(() => {
      console.log("Both clients disconnected");
      process.exit();
    })
    .catch((err) =>
      console.error("Error during disconnection", (err as Error).stack)
    );
});

app.post("/signMessage", async (c) => {
  console.log("recieved sign message req")
  try {
    const { message } = await c.req.json();

    console.log("what was incoming message in signMEssage", message)

    if (!message) {
      return c.json({ success: false, message: "No message provided" }, 400);
    }

    // Sign the message
    const msg = new TextEncoder().encode(message);
    const sig = ed25519.sign(msg, privKeyBytes);
    const signedMessage = Buffer.from(sig).toString("hex");
    const wasVerified = verifyMessage("message", signedMessage, Buffer.from(USER_ID_1_PUB_KEY).toString("hex"))
    console.log("verify message inside of /signMessage =", wasVerified)
  
    return c.json({ success: true, signedMessage, publicKey: Buffer.from(USER_ID_1_PUB_KEY).toString("hex") });
  } catch (error) {
    return c.json({ success: false, message: error }, 500);
  }
});

app.get("/submitToChannel", async (c) => {
  // NOTE: MESSAGE constant defined at top of file
  try {
    // Request a signature from the KMS VM
    const response = await fetch(`http://localhost:${PORT}/signMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: MESSAGE }),
    });

    if (!response.ok) {
      throw new Error("Failed to get signature from KMS");
    }

    const data: unknown = await response.json();

    if (!isSignatureResponse(data)) {
      throw new Error("KMS return invalid");
    }

    const { sig, signer } = data;
    const isValid = verifyMessage(MESSAGE, sig, signer);

    if (isValid) {
      // Generate a BLAKE3 hash for submissionId
      //  const submissionId = blake3(new TextEncoder().encode(MESSAGE));
      const submissionId = blake3(MESSAGE);

      // Insert the new row into the submissions table
      const insertQuery = `
       INSERT INTO public.submissions (submissionId, submissionContents, submissionSig, submissionSigner)
       VALUES ($1, $2, $3, $4)
     `;
      await writeClient.query(insertQuery, [
        submissionId,
        MESSAGE,
        sig,
        signer,
      ]);

      return c.json({
        success: true,
        message: "Signature verified successfully",
        body: { submissionId, MESSAGE, sig, signer },
      });
    } else {
      return c.json({ success: false, message: "Failed to verify signature" });
    }
  } catch (error) {
    return c.json({ success: false, message: error });
  }
});

Bun.serve({
  fetch: app.fetch,
  port: PORT,
});

console.log(`Hono server started on http://localhost:${PORT}`);
