import xrpl from "xrpl";
import dotenv from "dotenv";
dotenv.config({ path: '../../.env.local' });

async function clawbackAllTokens(borrowerAddress) {
  const client = new xrpl.Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL);

  try {
    const vaultSeed = process.env.NEXT_PUBLIC_VAULT_WALLET_SEED;
    const vaultWallet = xrpl.Wallet.fromSeed(vaultSeed);

    await client.connect();
    console.log("Connected. Checking borrower balance...");

    // 1. Fetch current balances issued by the Vault
    // This returns all trustlines connected to your Vault
    const balances = await client.request({
      command: "gateway_balances",
      account: vaultWallet.address,
      ledger_index: "validated",
      hotwallet: [borrowerAddress] 
    });

    // 2. Extract the USD balance for the specific borrower
    // The balances are returned in an object where keys are addresses
    const borrowerBalances = balances.result.balances?.[borrowerAddress];
    const usdBalanceObj = borrowerBalances?.find(b => b.currency === "USD");

    if (!usdBalanceObj || parseFloat(usdBalanceObj.value) <= 0) {
      console.log(`No USD balance found for ${borrowerAddress}. Nothing to claw back.`);
      return;
    }

    const amountToClaw = usdBalanceObj.value;
    console.log(`Found ${amountToClaw} USD. Preparing clawback...`);

    // 3. Prepare the Clawback Transaction
    const clawback_tx = {
      "TransactionType": "Clawback",
      "Account": vaultWallet.address,
      "Amount": {
        "currency": "USD",
        "issuer": borrowerAddress, // The holder's address
        "value": amountToClaw
      }
    };

    // 4. Submit the transaction
    const prepared = await client.autofill(clawback_tx);
    const signed = vaultWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult === "tesSUCCESS") {
      console.log(`Successfully clawed back ${amountToClaw} USD from ${borrowerAddress}.`);
    } else {
      console.error("Clawback failed:", result.result.meta.TransactionResult);
    }

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await client.disconnect();
  }
}

// Usage
clawbackAllTokens("r9PVikJnAt4KcxBzrENNyaEYmYmF1SmGk3");