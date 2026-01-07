"use client";

import { useWallet } from "@/contexts/WalletContext";

export const AccountInfo = () => {
  const { accountInfo, isConnected } = useWallet();

  if (!isConnected || !accountInfo) {
    return null;
  }

  return (
    <div className="p-4 mt-8 bg-gray-800 rounded">
      <h2 className="mb-4 text-xl font-bold">Account Information</h2>
      <pre className="p-4 text-sm bg-gray-900 rounded">
        {JSON.stringify(accountInfo, null, 2)}
      </pre>
    </div>
  );
};
