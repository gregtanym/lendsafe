"use client";

import { CircleStackIcon } from '@heroicons/react/24/outline';

export const CirculatingSupply = () => {
  const amount = "1,875,000.00"; // Mock data

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <div className="flex items-center">
        <CircleStackIcon className="h-8 w-8 text-indigo-400 mr-4" />
        <div>
          <p className="text-sm text-gray-400">wUSD Circulating Supply</p>
          <p className="text-2xl font-bold">{amount}</p>
        </div>
      </div>
    </div>
  );
};
