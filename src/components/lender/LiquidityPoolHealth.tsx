"use client";

import { HeartIcon } from '@heroicons/react/24/outline';
import { UtilizationCurveChart } from './UtilizationCurveChart';

export const LiquidityPoolHealth = () => {
  // Mock data
  const totalDeposited = 2500000;
  const totalBorrowed = 1875000;
  const utilizationRate = (totalBorrowed / totalDeposited) * 100;

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <div className="flex items-center mb-4">
        <HeartIcon className="h-8 w-8 text-red-400 mr-4" />
        <div>
          <p className="text-sm text-gray-400">Liquidity Pool Health</p>
          <p className="text-xl font-bold">Good</p>
        </div>
      </div>
      <div className="space-y-2 text-sm mb-6">
        <div className="flex justify-between">
          <span className="text-gray-400">Total Deposited:</span>
          <span className="font-mono">{totalDeposited.toLocaleString()} USD</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Total Borrowed:</span>
          <span className="font-mono">{totalBorrowed.toLocaleString()} USD</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Utilization Rate:</span>
          <span className="font-mono font-bold text-blue-400">{utilizationRate.toFixed(2)}%</span>
        </div>
      </div>

      <div>
        <h4 className="text-md font-semibold mb-2 text-gray-300">Utilization Curve</h4>
        <p className="text-xs text-gray-500 mb-4">
          Shows how the interest rate for borrowers increases as more of the pool's liquidity is utilized.
        </p>
        <UtilizationCurveChart />
      </div>
    </div>
  );
};
