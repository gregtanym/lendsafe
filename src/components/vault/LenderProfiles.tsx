"use client";

import { useState, useEffect } from 'react';
import { Client, Wallet, dropsToXrp } from 'xrpl';

type Lender = {
  account: string;
  lenderName: string;
  totalDeposited: string;
  share: string;
};

export const LenderProfiles = () => {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const client = new Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL!, { connectionTimeout: 10000 });

    const fetchData = async () => {
      try {
        await client.connect();
        
        if (!isMounted) return;

        const [lendersRes, depositsRes] = await Promise.all([
          fetch('/api/lenders'),
          fetch('/api/deposits')
        ]);

        // Fetch Vault Total Balance from Ledger
        const vaultWallet = Wallet.fromSeed(process.env.NEXT_PUBLIC_VAULT_WALLET_SEED!);
        const accountInfo = await client.request({
          command: "account_info",
          account: vaultWallet.address,
          ledger_index: "validated"
        });
        const vaultTotalXrp = parseFloat(dropsToXrp(accountInfo.result.account_data.Balance));

        if (lendersRes.ok && depositsRes.ok) {
          const lendersData = await lendersRes.json();
          const depositsData = await depositsRes.json();

          // 1. Calculate net deposits per account
          const balances: { [key: string]: number } = {};

          depositsData.forEach((record: any) => {
            const amount = parseFloat(record.amount);
            if (!balances[record.account]) balances[record.account] = 0;

            if (record.type === 'deposit') {
              balances[record.account] += amount;
            } else if (record.type === 'withdrawal') {
              balances[record.account] -= amount;
            }
          });

          // 2. Map to lender profiles and calculate share relative to VAULT TOTAL
          const processedLenders = lendersData.map((lender: any) => {
            const balance = balances[lender.account] || 0;
            // Share is now relative to the ENTIRE vault balance, not just the sum of deposits
            const share = vaultTotalXrp > 0 ? (balance / vaultTotalXrp) * 100 : 0;

            return {
              account: lender.account,
              lenderName: lender.lenderName,
              totalDeposited: balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " XRP",
              share: share.toFixed(1) + "%",
              rawBalance: balance
            };
          });

          processedLenders.sort((a: any, b: any) => b.rawBalance - a.rawBalance);

          if (isMounted) {
            setLenders(processedLenders);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching lender data:", error);
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

    fetchData();

    return () => {
      isMounted = false;
      if (client.isConnected()) {
        client.disconnect();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg h-full flex justify-center items-center">
        <p>Loading lender profiles...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg h-full">
      <h3 className="text-xl font-semibold mb-4">Lender Profiles</h3>
      <div className="overflow-y-auto max-h-72">
        {lenders.length > 0 ? (
          <ul className="space-y-3">
            {lenders.map((lender) => (
              <li key={lender.account} className="p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-green-400">{lender.lenderName}</p>
                  <p className="text-xs font-mono text-gray-300">Share: {lender.share}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Deposited: {lender.totalDeposited}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-gray-500 py-4">No lender activity found.</p>
        )}
      </div>
    </div>
  );
};
