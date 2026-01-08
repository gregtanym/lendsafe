"use client";

import { useEffect, useState } from 'react';
import { LockOpenIcon } from '@heroicons/react/24/outline';
import { Client, Wallet, dropsToXrp } from 'xrpl';

export const ValueUnlocked = () => {
  const [unlockedValue, setUnlockedValue] = useState<string>("Loading...");

  useEffect(() => {
    let isMounted = true;
    const client = new Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL!, {
      connectionTimeout: 10000
    });

    const fetchData = async () => {
      try {
        await client.connect();
        if (!isMounted) return;

        const vaultWallet = Wallet.fromSeed(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED!);
        
        // 1. Fetch Total XRP Balance
        const accountInfo = await client.request({
          command: "account_info",
          account: vaultWallet.address,
          ledger_index: "validated"
        });
        
        if (!isMounted) return;
        const totalXrp = parseFloat(dropsToXrp(accountInfo.result.account_data.Balance));

        // 2. Fetch Circulating USD Supply
        const gatewayBalances = await client.request({
          command: "gateway_balances",
          account: vaultWallet.address,
          ledger_index: "validated",
          strict: true,
          hotwallet: [] 
        });

        if (!isMounted) return;
        const usdSupply = parseFloat(gatewayBalances.result.obligations?.["USD"] || "0");

        // 3. Calculate Unlocked Value
        // Assuming 1 USD is backed by 0.1 XRP
        const lockedXrp = usdSupply * 0.1;
        const unlockedXrp = totalXrp - lockedXrp;
        
        setUnlockedValue(unlockedXrp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        
      } catch (error) {
        if (isMounted) {
          console.error("Error calculating unlocked value:", error);
          setUnlockedValue("Error");
        }
      } finally {
        if (client.isConnected()) {
          await client.disconnect();
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (client.isConnected()) {
        client.disconnect();
      }
    };
  }, []);

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <div className="flex items-center">
        <LockOpenIcon className="h-8 w-8 text-orange-400 mr-4" />
        <div>
          <p className="text-sm text-gray-400">Total Value Unlocked (XRP)</p>
          <p className="text-2xl font-bold">{unlockedValue}</p>
        </div>
      </div>
    </div>
  );
};
