"use client";

import { useState, useEffect, useCallback } from 'react';
import { BanknotesIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { DepositWithdrawModal } from './DepositWithdrawModal';
import { useWallet } from '@/contexts/WalletContext';
import { useFunctions } from '@/contexts/FunctionsContext.jsx';
import { Client, Wallet, dropsToXrp } from 'xrpl';

export const FundsDeposited = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [depositedAmount, setDepositedAmount] = useState<string>("Loading...");
  const [walletBalance, setWalletBalance] = useState<string>("Loading...");
  
  const { wallet } = useWallet();
  const { sendXRP, withdrawXRP, isLoading: isTxLoading } = useFunctions();

  const fetchData = useCallback(async () => {
    if (!wallet?.address) return;

    try {
      // 1. Get User's Net Deposit from DB
      const depositsRes = await fetch(`/api/deposits?account=${wallet.address}`);
      if (depositsRes.ok) {
        const history = await depositsRes.json();
        const netDeposit = history.reduce((acc: number, curr: any) => {
          return curr.type === 'deposit' ? acc + parseFloat(curr.amount) : acc - parseFloat(curr.amount);
        }, 0);
        setDepositedAmount(netDeposit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      }

      // 2. Get User Wallet Balance from XRPL
      const client = new Client(process.env.NEXT_PUBLIC_XRPL_RPC_URL!, { connectionTimeout: 10000 });
      await client.connect();
      
      const userInfo = await client.request({
        command: "account_info",
        account: wallet.address,
        ledger_index: "validated"
      });
      const userXrp = dropsToXrp(userInfo.result.account_data.Balance);
      setWalletBalance(parseFloat(userXrp).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

      await client.disconnect();
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  }, [wallet?.address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModal = (action: 'deposit' | 'withdraw') => {
    setModalAction(action);
    setIsModalOpen(true);
  };

  const handleTransaction = async (amount: string) => {
    const numericAmount = parseFloat(amount);
    if (numericAmount > 0 && wallet?.address) {
      if (modalAction === 'deposit') {
        await sendXRP(numericAmount, wallet.address);
      } else {
        await withdrawXRP(numericAmount, wallet.address);
      }
      setIsModalOpen(false);
      fetchData(); // Refresh balances
    }
  };

  return (
    <>
      <div className="p-6 bg-gray-800 rounded-lg h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center">
            <BanknotesIcon className="h-8 w-8 text-blue-400 mr-4" />
            <div>
              <p className="text-sm text-gray-400">Your Deposited Funds</p>
              <p className="text-2xl font-bold">{depositedAmount} XRP</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">Your Wallet Balance</p>
            <p className="font-semibold">{walletBalance} XRP</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <button
            onClick={() => openModal('deposit')}
            className="flex items-center justify-center px-4 py-2 font-bold text-white bg-green-600 rounded hover:bg-green-700"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Deposit
          </button>
          <button
            onClick={() => openModal('withdraw')}
            className="flex items-center justify-center px-4 py-2 font-bold text-white bg-yellow-600 rounded hover:bg-yellow-700"
          >
            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
            Withdraw
          </button>
        </div>
      </div>

      <DepositWithdrawModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        action={modalAction}
        onSubmit={handleTransaction}
        isLoading={isTxLoading}
      />
    </>
  );
};
