"use client";

import { useState } from 'react';
import { BorrowerDetailModal } from './BorrowerDetailModal';

// This is a placeholder type. In a real app, this would be a more detailed model.
type Borrower = {
  address: string;
  totalBorrowed: string;
  creditScore: string;
  memberSince: string;
};

// Mock data for borrower portfolios
const borrowers: Borrower[] = [
  {
    address: "rP...f4x",
    totalBorrowed: "15,000 wUSD",
    creditScore: "Good",
    memberSince: "2024-01-15",
  },
  {
    address: "rU...p8g",
    totalBorrowed: "2,500 wUSD",
    creditScore: "Excellent",
    memberSince: "2024-02-20",
  },
  {
    address: "rD...q2c",
    totalBorrowed: "50,000 wUSD",
    creditScore: "Fair",
    memberSince: "2024-03-10",
  },
  {
    address: "rE...v7h",
    totalBorrowed: "7,500 wUSD",
    creditScore: "Poor",
    memberSince: "2024-04-05",
  },
];

export const BorrowerProfiles = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);

  const handleDetailsClick = (borrower: Borrower) => {
    setSelectedBorrower(borrower);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBorrower(null);
  };

  return (
    <>
      <div className="p-6 bg-gray-800 rounded-lg h-full">
        <h3 className="text-xl font-semibold mb-4">Borrower Profiles</h3>
        <div className="overflow-y-auto max-h-72">
          <ul className="space-y-3">
            {borrowers.map((borrower) => (
              <li key={borrower.address} className="p-3 bg-gray-700/50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm text-blue-400">{borrower.address}</p>
                  <p className="text-xs text-gray-400">Member since: {borrower.memberSince}</p>
                </div>
                <button 
                  onClick={() => handleDetailsClick(borrower)}
                  className="text-xs font-medium text-blue-500 hover:underline"
                >
                  Details
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <BorrowerDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        borrower={selectedBorrower}
      />
    </>
  );
};
