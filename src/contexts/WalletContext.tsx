"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { Client, Wallet } from "xrpl";
import { connect, disconnect, getAccountInfo } from "@/lib/xrpl";
import { getPublicKey } from "@gemwallet/api";
import { useGemWallet } from "./gemWalletContext";
import { useFunctions } from "./FunctionsContext.jsx";

interface WalletContextType {
  client: Client | null;
  wallet: { address: string } | null;
  accountInfo: any | null;
  isConnected: boolean;
  isVerified: boolean;
  isVerificationLoading: boolean;
  role: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [wallet, setWallet] = useState<{ address: string } | null>(null);
  const [accountInfo, setAccountInfo] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerificationLoading, setIsVerificationLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const { isInstalled } = useGemWallet();
  const { isUserVerified } = useFunctions();

  const safeGetAddress = (seed: string | undefined): string | null => {
    if (!seed) return null;
    try {
      return Wallet.fromSeed(seed).address;
    } catch (e) {
      console.warn("Invalid seed provided in env:", seed);
      return null;
    }
  };

  const connectWallet = async () => {
    if (!isInstalled) {
      alert("Please install GemWallet extension.");
      return;
    }
    try {
      const xrplClient = await connect();
      setClient(xrplClient);
      
      const { result: walletData } = await getPublicKey();

      if (walletData?.address) {
        const info = await getAccountInfo(xrplClient, walletData.address);
        setWallet({ address: walletData.address });
        setAccountInfo(info);
        setIsConnected(true);

        try {
          // Derive addresses from seeds safely
          const borrowerAddresses = [
            safeGetAddress(process.env.NEXT_PUBLIC_VERIFIED_BORROWER_WALLET_SEED),
            safeGetAddress(process.env.NEXT_PUBLIC_VERIFIED_BORROWER2_WALLET_SEED)
          ].filter(Boolean); // Remove nulls

          const lenderAddresses = [
            safeGetAddress(process.env.NEXT_PUBLIC_LENDER_WALLET_SEED),
            safeGetAddress(process.env.NEXT_PUBLIC_LENDER2_WALLET_SEED)
          ].filter(Boolean);

          const vaultAddress = safeGetAddress(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED);
          const merchantAddress = safeGetAddress(process.env.NEXT_PUBLIC_MERCHANT_WALLET_SEED);

          if (borrowerAddresses.includes(walletData.address)) {
            setRole("borrower");
            setIsVerificationLoading(true);
            const verificationStatus = await isUserVerified(walletData.address);
            setIsVerified(verificationStatus);
            setIsVerificationLoading(false);
          } else if (lenderAddresses.includes(walletData.address)) {
            setRole("lender");
          } else if (walletData.address === vaultAddress) {
            setRole("vault");
          } else if (walletData.address === merchantAddress) {
            setRole("merchant");
          } else {
            setRole(null);
          }
        } catch (e) {
          console.error("Could not determine role: Check environment variables", e);
          setRole(null);
        }
      }

    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const disconnectWallet = async () => {
    if (client) {
      await disconnect(client);
      setClient(null);
      setWallet(null);
      setAccountInfo(null);
      setIsConnected(false);
      setRole(null);
      setIsVerified(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        client,
        wallet,
        accountInfo,
        isConnected,
        isVerified,
        isVerificationLoading,
        role,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
