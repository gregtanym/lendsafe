"use client";

import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

export const MoneyEarned = () => {
  const amount = "800"; // Mock data

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <div className="flex items-center">
        <ArrowTrendingUpIcon className="h-8 w-8 text-green-400 mr-4" />
        <div>
          <p className="text-sm text-gray-400">Total Interest Earned</p>
          <p className="text-2xl font-bold">{amount} XRP</p>
        </div>
      </div>
    </div>
  );
};
