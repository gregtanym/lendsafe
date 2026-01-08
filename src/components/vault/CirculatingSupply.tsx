"use client";

import { useEffect, useState } from 'react';
import { CircleStackIcon } from '@heroicons/react/24/outline';
import { Client, Wallet } from 'xrpl';

export const CirculatingSupply = ({ refreshSignal }: { refreshSignal?: number }) => {
  const [supply, setSupply] = useState<string>("Loading...");

  useEffect(() => {
    let isMounted = true;
    const client = new Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL!, {
      connectionTimeout: 10000
    });

    const fetchSupply = async () => {
      try {
        await client.connect();
        if (!isMounted) return;

        const vaultWallet = Wallet.fromSeed(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED!);
        
        const response = await client.request({
          command: "gateway_balances",
          account: vaultWallet.address,
          ledger_index: "validated",
          strict: true,
          hotwallet: [] 
        });
        
        if (!isMounted) return;

        // The obligations field contains the total currency issued
        const obligations = response.result.obligations;
        const usdSupply = obligations?.["USD"] || "0";
        
        setSupply(parseFloat(usdSupply).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching circulating supply:", error);
          setSupply("Error");
        }
      } finally {
        if (client.isConnected()) {
          await client.disconnect();
        }
      }
    };

    fetchSupply();

    return () => {
      isMounted = false;
      if (client.isConnected()) {
        client.disconnect();
      }
    };
  }, [refreshSignal]);

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <div className="flex items-center">
        <CircleStackIcon className="h-8 w-8 text-indigo-400 mr-4" />
        <div>
          <p className="text-sm text-gray-400">USD Circulating Supply</p>
          <p className="text-2xl font-bold">{supply}</p>
          <div className='text-xs text-gray-500'>1 USD = 0.1 XRP</div>
        </div>
      </div>
    </div>
  );
};
