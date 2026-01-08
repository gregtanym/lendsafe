"use client";

import { ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';

type VerificationStatusProps = {
  isVerified: boolean;
};

export const VerificationStatus = ({ isVerified }: VerificationStatusProps) => {
  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Verification Status</h3>
      {isVerified ? (
        <div className="flex items-center p-4 bg-green-900/50 rounded-lg">
          <ShieldCheckIcon className="h-8 w-8 text-green-400 mr-4" />
          <div>
            <p className="font-bold text-green-400">Verified</p>
            <p className="text-sm text-gray-300">Your account is fully verified.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center p-4 bg-yellow-900/50 rounded-lg">
          <ShieldExclamationIcon className="h-8 w-8 text-yellow-400 mr-4" />
          <div className="flex-grow">
            <p className="font-bold text-yellow-400">Not Verified</p>
            <p className="text-sm text-gray-300">Verify your account to access all features.</p>
          </div>
          <button className="ml-4 px-3 py-1.5 font-semibold text-sm bg-yellow-500 text-gray-900 rounded hover:bg-yellow-600 whitespace-nowrap">
            Verify Now
          </button>
        </div>
      )}
    </div>
  );
};
