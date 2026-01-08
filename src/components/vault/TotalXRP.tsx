"use client";

import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

export const TotalXRP = () => {
  const amount = "500,000.00"; // Mock data

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <div className="flex items-center">
        {/* Using CurrencyDollarIcon as a stand-in for XRP logo */}
        <CurrencyDollarIcon className="h-8 w-8 text-green-400 mr-4" />
        <div>
          <p className="text-sm text-gray-400">Total XRP in Vault</p>
          <p className="text-2xl font-bold">{amount}</p>
        </div>
      </div>
    </div>
  );
};
