import xrpl from "xrpl";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: '../../.env.local' });

async function createTrustLine(accountSeed, issuerSeed) {
  // Define the network client
  const client = new xrpl.Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL);

  try {
    // Check if seeds are provided
    if (!accountSeed || !issuerSeed) {
      throw new Error("Borrower and Vault wallet seeds must be provided in your .env.local file.");
    }
    
    // Create wallets from seeds
    const accountWallet = xrpl.Wallet.fromSeed(accountSeed);
    const issuerWallet = xrpl.Wallet.fromSeed(issuerSeed);

    await client.connect();
    console.log("Connected to Testnet...");
    console.log(`Borrower Wallet: ${accountWallet.address}`);
    console.log(`Vault/Issuer Wallet: ${issuerWallet.address}`);

    // Define the TrustSet transaction
    const trustSet_tx = {
      "TransactionType": "TrustSet",
      "Account": accountWallet.address,
      "LimitAmount": {
        "currency": "DOL", // Custom token currency
        "issuer": issuerWallet.address,
        "value": "1000000000" // A large value for the trust line
      }
    };

    // Autofill and sign the transaction
    console.log("Preparing and signing TrustSet transaction...");
    const ts_prepared = await client.autofill(trustSet_tx);
    const signed = accountWallet.sign(ts_prepared);

    // Submit and wait for validation
    console.log("Submitting transaction and waiting for validation...");
    const result = await client.submitAndWait(signed.tx_blob);

    const { TransactionResult } = result.result.meta;

    if (TransactionResult === "tesSUCCESS") {
      console.log("Success! Trustline has been set.");
      console.log("Transaction Hash:", result.result.hash);
    } else {
      console.error("Error setting trustline:", TransactionResult);
      if (TransactionResult === "tecNO_PERMISSION") {
        console.log("Note: This error often means you already have trustlines or other objects in the account.");
      }
    }

  } catch (error) {
    console.error("An error occurred:", error.message);
  } finally {
    if (client.isConnected()) {
      await client.disconnect();
      console.log("Disconnected from Testnet.");
    }
  }
}

createTrustLine(process.env.VERIFIED_BORROWER_WALLET_SEED, process.env.VAULT_WALLET_SEED);