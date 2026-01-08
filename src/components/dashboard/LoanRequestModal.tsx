"use client";

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useFunctions } from '@/contexts/FunctionsContext.jsx';
import { useWallet } from '@/contexts/WalletContext';

export const LoanRequestModal = ({ isOpen, onClose, onLoanCreated }) => {
  const { requestAndMintLoan, isLoading, statusMessage } = useFunctions();
  const { wallet } = useWallet();
  
  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState("");
  const [interestRate, setInterestRate] = useState(0);

  useEffect(() => {
    const numericAmount = parseFloat(amount);
    const numericTerm = parseInt(term);
    if (numericAmount > 0 && numericTerm > 0) {
      const baseRate = 3.5;
      const amountFactor = Math.min(numericAmount / 50000, 1) * 2.5;
      const termFactor = Math.min(numericTerm / 24, 1) * 2.0;
      setInterestRate(baseRate + amountFactor + termFactor);
    } else {
      setInterestRate(0);
    }
  }, [amount, term]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (wallet?.address && amount && term && interestRate > 0) {
      await requestAndMintLoan({ 
        amount: parseFloat(amount),
        term: parseInt(term),
        interestRate: interestRate.toFixed(2),
        borrowerAddress: wallet.address 
      });
      // Signal to the parent that the loan was created
      onLoanCreated();
    } else {
      alert("Please fill in all fields and ensure your wallet is connected.");
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 ${isOpen ? '' : 'hidden'}`}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white disabled:text-gray-600"
          disabled={isLoading}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h3 className="text-2xl font-bold mb-6">Request a New Loan</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-300">Loan Amount (wUSD)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="term" className="block mb-2 text-sm font-medium text-gray-300">Loan Term (Months)</label>
            <input
              type="number"
              id="term"
              name="term"
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 12"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              required
            />
          </div>

          <div className="p-4 bg-gray-700/50 rounded-lg mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Calculated Interest Rate:</span>
              <span className="text-xl font-bold text-blue-400">{interestRate.toFixed(2)}%</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            {statusMessage && (
              <div className="text-center text-sm text-yellow-400 mb-4 h-4">{statusMessage}</div>
            )}
            <button
              type="submit"
              disabled={isLoading || !amount || !term}
              className="w-full px-6 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
