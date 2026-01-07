import xrpl from "xrpl";

async function enableClawback() {
  // 1. Define your credentials
  const TEST_NET = "wss://s.altnet.rippletest.net:51233";
  const client = new xrpl.Client(TEST_NET);
  
  // Replace with your actual seed/secret
  const wallet = xrpl.Wallet.fromSeed("YOUR_TESTNET_SEED_HERE");

  try {
    await client.connect();
    console.log("Connected to Testnet...");

    // 2. Prepare the AccountSet transaction
    // asfAllowTrustLineClawback is flag 16
    const accountSetTx = {
      TransactionType: "AccountSet",
      Account: wallet.address,
      SetFlag: xrpl.AccountSetAsfFlags.asfAllowTrustLineClawback,
    };

    console.log("Preparing transaction to enable Clawback...");

    // 3. Submit and wait for validation
    const result = await client.submitAndWait(accountSetTx, { wallet });

    if (result.result.meta.TransactionResult === "tesSUCCESS") {
      console.log("Success! Clawback has been enabled for this account.");
      console.log("Transaction Hash:", result.result.hash);
    } else {
      console.error("Error setting flag:", result.result.meta.TransactionResult);
      if (result.result.meta.TransactionResult === "tecNO_PERMISSION") {
        console.log("Note: This error often means you already have trustlines or owner objects.");
      }
    }

  } catch (error) {
    console.error("Connection error:", error);
  } finally {
    await client.disconnect();
  }
}

enableClawback();