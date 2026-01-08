"use client";

import { XMarkIcon, ShieldCheckIcon, DocumentTextIcon, UserCircleIcon, BellAlertIcon, NoSymbolIcon } from '@heroicons/react/24/solid';

// This is a placeholder type. In a real app, this would be a more detailed model.
type Borrower = {
  address: string;
  companyName?: string;
  creditScore?: string;
  riskScore?: string;
  poc?: string;
};

type BorrowerDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  borrower: Borrower | null;
};

// Mock data for the modal content
const mockDetails = {
    companyName: "Acme Inc.",
    riskScore: "B+",
    poc: "John Doe (john.doe@acme.inc)",
    loanHistory: [
        { id: "LN-001", amount: "5,000 wUSD", status: "Repaid" },
        { id: "LN-004", amount: "50,000 wUSD", status: "Active" },
    ],
    legalDocs: ["Master Loan Agreement.pdf", "Security Agreement.pdf"],
    onChainActivity: ["Large token transfer detected (2M wUSD)", "Multiple failed transactions in the last 24h"],
};

export const BorrowerDetailModal = ({ isOpen, onClose, borrower }: BorrowerDetailModalProps) => {
  if (!isOpen || !borrower) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl p-8 bg-gray-800 rounded-lg shadow-xl"
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
            <h3 className="text-2xl font-bold">{mockDetails.companyName}</h3>
            <p className="font-mono text-sm text-blue-400">{borrower.address}</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {/* Left Column */}
            <div>
                <div className="p-4 bg-gray-700/50 rounded-lg mb-4">
                    <h4 className="font-semibold text-gray-300 mb-2">Scores</h4>
                    <div className="flex justify-around">
                        <div className="text-center">
                            <p className="text-xs text-gray-400">Credit Score</p>
                            <p className="text-lg font-bold text-green-400">{borrower.creditScore}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-400">Risk Score</p>
                            <p className="text-lg font-bold text-yellow-400">{mockDetails.riskScore}</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-700/50 rounded-lg">
                    <h4 className="font-semibold text-gray-300 mb-2 flex items-center"><UserCircleIcon className="h-5 w-5 mr-2"/> Point of Contact</h4>
                    <p>{mockDetails.poc}</p>
                </div>
            </div>

            {/* Right Column */}
            <div>
                <div className="p-4 bg-gray-700/50 rounded-lg mb-4">
                    <h4 className="font-semibold text-gray-300 mb-2 flex items-center"><DocumentTextIcon className="h-5 w-5 mr-2"/> Legal Documents</h4>
                    <ul className="space-y-1 list-disc list-inside">
                        {mockDetails.legalDocs.map(doc => <li key={doc} className="text-blue-400 hover:underline cursor-pointer">{doc}</li>)}
                    </ul>
                </div>
                <div className="p-4 bg-gray-700/50 rounded-lg">
                    <h4 className="font-semibold text-gray-300 mb-2 flex items-center"><BellAlertIcon className="h-5 w-5 mr-2"/> On-Chain Alerts</h4>
                     <ul className="space-y-1 list-disc list-inside">
                        {mockDetails.onChainActivity.map(act => <li key={act}>{act}</li>)}
                    </ul>
                </div>
            </div>
        </div>

        {/* Loan History Table */}
        <div className="mt-6">
            <h4 className="font-semibold text-gray-300 mb-2">Loan History</h4>
            <div className="overflow-y-auto max-h-32">
                <table className="min-w-full text-xs">
                    {/* ... table content ... */}
                </table>
            </div>
        </div>

        {/* Footer Action */}
        <div className="mt-8 pt-4 border-t border-gray-700 flex justify-end">
            <button className="flex items-center px-4 py-2 font-bold text-white bg-red-600 rounded hover:bg-red-700">
                <NoSymbolIcon className="h-5 w-5 mr-2"/>
                Blacklist Profile
            </button>
        </div>

      </div>
    </div>
  );
};
