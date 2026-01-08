"use client";

import { useState } from 'react';
import { BanknotesIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { DepositWithdrawModal } from './DepositWithdrawModal';

export const FundsDeposited = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'deposit' | 'withdraw'>('deposit');
  
  const depositedAmount = "1,250,000.00"; // Mock data
  const walletBalance = "50,000.00"; // Mock data

  const openModal = (action: 'deposit' | 'withdraw') => {
    setModalAction(action);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="p-6 bg-gray-800 rounded-lg h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center">
            <BanknotesIcon className="h-8 w-8 text-blue-400 mr-4" />
            <div>
              <p className="text-sm text-gray-400">Total Funds Deposited</p>
              <p className="text-2xl font-bold">{depositedAmount} USD</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">Your Wallet Balance</p>
            <p className="font-semibold">{walletBalance} USD</p>
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
      />
    </>
  );
};
