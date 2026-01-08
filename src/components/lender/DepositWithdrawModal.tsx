"use client";

import { XMarkIcon } from '@heroicons/react/24/solid';
import { BanknotesIcon, CreditCardIcon } from '@heroicons/react/24/outline';

type DepositWithdrawModalProps = {
  isOpen: boolean;
  onClose: () => void;
  action: 'deposit' | 'withdraw';
};

export const DepositWithdrawModal = ({ isOpen, onClose, action }: DepositWithdrawModalProps) => {
  if (!isOpen) return null;

  const title = action === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds';
  const Icon = action === 'deposit' ? BanknotesIcon : CreditCardIcon;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const amount = e.currentTarget.amount.value;
    console.log(`${action} submitted for amount:`, amount);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="flex items-center mb-6">
          <Icon className={`h-8 w-8 mr-4 ${action === 'deposit' ? 'text-green-400' : 'text-yellow-400'}`} />
          <h3 className="text-2xl font-bold">{title}</h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-300">
              Amount (wUSD)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 10000"
              required
              min="0.01"
              step="0.01"
            />
          </div>
          <p className="text-xs text-gray-400 mb-6">
            {action === 'deposit' 
              ? 'These funds will be added to the liquidity pool.'
              : 'These funds will be withdrawn from the liquidity pool to your wallet.'}
          </p>
          <div className="flex justify-end">
            <button
              type="submit"
              className={`px-6 py-2 font-bold text-white rounded-lg ${
                action === 'deposit'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {title}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
