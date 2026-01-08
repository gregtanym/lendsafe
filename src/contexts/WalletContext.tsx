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

interface WalletContextType {
  client: Client | null;
  wallet: { address: string } | null;
  accountInfo: any | null;
  isConnected: boolean;
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
  const [role, setRole] = useState<string | null>(null);
  const { isInstalled } = useGemWallet();

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
          const borrowerWallet = Wallet.fromSeed(process.env.NEXT_PUBLIC_VERIFIED_BORROWER_WALLET_SEED!);
          const lenderWallet = Wallet.fromSeed(process.env.NEXT_PUBLIC_LENDER_WALLET_SEED!);
          const vaultWallet = Wallet.fromSeed(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED!);

          if (walletData.address === borrowerWallet.address) {
            setRole("borrower");
          } else if (walletData.address === lenderWallet.address) {
            setRole("lender");
          } else if (walletData.address === vaultWallet.address) {
            setRole("vault");
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
    }
  };

  return (
    <WalletContext.Provider
      value={{
        client,
        wallet,
        accountInfo,
        isConnected,
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
