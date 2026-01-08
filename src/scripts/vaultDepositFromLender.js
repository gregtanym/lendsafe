import xrpl from "xrpl";
import dotenv from "dotenv";
dotenv.config({ path: '../../.env.local' });

async function sendXRP(xrpAmount) {
  // Define the network client
  const client = new xrpl.Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL);

  try {
    const lenderSeed = process.env.LENDER_WALLET_SEED;
    const vaultSeed = process.env.VAULT_WALLET_SEED;

    // Check if seeds are provided
    if (!lenderSeed || !vaultSeed) {
      throw new Error("Lender and Vault wallet seeds must be provided in your .env.local file.");
    }

    if (!xrpAmount || isNaN(xrpAmount)) {
      throw new Error("A valid XRP amount must be provided as an argument.");
    }
    
    // Create wallets from seeds
    const lenderWallet = xrpl.Wallet.fromSeed(lenderSeed);
    const vaultWallet = xrpl.Wallet.fromSeed(vaultSeed);

    await client.connect();
    console.log("Connected to Testnet...");
    console.log(`Lender Wallet: ${lenderWallet.address}`);
    console.log(`Vault Wallet: ${vaultWallet.address}`);

    // Prepare the payment transaction
    const payment_tx = {
      "TransactionType": "Payment",
      "Account": lenderWallet.address,
      "Amount": xrpl.xrpToDrops(xrpAmount), // Convert XRP to drops
      "Destination": vaultWallet.address
    };

    // Autofill and sign the transaction
    console.log(`Preparing to send ${xrpAmount} XRP from lender to vault...`);
    const prepared_tx = await client.autofill(payment_tx);
    const signed = lenderWallet.sign(prepared_tx);

    // Submit and wait for validation
    console.log("Submitting transaction and waiting for validation...");
    const result = await client.submitAndWait(signed.tx_blob);

    const { TransactionResult } = result.result.meta;

    if (TransactionResult === "tesSUCCESS") {
      console.log("Success! Payment was sent.");
      console.log(`Transaction Hash: ${result.result.hash}`);
      console.log(`Balance changes: https://testnet.xrpl.org/transactions/${result.result.hash}`);
    } else {
      console.error("Error sending payment:", TransactionResult);
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

sendXRP(5);
