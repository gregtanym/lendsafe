"use client";

import { useEffect, useState } from 'react';
import { LockOpenIcon } from '@heroicons/react/24/outline';
import { Client, Wallet, dropsToXrp } from 'xrpl';

export const ValueUnlocked = () => {
  const [unlockedValue, setUnlockedValue] = useState<string>("Loading...");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const client = new Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL!);
        await client.connect();
        const vaultWallet = Wallet.fromSeed(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED!);
        
        // 1. Fetch Total XRP Balance
        const accountInfo = await client.request({
          command: "account_info",
          account: vaultWallet.address,
          ledger_index: "validated"
        });
        const totalXrp = parseFloat(dropsToXrp(accountInfo.result.account_data.Balance));

        // 2. Fetch Circulating USD Supply
        const gatewayBalances = await client.request({
          command: "gateway_balances",
          account: vaultWallet.address,
          ledger_index: "validated",
          strict: true,
          hotwallet: [] 
        });
        const usdSupply = parseFloat(gatewayBalances.result.obligations?.["USD"] || "0");

        // 3. Calculate Unlocked Value
        // Assuming 1 USD is backed by 0.1 XRP
        const lockedXrp = usdSupply * 0.1;
        const unlockedXrp = totalXrp - lockedXrp;
        
        setUnlockedValue(unlockedXrp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        
        await client.disconnect();
      } catch (error) {
        console.error("Error calculating unlocked value:", error);
        setUnlockedValue("Error");
      }
    };

    fetchData();
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
