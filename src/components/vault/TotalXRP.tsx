"use client";

import { useEffect, useState } from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Client, Wallet, dropsToXrp } from 'xrpl';

export const TotalXRP = ({ refreshSignal }: { refreshSignal?: number }) => {
  const [balance, setBalance] = useState<string>("Loading...");

  useEffect(() => {
    let isMounted = true;
    // Increase timeout to 10s to handle flaky connections
    const client = new Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL!, {
      connectionTimeout: 10000
    });

    const fetchBalance = async () => {
      try {
        console.log("Connecting to XRPL client...");
        await client.connect();
        
        if (!isMounted) return;

        const vaultWallet = Wallet.fromSeed(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED!);
        
        const response = await client.request({
          command: "account_info",
          account: vaultWallet.address,
          ledger_index: "validated"
        });

        console.log(response);
        
        if (!isMounted) return;

        const xrpBalance = dropsToXrp(response.result.account_data.Balance);
        // Format to 2 decimal places
        setBalance(parseFloat(xrpBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching XRP balance:", error);
          setBalance("Error");
        }
      } finally {
        // Only disconnect if we are still mounted and done, OR if we are just cleaning up connection resources.
        // Actually, for single-shot requests, we always disconnect.
        if (client.isConnected()) {
          await client.disconnect();
          console.log("Disconnected from XRPL client");
        }
      }
    };

    fetchBalance();

    return () => {
      isMounted = false;
      // Force disconnect on unmount to prevent hanging connections
      if (client.isConnected()) {
        client.disconnect();
      }
    };
  }, [refreshSignal]);

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
