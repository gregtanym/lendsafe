import xrpl from "xrpl";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from "dotenv";

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Loads environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function issuerOpenValve(issuerSeed, userAddress) {
  const client = new xrpl.Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL);

  try {
    if (!issuerSeed) {
        throw new Error("Vault wallet seed (issuer) must be provided in your .env.local file.");
    }

    await client.connect();
    console.log("Connected to Network...");

    const wallet = xrpl.Wallet.fromSeed(issuerSeed);
    console.log(`Issuer Wallet: ${wallet.address}`);
    console.log(`Target User: ${userAddress}`);

    // Define the TrustSet transaction
    // clearing NoRipple (tfClearNoRipple) allows the issuer to ripple through this line
    const tx = {
      TransactionType: "TrustSet",
      Account: wallet.address,
      LimitAmount: {
        currency: "USD",
        issuer: userAddress, 
        value: "0" 
      },
      Flags: xrpl.TrustSetFlags.tfClearNoRipple
    };

    console.log("Preparing and signing TrustSet transaction to clear NoRipple...");
    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);

    console.log("Submitting transaction...");
    const result = await client.submitAndWait(signed.tx_blob);

    const { TransactionResult } = result.result.meta;

    if (TransactionResult === "tesSUCCESS") {
      console.log("Success! NoRipple flag has been cleared (Rippling enabled on this line).");
      console.log("Transaction Hash:", result.result.hash);
    } else {
      console.error("Error setting flag:", TransactionResult);
    }

  } catch (error) {
    console.error("An error occurred:", error.message);
  } finally {
    if (client.isConnected()) {
      await client.disconnect();
      console.log("Disconnected from Network.");
    }
  }
}

// Get the user address from command line or use the default provided in your snippet
// const targetAddress = process.argv[2] || "rPFaCHsGWH7Hh5CDEh22C9pfvgScTtevUk";

issuerOpenValve(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED, "rHZhpgjcnmHucNgwU4YLC871m1jJK9dqFe");
