"use client";

import { ArrowPathIcon } from '@heroicons/react/24/outline';

export const NetFlow = () => {
  const amount = "+ 50,000.00"; // Mock data
  const isPositive = true;

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <div className="flex items-center">
        <ArrowPathIcon className="h-8 w-8 text-blue-400 mr-4" />
        <div>
          <p className="text-sm text-gray-400">Net Flow (24h)</p>
          <p className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>{amount}</p>
        </div>
      </div>
    </div>
  );
};
