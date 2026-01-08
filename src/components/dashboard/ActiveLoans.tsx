"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

export const ActiveLoans = ({ refreshSignal }) => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { wallet } = useWallet();

  useEffect(() => {
    const fetchLoans = async () => {
      if (!wallet?.address) return;

      setIsLoading(true);
      try {
        const response = await fetch('/api/loans');
        if (!response.ok) {
          throw new Error('Failed to fetch loans');
        }
        const allLoans = await response.json();
        // Filter loans for the current borrower
        const borrowerLoans = allLoans.filter(loan => loan.borrowerAccount === wallet.address);
        setLoans(borrowerLoans);
      } catch (error) {
        console.error(error);
        // Handle error state in UI if needed
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoans();
  }, [wallet?.address, refreshSignal]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-900 text-green-300';
      case 'Due': return 'bg-yellow-900 text-yellow-300';
      case 'Pending': return 'bg-gray-600 text-gray-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const handleRowClick = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };
  
  if (isLoading) {
    return (
        <div className="p-6 bg-gray-800 rounded-lg h-full flex justify-center items-center">
            <p>Loading active loans...</p>
        </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg h-full">
      <h3 className="text-xl font-semibold mb-4">Active Loans</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
            <tr>
              <th scope="col" className="p-4 w-12"></th>
              <th scope="col" className="px-6 py-3">Loan ID</th>
              <th scope="col" className="px-6 py-3">Total Amount</th>
              <th scope="col" className="px-6 py-3">Interest Rate</th>
              <th scope="col" className="px-6 py-3">Final Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loans.length > 0 ? (
              loans.map((loan) => (
                <>
                  <tr key={loan.id} onClick={() => handleRowClick(loan.id)} className="hover:bg-gray-700/50 cursor-pointer">
                    <td className="px-4 py-4">
                      {expandedRowId === loan.id ? <ChevronDownIcon className="h-4 w-4"/> : <ChevronRightIcon className="h-4 w-4"/>}
                    </td>
                    <td className="px-6 py-4 font-mono">{loan.id}</td>
                    <td className="px-6 py-4">{loan.amount} wUSD</td>
                    <td className="px-6 py-4">{loan.interestRate}%</td>
                    <td className="px-6 py-4">{loan.installments[loan.installments.length - 1].dueDate}</td>
                  </tr>
                  {expandedRowId === loan.id && (
                    <tr className="bg-gray-900/50">
                      <td colSpan={5} className="p-4">
                        <div className="p-4 bg-gray-700/30 rounded-lg">
                          <h4 className="font-semibold mb-2">Installment Plan</h4>
                          <table className="min-w-full text-xs">
                            <thead className="text-gray-400">
                              <tr>
                                <th className="px-4 py-2 text-left">Due Date</th>
                                <th className="px-4 py-2 text-left">Amount</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loan.installments.map((inst: any) => (
                                <tr key={inst.id} className="border-t border-gray-700">
                                  <td className="px-4 py-2">{inst.dueDate}</td>
                                  <td className="px-4 py-2">{inst.amount} wUSD</td>
                                  <td className="px-4 py-2">
                                    <span className={`px-2 py-1 font-medium rounded-full ${getStatusColor(inst.status)}`}>{inst.status}</span>
                                  </td>
                                  <td className="px-4 py-2">
                                    {inst.status === 'Due' && (
                                      <button className="px-3 py-1 font-bold text-xs text-white bg-blue-600 rounded hover:bg-blue-700">
                                        Pay Now
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  You have no active loans.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
