"use client";

import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

export const LoanHistory = () => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [loans, setLoans] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loansRes, borrowersRes] = await Promise.all([
          fetch('/api/loans'),
          fetch('/api/borrowers')
        ]);

        if (loansRes.ok && borrowersRes.ok) {
          const loansData = await loansRes.json();
          const borrowersData = await borrowersRes.json();
          setLoans(loansData);
          setBorrowers(borrowersData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getBorrowerName = (address: string) => {
    const borrower = borrowers.find((b: any) => b.account === address);
    return borrower ? borrower.companyName : address;
  };

  const calculateOutstanding = (loan: any) => {
    if (loan.status === 'Repaid') return '0.00';
    
    return loan.installments
      .reduce((total: number, inst: any) => {
        if (!inst.status.includes('Paid')) {
          return total + parseFloat(inst.amount);
        }
        return total;
      }, 0)
      .toFixed(2);
  };

  const getStatusColor = (status: string) => {
    if (status.includes('Paid')) return 'bg-green-900 text-green-300';
    switch (status) {
      case 'Active': return 'bg-blue-900 text-blue-300';
      case 'Repaid': return 'bg-green-900 text-green-300';
      case 'Defaulted': return 'bg-red-900 text-red-300';
      case 'Due': return 'bg-yellow-900 text-yellow-300';
      case 'Late': return 'bg-yellow-900 text-yellow-300'; // For 'Paid (Late)' logic if needed
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
        <p>Loading loan history...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg h-full">
      <h3 className="text-xl font-semibold mb-4">Loan History</h3>
      <div className="overflow-x-auto max-h-[30rem]">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700/50 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3 w-12"></th>
              <th scope="col" className="px-6 py-3">Loan ID</th>
              <th scope="col" className="px-6 py-3">Borrower</th>
              <th scope="col" className="px-6 py-3">Principal Amount</th>
              <th scope="col" className="px-6 py-3">Outstanding / Repaid</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loans.map((loan: any) => (
              <>
                <tr key={loan.id} onClick={() => handleRowClick(loan.id)} className="hover:bg-gray-700/50 cursor-pointer">
                  <td className="px-6 py-4">
                    {expandedRowId === loan.id ? <ChevronDownIcon className="h-4 w-4"/> : <ChevronRightIcon className="h-4 w-4"/>}
                  </td>
                  <td className="px-6 py-4 font-mono">{loan.id}</td>
                  <td className="px-6 py-4 font-medium text-white">{getBorrowerName(loan.borrowerAccount)}</td>
                  <td className="px-6 py-4">{loan.amount} USD</td>
                  <td className="px-6 py-4">
                    {loan.status === 'Repaid' ? (
                      <div><p>{loan.totalAmountOwed} USD</p><p className="text-xs text-gray-400">(Total Repaid)</p></div>
                    ) : (
                      <div><p>{calculateOutstanding(loan)} USD</p><p className="text-xs text-gray-400">(Outstanding)</p></div>
                    )}
                  </td>
                  <td className="px-6 py-4">{loan.issueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(loan.status)}`}>{loan.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    {(loan.status === 'Active' || loan.status === 'Defaulted') && (
                      <button className="text-xs font-medium text-red-500 hover:underline">Clawback</button>
                    )}
                  </td>
                </tr>
                {expandedRowId === loan.id && (
                  <tr className="bg-gray-900/50">
                    <td colSpan={8} className="p-4">
                      <div className="p-4 bg-gray-700/30 rounded-lg">
                        <h4 className="font-semibold mb-2">Installment Details</h4>
                        <table className="min-w-full text-xs">
                          <thead className="text-gray-400">
                            <tr>
                              <th className="px-4 py-2 text-left">Due Date</th>
                              <th className="px-4 py-2 text-left">Amount</th>
                              <th className="px-4 py-2 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loan.installments.map((inst: any) => (
                              <tr key={inst.id} className="border-t border-gray-700">
                                <td className="px-4 py-2">{inst.dueDate}</td>
                                <td className="px-4 py-2">{inst.amount} USD</td>
                                <td className="px-4 py-2">
                                  <span className={`px-2 py-1 font-medium rounded-full ${getStatusColor(inst.status)}`}>{inst.status}</span>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
