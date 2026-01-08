import xrpl from "xrpl";
import dotenv from "dotenv";
dotenv.config({ path: '../../.env.local' });

async function mintUSD(usdAmount) {
  const client = new xrpl.Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL);

  try {
    const vaultSeed = process.env.NEXT_PUBLIC_VAULT_WALLET_SEED; // This is the Issuer
    const borrowerSeed = process.env.NEXT_PUBLIC_VERIFIED_BORROWER_WALLET_SEED; // This is the Receiver

    if (!usdAmount || isNaN(usdAmount)) {
      throw new Error("A valid USD amount must be provided.");
    }
    
    const vaultWallet = xrpl.Wallet.fromSeed(vaultSeed);
    const borrowerWallet = xrpl.Wallet.fromSeed(borrowerSeed);

    await client.connect();
    console.log("Connected to Network...");

    // 1. Prepare the payment transaction for an Issued Currency
    const payment_tx = {
      "TransactionType": "Payment",
      "Account": vaultWallet.address,
      "Destination": borrowerWallet.address,
      "Amount": {
        "currency": "USD",
        "issuer": vaultWallet.address, // The wallet minting the token
        "value": usdAmount.toString()  // The amount of USD to mint/send
      }
    };

    console.log(`Minting ${usdAmount} USD from Vault to Borrower...`);

    // 2. Autofill, Sign, and Submit
    const prepared_tx = await client.autofill(payment_tx);
    const signed = vaultWallet.sign(prepared_tx);
    const result = await client.submitAndWait(signed.tx_blob);

    // 3. Check Results
    const { TransactionResult } = result.result.meta;

    if (TransactionResult === "tesSUCCESS") {
      console.log("Success! USD minted and sent.");
      console.log(`Transaction Hash: ${result.result.hash}`);
    } else {
      console.error("Error sending payment:", TransactionResult);
      // Common error: 'tecNO_LINE' means the borrower hasn't set the trustline yet.
    }

  } catch (error) {
    console.error("An error occurred:", error.message);
  } finally {
    await client.disconnect();
  }
}

mintUSD(500);