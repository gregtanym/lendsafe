"use client";

import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

// Mock data for loan history including installment plans
const history = [
  {
    id: "LN-001",
    borrower: "rP...f4x",
    amount: "5,000 USD",
    date: "2024-05-01",
    status: "Repaid",
    repaidAmount: "5,025 USD",
    installments: [
        { id: 1, dueDate: "2024-06-01", amount: "2,512.50 USD", status: "On Time" },
        { id: 2, dueDate: "2024-07-01", amount: "2,512.50 USD", status: "On Time" },
    ]
  },
  {
    id: "LN-002",
    borrower: "rU...p8g",
    amount: "10,000 USD",
    date: "2024-05-15",
    status: "Active",
    outstandingAmount: "5,050 USD",
    installments: [
        { id: 1, dueDate: "2024-06-15", amount: "5,000 USD", status: "On Time" },
        { id: 2, dueDate: "2024-07-15", amount: "5,000 USD", status: "Pending" },
    ]
  },
  {
    id: "LN-003",
    borrower: "rE...v7h",
    amount: "7,500 USD",
    date: "2024-04-20",
    status: "Defaulted",
    outstandingAmount: "7,800 USD",
    installments: [
        { id: 1, dueDate: "2024-05-20", amount: "3,750 USD", status: "Late" },
        { id: 2, dueDate: "2024-06-20", amount: "3,750 USD", status: "Pending" },
    ]
  },
    {
    id: "LN-004",
    borrower: "rD...q2c",
    amount: "50,000 USD",
    date: "2024-06-01",
    status: "Active",
    outstandingAmount: "50,150 USD",
    installments: [
        { id: 1, dueDate: "2024-07-01", amount: "25,075 USD", status: "Pending" },
        { id: 2, dueDate: "2024-08-01", amount: "25,075 USD", status: "Pending" },
    ]
  },
];

export const LoanHistory = () => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-blue-900 text-blue-300';
      case 'Repaid': return 'bg-green-900 text-green-300';
      case 'Defaulted': return 'bg-red-900 text-red-300';
      case 'On Time': return 'bg-green-900/80 text-green-300';
      case 'Late': return 'bg-yellow-900/80 text-yellow-300';
      case 'Pending': return 'bg-gray-600 text-gray-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const handleRowClick = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

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
            {history.map((loan: any) => (
              <>
                <tr key={loan.id} onClick={() => handleRowClick(loan.id)} className="hover:bg-gray-700/50 cursor-pointer">
                  <td className="px-6 py-4">
                    {expandedRowId === loan.id ? <ChevronDownIcon className="h-4 w-4"/> : <ChevronRightIcon className="h-4 w-4"/>}
                  </td>
                  <td className="px-6 py-4 font-mono">{loan.id}</td>
                  <td className="px-6 py-4 font-mono">{loan.borrower}</td>
                  <td className="px-6 py-4">{loan.amount}</td>
                  <td className="px-6 py-4">
                    {loan.status === 'Repaid' ? (
                      <div><p>{loan.repaidAmount}</p><p className="text-xs text-gray-400">(Repaid)</p></div>
                    ) : (
                      <div><p>{loan.outstandingAmount}</p><p className="text-xs text-gray-400">(Outstanding)</p></div>
                    )}
                  </td>
                  <td className="px-6 py-4">{loan.date}</td>
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
                                <td className="px-4 py-2">{inst.amount}</td>
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
