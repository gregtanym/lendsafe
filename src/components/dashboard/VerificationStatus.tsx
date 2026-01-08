"use client";

import { useState } from 'react';
import { ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';
import { VerificationModal } from './VerificationModal';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

type VerificationStatusProps = {
  isVerified: boolean;
  isLoading: boolean;
};

export const VerificationStatus = ({ isVerified, isLoading }: VerificationStatusProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center p-4 bg-gray-700 rounded-lg">
          <ArrowPathIcon className="h-8 w-8 text-gray-400 mr-4 animate-spin" />
          <div>
            <p className="font-bold text-gray-300">Checking Status...</p>
            <p className="text-sm text-gray-400">Verifying your credential on the ledger.</p>
          </div>
        </div>
      );
    }

    if (isVerified) {
      return (
        <div className="flex items-center p-4 bg-green-900/50 rounded-lg">
          <ShieldCheckIcon className="h-8 w-8 text-green-400 mr-4" />
          <div>
            <p className="font-bold text-green-400">Verified</p>
            <p className="text-sm text-gray-300">Your account is a verified borrower.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center p-4 bg-yellow-900/50 rounded-lg">
        <ShieldExclamationIcon className="h-8 w-8 text-yellow-400 mr-4" />
        <div className="flex-grow">
          <p className="font-bold text-yellow-400">Not Verified</p>
          <p className="text-sm text-gray-300">Verify your account to request loans.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="ml-4 px-3 py-1.5 font-semibold text-sm bg-yellow-500 text-gray-900 rounded hover:bg-yellow-600 whitespace-nowrap"
        >
          Verify Now
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="p-6 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Verification Status</h3>
        {renderContent()}
      </div>

      <VerificationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
