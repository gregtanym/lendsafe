"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback
} from "react";
import xrpl from "xrpl";

const FunctionsContext = createContext(undefined);

export const FunctionsProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // This function is automated by the vault
  const issueCredential = async (borrowerAddress) => {
    const client = new xrpl.Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL);
    await client.connect();
    const vaultWallet = xrpl.Wallet.fromSeed(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED);

    const tx = {
      TransactionType: "CredentialCreate",
      Account: vaultWallet.address,
      Subject: borrowerAddress,
      CredentialType: xrpl.convertStringToHex("KYC").toUpperCase(), 
    };

    try {
      setStatusMessage("Issuing credential from vault...");
      const prepared = await client.autofill(tx);
      const signed = vaultWallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);

      console.log(result);

      if (result.result.meta.TransactionResult !== 'tesSUCCESS') {
        throw new Error(`Vault failed to issue credential: ${result.result.engine_result_message}`);
      }
      console.log("Vault issued credential successfully. Hash:", result.result.hash);
      return vaultWallet.address;

    } finally {
      await client.disconnect();
    }
  };

  // This function is now also automated, using the borrower's seed
  const acceptCredential = async (vaultAddress, borrowerSeed) => {
    const client = new xrpl.Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL);
    await client.connect();
    const borrowerWallet = xrpl.Wallet.fromSeed(borrowerSeed);

    const tx = {
      TransactionType: "CredentialAccept",
      Account: borrowerWallet.address,
      Issuer: vaultAddress,
      CredentialType: xrpl.convertStringToHex("KYC").toUpperCase(),
    };
    
    try {
      setStatusMessage("Borrower accepting credential...");
      const prepared = await client.autofill(tx);
      const signed = borrowerWallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);

      if (result.result.meta.TransactionResult !== 'tesSUCCESS') {
        throw new Error(`Borrower failed to accept credential: ${result.result.meta.TransactionResult}`);
      }
      console.log("Credential accepted! Borrower is now officially verified.");

    } finally {
      await client.disconnect();
    }
  };

  // This is the main function called by the UI
  const startVerificationWorkflow = useCallback(async (borrowerAddress) => {
    setIsLoading(true);
    try {
      // Step 1: Vault issues the credential automatically
      await issueCredential(borrowerAddress);

      // Step 2: Borrower accepts the credential automatically using their seed
      const borrowerSeed = process.env.NEXT_PUBLIC_VERIFIED_BORROWER_WALLET_SEED;
      if (!borrowerSeed) {
        throw new Error("Borrower seed not found in environment variables.");
      }
      await acceptCredential("rUHDmwZ1CZA44W2sD9yRvu9jjjS4Z7r1bk", borrowerSeed);

      setStatusMessage("Verification complete!");

    } catch (error) {
      console.error("Verification Workflow Error:", error);
      setStatusMessage(`Error: ${error.message}`);
    }
    finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  }, []);

  const isUserVerified = useCallback(async (borrowerAddress) => {
    const client = new xrpl.Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL);
    await client.connect();
    const vaultAddress = xrpl.Wallet.fromSeed(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED).address;

    try {
      const response = await client.request({
        command: "ledger_entry",
        credential: {
          subject: borrowerAddress,
          issuer: vaultAddress,
          credential_type: xrpl.convertStringToHex("KYC").toUpperCase()
        }
      });

      console.log(response);

      const flags = response.result.node.Flags || 0;
      const lsfAccepted = 0x00010000; 
      
      const isVerified = (flags & lsfAccepted) !== 0;
      console.log(`Is user ${borrowerAddress} verified?`, isVerified);
      return isVerified;

    } catch (e) {
      console.log(`Credential not found for ${borrowerAddress}.`);
      return false;
    } finally {
      await client.disconnect();
    }
  }, []);

  const value = {
    isLoading,
    statusMessage,
    startVerificationWorkflow,
    isUserVerified
  };

  return (
    <FunctionsContext.Provider value={value}>
      {children}
    </FunctionsContext.Provider>
  );
};

export const useFunctions = () => {
  const context = useContext(FunctionsContext);
  if (context === undefined) {
    throw new Error("useFunctions must be used within a FunctionsProvider");
  }
  return context;
};

