"use client";

import { useState, useEffect } from 'react';
import { XMarkIcon, ShieldCheckIcon, DocumentTextIcon, UserCircleIcon, BellAlertIcon, NoSymbolIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import { useFunctions } from '@/contexts/FunctionsContext.jsx';

type Borrower = {
  account: string;
  companyName: string;
  contactEmail: string;
  creditScore: number;
  riskScore: number;
  documentsURI: string;
};

type BorrowerDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  borrower: Borrower | null;
};

export const BorrowerDetailModal = ({ isOpen, onClose, borrower }: BorrowerDetailModalProps) => {
  const [loanHistory, setLoanHistory] = useState<any[]>([]);
  const [isLoadingLoans, setIsLoadingLoading] = useState(false);
  const { clawbackFunds, isLoading: isActionLoading } = useFunctions();

  useEffect(() => {
    const fetchLoanHistory = async () => {
      if (!isOpen || !borrower) return;
      setIsLoadingLoading(true);
      try {
        const response = await fetch('/api/loans');
        if (response.ok) {
          const allLoans = await response.json();
          const filtered = allLoans.filter((l: any) => l.borrowerAccount === borrower.account);
          setLoanHistory(filtered);
        }
      } catch (error) {
        console.error("Error fetching loan history:", error);
      } finally {
        setIsLoadingLoading(false);
      }
    };

    fetchLoanHistory();
  }, [isOpen, borrower]);

  if (!isOpen || !borrower) return null;

  const handleBlacklist = async () => {
    if (confirm(`Are you sure you want to blacklist ${borrower.companyName}? This will trigger a funds clawback and default all their loans.`)) {
      await clawbackFunds(borrower.account);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl p-8 bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="mb-6">
            <h3 className="text-2xl font-bold">{borrower.companyName}</h3>
            <p className="font-mono text-sm text-blue-400">{borrower.account}</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {/* Left Column */}
            <div>
                <div className="p-4 bg-gray-700/50 rounded-lg mb-4">
                    <h4 className="font-semibold text-gray-300 mb-2">Internal Metrics</h4>
                    <div className="flex justify-around">
                        <div className="text-center">
                            <p className="text-xs text-gray-400">Credit Score</p>
                            <p className="text-lg font-bold text-green-400">{borrower.creditScore}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-400">Risk Score</p>
                            <p className="text-lg font-bold text-yellow-400">{borrower.riskScore}</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-700/50 rounded-lg">
                    <h4 className="font-semibold text-gray-300 mb-2 flex items-center"><EnvelopeIcon className="h-5 w-5 mr-2"/> Contact Info</h4>
                    <p className="text-gray-300">{borrower.contactEmail}</p>
                </div>
            </div>

            {/* Right Column */}
            <div>
                <div className="p-4 bg-gray-700/50 rounded-lg mb-4">
                    <h4 className="font-semibold text-gray-300 mb-2 flex items-center"><DocumentTextIcon className="h-5 w-5 mr-2"/> Verification Files</h4>
                    <a 
                      href={borrower.documentsURI} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center"
                    >
                      View Documents on IPFS
                    </a>
                </div>
                <div className="p-4 bg-gray-700/50 rounded-lg">
                    <h4 className="font-semibold text-gray-300 mb-2 flex items-center"><BellAlertIcon className="h-5 w-5 mr-2"/> Risk Alerts</h4>
                     <p className="text-xs text-gray-400">No active high-risk alerts for this borrower.</p>
                </div>
            </div>
        </div>

        {/* Loan History Table */}
        <div className="mt-6">
            <h4 className="font-semibold text-gray-300 mb-2">Specific Loan History</h4>
            <div className="overflow-x-auto bg-gray-900/30 rounded-lg">
                {isLoadingLoans ? (
                  <p className="p-4 text-center text-xs text-gray-500">Loading loans...</p>
                ) : loanHistory.length > 0 ? (
                  <table className="min-w-full text-xs text-left">
                      <thead className="bg-gray-700/50 text-gray-400 uppercase">
                        <tr>
                          <th className="px-4 py-2">ID</th>
                          <th className="px-4 py-2">Amount</th>
                          <th className="px-4 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {loanHistory.map(loan => (
                          <tr key={loan.id}>
                            <td className="px-4 py-2 font-mono">{loan.id}</td>
                            <td className="px-4 py-2">{loan.amount} USD</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-0.5 rounded-full ${
                                loan.status === 'Active' ? 'bg-blue-900 text-blue-300' :
                                loan.status === 'Repaid' ? 'bg-green-900 text-green-300' :
                                'bg-red-900 text-red-300'
                              }`}>
                                {loan.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                  </table>
                ) : (
                  <p className="p-4 text-center text-xs text-gray-500">No loan records found.</p>
                )}
            </div>
        </div>

        {/* Footer Action */}
        <div className="mt-8 pt-4 border-t border-gray-700 flex justify-end">
            <button 
              onClick={handleBlacklist}
              disabled={isActionLoading}
              className="flex items-center px-4 py-2 font-bold text-white bg-red-600 rounded hover:bg-red-700 disabled:bg-gray-600"
            >
                <NoSymbolIcon className="h-5 w-5 mr-2"/>
                {isActionLoading ? 'Processing...' : 'Blacklist Borrower'}
            </button>
        </div>

      </div>
    </div>
  );
};
