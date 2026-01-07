"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Client, Wallet } from "xrpl";
import { connect, disconnect, getAccountInfo } from "@/lib/xrpl";
import { getPublicKey } from "@gemwallet/api";
import { useGemWallet } from "./gemWalletContext";

interface WalletContextType {
  client: Client | null;
  wallet: { address: string } | null;
  accountInfo: any | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [wallet, setWallet] = useState<{ address: string } | null>(null);
  const [accountInfo, setAccountInfo] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isInstalled } = useGemWallet();

  const connectWallet = async () => {
    if (!isInstalled) {
      alert("Please install GemWallet extension.");
      return;
    }
    try {
      const client = await connect();
      setClient(client);
      const { result: wallet } = await getPublicKey();
      setWallet(wallet);
      const info = await getAccountInfo(client, wallet.address);
      setAccountInfo(info);
      setIsConnected(true);
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
    }
  };

  return (
    <WalletContext.Provider
      value={{
        client,
        wallet,
        accountInfo,
        isConnected,
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
