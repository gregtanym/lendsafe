"use client";

import { useEffect, useState } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { UtilizationCurveChart } from './UtilizationCurveChart';
import { Client, Wallet, dropsToXrp } from 'xrpl';

export const LiquidityPoolHealth = () => {
  const [totalXrp, setTotalXrp] = useState<number>(0);
  const [circulatingUsd, setCirculatingUsd] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const client = new Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL!, {
      connectionTimeout: 10000
    });

    const fetchHealthData = async () => {
      try {
        await client.connect();
        if (!isMounted) return;

        const vaultWallet = Wallet.fromSeed(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED!);

        // 1. Fetch Total XRP (Deposited)
        const accountInfo = await client.request({
          command: "account_info",
          account: vaultWallet.address,
          ledger_index: "validated"
        });
        
        if (!isMounted) return;
        const xrpBalance = parseFloat(dropsToXrp(accountInfo.result.account_data.Balance));
        setTotalXrp(xrpBalance);

        // 2. Fetch Circulating USD (Borrowed)
        const gatewayBalances = await client.request({
          command: "gateway_balances",
          account: vaultWallet.address,
          ledger_index: "validated",
          strict: true,
          hotwallet: [] 
        });

        if (!isMounted) return;
        const usdSupply = parseFloat(gatewayBalances.result.obligations?.["USD"] || "0");
        setCirculatingUsd(usdSupply);

      } catch (error) {
        if (isMounted) {
          console.error("Error fetching health data:", error);
        }
      } finally {
        if (client.isConnected()) {
          await client.disconnect();
        }
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHealthData();

    return () => {
      isMounted = false;
      if (client.isConnected()) {
        client.disconnect();
      }
    };
  }, []);

  const utilizationRate = totalXrp > 0 ? (circulatingUsd / totalXrp) * 100 : 0;

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg h-full flex justify-center items-center">
        <p className="text-gray-400">Calculating pool health...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <div className="flex items-center mb-4">
        <HeartIcon className={`h-8 w-8 mr-4 ${utilizationRate > 90 ? 'text-red-500' : 'text-green-400'}`} />
        <div>
          <p className="text-sm text-gray-400">Liquidity Pool Health</p>
          <p className="text-xl font-bold">{utilizationRate > 90 ? 'Critical' : 'Good'}</p>
        </div>
      </div>
      <div className="space-y-2 text-sm mb-6">
        <div className="flex justify-between">
          <span className="text-gray-400">Total Deposited (XRP):</span>
          <span className="font-mono">{totalXrp.toLocaleString(undefined, { maximumFractionDigits: 2 })} XRP</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Total Borrowed (USD):</span>
          <span className="font-mono">{circulatingUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Utilization Rate:</span>
          <span className={`font-mono font-bold ${utilizationRate > 90 ? 'text-red-400' : 'text-blue-400'}`}>
            {utilizationRate.toFixed(2)}%
          </span>
        </div>
      </div>

      <div>
        <h4 className="text-md font-semibold mb-2 text-gray-300">Utilization Curve</h4>
        <p className="text-xs text-gray-500 mb-4">
          Shows how the interest rate for borrowers increases as more of the pool's liquidity is utilized.
        </p>
        <UtilizationCurveChart />
      </div>
    </div>
  );
};
