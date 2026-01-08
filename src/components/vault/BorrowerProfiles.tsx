"use client";

import { useState, useEffect } from 'react';
import { BorrowerDetailModal } from './BorrowerDetailModal';

// This is a placeholder type. In a real app, this would be a more detailed model.
type Borrower = {
  account: string;
  companyName: string;
  contactEmail: string;
  creditScore: number;
  riskScore: number;
  documentsURI: string;
};

export const BorrowerProfiles = ({ refreshSignal }: { refreshSignal?: number }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBorrowers = async () => {
      try {
        const response = await fetch('/api/borrowers');
        if (response.ok) {
          const data = await response.json();
          // Filter out blacklisted borrowers
          const activeBorrowers = data.filter((b: any) => b.status !== 'Blacklisted');
          setBorrowers(activeBorrowers);
        }
      } catch (error) {
        console.error("Error fetching borrowers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBorrowers();
  }, [refreshSignal]);

  const handleDetailsClick = (borrower: Borrower) => {
    setSelectedBorrower(borrower);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBorrower(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg h-full flex justify-center items-center">
        <p>Loading borrower profiles...</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 bg-gray-800 rounded-lg h-full">
        <h3 className="text-xl font-semibold mb-4">Borrower Profiles</h3>
        <div className="overflow-y-auto max-h-72">
          {borrowers.length > 0 ? (
            <ul className="space-y-3">
              {borrowers.map((borrower) => (
                <li key={borrower.account} className="p-3 bg-gray-700/50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{borrower.companyName}</p>
                    <p className="font-mono text-xs text-blue-400">{borrower.account.slice(0, 10)}...</p>
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
          ) : (
            <p className="text-sm text-center text-gray-500 py-4">No verified borrowers found.</p>
          )}
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
