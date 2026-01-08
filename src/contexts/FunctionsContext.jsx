"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback
} from "react";
import xrpl from "xrpl";
import { submitTransaction } from "@gemwallet/api";

const FunctionsContext = createContext(undefined);

export const FunctionsProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // --- Loan Workflow ---
  const mintAndSendIOU = async (borrowerAddress, amount) => {
    const client = new xrpl.Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL);
    await client.connect();
    const vaultWallet = xrpl.Wallet.fromSeed(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED);

    const paymentTx = {
      TransactionType: "Payment",
      Account: vaultWallet.address,
      Destination: borrowerAddress,
      Amount: {
        currency: "USD",
        issuer: vaultWallet.address,
        value: amount.toString(),
      },
    };

    try {
      setStatusMessage(`Minting and sending ${amount} USD...`);
      const prepared = await client.autofill(paymentTx);
      const signed = vaultWallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);

      if (result.result.meta.TransactionResult !== 'tesSUCCESS') {
        if (result.result.meta.TransactionResult === 'tecNO_LINE') {
          throw new Error("Minting failed: The borrower has not set a trust line to the vault for USD.");
        }
        throw new Error(`Minting failed: ${result.result.meta.TransactionResult}`);
      }
      console.log("USD minted and sent successfully. Hash:", result.result.hash);
      return result.result.hash;

    } finally {
      await client.disconnect();
    }
  };

  const requestAndMintLoan = useCallback(async ({ amount, term, interestRate, borrowerAddress }) => {
    setIsLoading(true);
    try {
      setStatusMessage("Loan request received. Automatically approving...");
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate approval

      await mintAndSendIOU(borrowerAddress, amount);
      
      setStatusMessage("Saving loan details to database...");

      const principal = parseFloat(amount);
      const rate = parseFloat(interestRate);
      const totalAmountOwed = principal * (1 + rate / 100);
      
      const loanId = `LN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const installments = [];
      const monthlyPayment = totalAmountOwed / term;
      
      for (let i = 1; i <= term; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        installments.push({
          id: i,
          dueDate: dueDate.toISOString().split('T')[0],
          amount: monthlyPayment.toFixed(2),
          status: i === 1 ? 'Due' : 'Pending',
        });
      }

      const newLoan = {
        id: loanId,
        borrowerAccount: borrowerAddress,
        amount: amount.toString(), // Principal
        totalAmountOwed: totalAmountOwed.toFixed(2),
        term: term,
        interestRate: interestRate.toString(),
        status: "Active",
        issueDate: new Date().toISOString().split('T')[0],
        installments: installments,
      };

      await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLoan),
      });

      setStatusMessage("Loan approved and funds have been sent!");

    } catch (error) {
      console.error("Loan Request Error:", error);
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  }, []);

  const payInstallment = useCallback(async (loanId, installmentId, amount) => {
    setIsLoading(true);
    try {
      setStatusMessage("Processing payment via GemWallet...");
      
      const vaultWallet = xrpl.Wallet.fromSeed(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED);
      
      // 1 USD = 0.1 XRP
      const xrpAmount = amount * 0.1;
      // Ensure we don't exceed 6 decimal places (drops)
      const sanitizedXrpAmount = xrpAmount.toFixed(6);
      const dropsAmount = xrpl.xrpToDrops(sanitizedXrpAmount);

      const paymentTx = {
        TransactionType: "Payment",
        Destination: vaultWallet.address,
        Amount: dropsAmount, 
      };

      console.log(`Requesting payment of ${sanitizedXrpAmount} XRP (${dropsAmount} drops) to Vault...`);
      
      const response = await submitTransaction({
        transaction: paymentTx
      });

      if (response.type === "reject") {
        throw new Error("User rejected the transaction.");
      }

      if (response.result?.hash) {
        setStatusMessage("Payment successful! Updating loan status...");
        
        // Update database
        const apiResponse = await fetch('/api/loans', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loanId, installmentId }),
        });

        if (!apiResponse.ok) {
            throw new Error("Payment made but failed to update database.");
        }

        setStatusMessage("Installment paid successfully!");
      } else {
         throw new Error("Payment transaction failed.");
      }

    } catch (error) {
      console.error("Payment Error:", error);
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  }, []);

  const sendXRP = useCallback(async (amount, userAddress) => {
    setIsLoading(true);
    try {
      setStatusMessage("Initiating XRP deposit...");
      const vaultWallet = xrpl.Wallet.fromSeed(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED);
      
      const dropsAmount = xrpl.xrpToDrops(amount.toString());

      const paymentTx = {
        TransactionType: "Payment",
        Destination: vaultWallet.address,
        Amount: dropsAmount
      };

      console.log(`Depositing ${amount} XRP to Vault...`);
      
      const response = await submitTransaction({
        transaction: paymentTx
      });

      if (response.type === "reject") {
        throw new Error("User rejected the transaction.");
      }

      if (response.result?.hash) {
        setStatusMessage("Deposit successful! Recording transaction...");
        
        await fetch('/api/deposits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account: userAddress,
            amount: amount,
            type: 'deposit'
          }),
        });

        setStatusMessage("Deposit recorded.");
        return response.result.hash;
      } else {
         throw new Error("Deposit transaction failed.");
      }

    } catch (error) {
      console.error("Deposit Error:", error);
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  }, []);

  const withdrawXRP = useCallback(async (amount, userAddress) => {
    setIsLoading(true);
    try {
      setStatusMessage("Processing withdrawal from Vault...");
      const client = new xrpl.Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL);
      await client.connect();
      
      const vaultWallet = xrpl.Wallet.fromSeed(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED);
      const dropsAmount = xrpl.xrpToDrops(amount.toString());

      const paymentTx = {
        TransactionType: "Payment",
        Account: vaultWallet.address,
        Destination: userAddress,
        Amount: dropsAmount
      };

      const prepared = await client.autofill(paymentTx);
      const signed = vaultWallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);

      if (result.result.meta.TransactionResult === 'tesSUCCESS') {
        setStatusMessage("Withdrawal successful! Recording transaction...");
        
        await fetch('/api/deposits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account: userAddress,
            amount: amount,
            type: 'withdrawal'
          }),
        });

        setStatusMessage("Withdrawal complete.");
      } else {
        throw new Error(`Withdrawal failed: ${result.result.meta.TransactionResult}`);
      }
      
      await client.disconnect();

    } catch (error) {
      console.error("Withdrawal Error:", error);
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  }, []);

  const swapUSDForXRP = useCallback(async (usdAmount, userAddress) => {
    setIsLoading(true);
    try {
      const client = new xrpl.Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL);
      await client.connect();
      const vaultWallet = xrpl.Wallet.fromSeed(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED);

      // Step 1: Merchant sends USD to Vault (Burn)
      setStatusMessage("Step 1/2: Sending USD to Vault...");
      
      const paymentTx = {
        TransactionType: "Payment",
        Destination: vaultWallet.address,
        Amount: {
          currency: "USD",
          issuer: vaultWallet.address,
          value: usdAmount.toString()
        }
      };

      const response = await submitTransaction({
        transaction: paymentTx
      });

      if (response.type === "reject") {
        throw new Error("User rejected the USD transfer.");
      }

      if (response.result?.hash) {
        console.log("USD sent to vault. Hash:", response.result.hash);
        
        // Step 2: Vault sends XRP to Merchant (Redeem)
        setStatusMessage("Step 2/2: Vault sending XRP...");
        
        // Rate: 1 USD = 0.1 XRP
        const xrpAmount = usdAmount * 0.1;
        const dropsAmount = xrpl.xrpToDrops(xrpAmount.toFixed(6));

        const redeemTx = {
          TransactionType: "Payment",
          Account: vaultWallet.address,
          Destination: userAddress,
          Amount: dropsAmount
        };

        const prepared = await client.autofill(redeemTx);
        const signed = vaultWallet.sign(prepared);
        const result = await client.submitAndWait(signed.tx_blob);

        if (result.result.meta.TransactionResult === 'tesSUCCESS') {
          setStatusMessage(`Swap complete! Received ${xrpAmount} XRP.`);
        } else {
          throw new Error(`Vault failed to send XRP: ${result.result.meta.TransactionResult}`);
        }

      } else {
         throw new Error("USD transfer failed.");
      }

    } catch (error) {
      console.error("Swap Error:", error);
      setStatusMessage(`Swap failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  }, []);

  const clawbackFunds = useCallback(async (borrowerAddress) => {
    console.log("Starting clawback process for:", borrowerAddress);
    setIsLoading(true);
    try {
      const client = new xrpl.Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL);
      await client.connect();
      const vaultWallet = xrpl.Wallet.fromSeed(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED);

      // 1. Attempt Clawback Transaction
      // Note: This requires the Clawback amendment to be enabled on the account/ledger.
      // If not enabled, this might fail, but we'll proceed with "defaulting" the loan in DB anyway.
      setStatusMessage("Initiating funds clawback from ledger...");
      
      // First, check balance to clawback everything? Or just a fixed amount? 
      // Requirement says "clawback all USD tokens". 
      // We'll calculate the balance first.

      


      let clawbackAmount = "0";
      try {
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
        } else {
          clawbackAmount = usdBalanceObj.value;
  
          if (parseFloat(clawbackAmount) > 0) {
            const clawbackTx = {
              TransactionType: "Clawback",
              Account: vaultWallet.address,
              Amount: {
                  currency: "USD",
                  issuer: borrowerAddress,
                  value: clawbackAmount
              },
            };
            
            try {
              const prepared = await client.autofill(clawbackTx);
              const signed = vaultWallet.sign(prepared);
              await client.submitAndWait(signed.tx_blob);
              console.log(`Clawed back ${clawbackAmount} USD.`);
            } catch(e) {
                console.warn("Clawback transaction failed (Amendment might be missing):", e.message);
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch lines for clawback amount", err);
      }

      // 2. Delete Credential
      setStatusMessage("Revoking borrower credential...");
      const credDeleteTx = {
        TransactionType: "CredentialDelete",
        Account: vaultWallet.address,
        Subject: borrowerAddress,
        CredentialType: xrpl.convertStringToHex("KYC").toUpperCase(),
      };
      
      try {
        const preparedCred = await client.autofill(credDeleteTx);
        const signedCred = vaultWallet.sign(preparedCred);
        await client.submitAndWait(signedCred.tx_blob);
        console.log("Credential revoked.");
      } catch(e) {
          console.warn("CredentialDelete failed:", e.message);
      }

      await client.disconnect();

      // 3. Update Database via API
      setStatusMessage("Updating loan status to Defaulted...");
      await fetch('/api/clawback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ borrowerAddress }),
      });

      // 4. Update Borrower Status to Blacklisted
      await fetch('/api/borrowers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: borrowerAddress, status: 'Blacklisted' }),
      });

      setStatusMessage("Clawback complete. Loans defaulted.");

    } catch (error) {
      console.error("Clawback Error:", error);
      setStatusMessage(`Clawback failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  }, []);


  // --- Verification Workflow ---
  const issueCredential = async (borrowerAddress) => {
    const client = new xrpl.Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL);
    await client.connect();
    const vaultWallet = xrpl.Wallet.fromSeed(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED);
    const tx = { TransactionType: "CredentialCreate", Account: vaultWallet.address, Subject: borrowerAddress, CredentialType: xrpl.convertStringToHex("KYC").toUpperCase(), };
    try {
      setStatusMessage("Issuing credential from vault...");
      const prepared = await client.autofill(tx);
      const signed = vaultWallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);
      if (result.result.meta.TransactionResult !== 'tesSUCCESS') { throw new Error(`Vault failed to issue credential: ${result.result.engine_result_message}`); }
      console.log("Vault issued credential successfully. Hash:", result.result.hash);
      return vaultWallet.address;
    } finally {
      await client.disconnect();
    }
  };
  
  const acceptCredential = async (vaultAddress, borrowerSeed) => {
    const client = new xrpl.Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL);
    await client.connect();
    const borrowerWallet = xrpl.Wallet.fromSeed(borrowerSeed);
    const tx = { TransactionType: "CredentialAccept", Account: borrowerWallet.address, Issuer: vaultAddress, CredentialType: xrpl.convertStringToHex("KYC").toUpperCase(), };
    try {
      setStatusMessage("Borrower accepting credential...");
      const prepared = await client.autofill(tx);
      const signed = borrowerWallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);
      if (result.result.meta.TransactionResult !== 'tesSUCCESS') { throw new Error(`Borrower failed to accept credential: ${result.result.meta.TransactionResult}`); }
      console.log("Credential accepted! Borrower is now officially verified.");
    } finally {
      await client.disconnect();
    }
  };

  const startVerificationWorkflow = useCallback(async (borrowerAddress, formData) => {
    setIsLoading(true);
    try {
      const vaultAddress = await issueCredential(borrowerAddress);
      const borrowerSeed = process.env.NEXT_PUBLIC_VERIFIED_BORROWER_WALLET_SEED;
      if (!borrowerSeed) { throw new Error("Borrower seed not found in environment variables."); }
      await acceptCredential(vaultAddress, borrowerSeed);
      
      setStatusMessage("Saving borrower profile to database...");

      const newBorrower = {
        account: borrowerAddress,
        companyName: formData.companyName,
        contactEmail: formData.contactEmail,
        creditScore: 750,
        riskScore: 85,
        documentsURI: "https://amethyst-unhappy-spider-959.mypinata.cloud/ipfs/bafybeih5qtms2p4jecjwx5wir7vpdu5heym4gdmse3skku2bscyhoojjha/"
      };

      await fetch('/api/borrowers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBorrower)
      });

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
      const response = await client.request({ command: "ledger_entry", credential: { subject: borrowerAddress, issuer: vaultAddress, credential_type: xrpl.convertStringToHex("KYC").toUpperCase() } });
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
    isUserVerified,
    requestAndMintLoan,
    payInstallment,
    clawbackFunds,
    sendXRP,
    withdrawXRP,
    swapUSDForXRP,
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
