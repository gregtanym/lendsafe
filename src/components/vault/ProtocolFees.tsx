"use client";

import { ScaleIcon } from '@heroicons/react/24/outline';

export const ProtocolFees = () => {
  const amount = "1,230.75"; // Mock data

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <div className="flex items-center">
        <ScaleIcon className="h-8 w-8 text-yellow-400 mr-4" />
        <div>
          <p className="text-sm text-gray-400">Accumulated Fees (USD)</p>
          <p className="text-2xl font-bold">{amount}</p>
        </div>
      </div>
    </div>
  );
};
