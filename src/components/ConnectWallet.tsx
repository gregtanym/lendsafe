"use client";

import { useWallet } from "@/contexts/WalletContext";
import { useGemWallet } from "@/contexts/gemWalletContext";

export const ConnectWallet = () => {
  const { isConnected, connectWallet, disconnectWallet, wallet } = useWallet();
  const { isInstalled } = useGemWallet();

  const handleConnect = () => {
    if (isInstalled) {
      connectWallet();
    } else {
      window.open("https://gemwallet.app/", "_blank");
    }
  };

  return (
    <div>
      {isConnected && wallet ? (
        <div className="flex items-center">
          <p className="mr-4">{`${wallet.address.slice(
            0,
            6
          )}...${wallet.address.slice(-4)}`}</p>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
        >
          {isInstalled ? "Connect Wallet" : "Install GemWallet"}
        </button>
      )}
    </div>
  );
};
