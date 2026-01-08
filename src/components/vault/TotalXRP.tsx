"use client";

import { useEffect, useState } from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Client, Wallet, dropsToXrp } from 'xrpl';

export const TotalXRP = () => {
  const [balance, setBalance] = useState<string>("Loading...");

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const client = new Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL!);
        await client.connect();
        const vaultWallet = Wallet.fromSeed(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED!);
        
        const response = await client.request({
          command: "account_info",
          account: vaultWallet.address,
          ledger_index: "validated"
        });
        
        const xrpBalance = dropsToXrp(response.result.account_data.Balance);
        // Format to 2 decimal places
        setBalance(parseFloat(xrpBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        
        await client.disconnect();
      } catch (error) {
        console.error("Error fetching XRP balance:", error);
        setBalance("Error");
      }
    };

    fetchBalance();
  }, []);

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <div className="flex items-center">
        {/* Using CurrencyDollarIcon as a stand-in for XRP logo */}
        <CurrencyDollarIcon className="h-8 w-8 text-green-400 mr-4" />
        <div>
          <p className="text-sm text-gray-400">Total XRP in Vault</p>
          <p className="text-2xl font-bold">{balance}</p>
        </div>
      </div>
    </div>
  );
};
