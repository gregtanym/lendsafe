"use client";

import { ShieldExclamationIcon, NewspaperIcon } from '@heroicons/react/24/outline';

// Mock data for risk analysis
const alerts = [
  {
    level: "High",
    message: "Borrower rE...v7h has been flagged for suspicious on-chain activity.",
    color: "text-red-400",
  },
  {
    level: "Medium",
    message: "Loan LN-004 to rD...q2c is approaching its credit limit.",
    color: "text-yellow-400",
  },
    {
    level: "Low",
    message: "Market volatility may affect USD peg. Monitor liquidity.",
    color: "text-blue-400",
  },
];

const news = [
    { source: "DeFi Times", title: "XRPL experiences surge in institutional interest." },
    { source: "Crypto Daily", title: "New governance proposal submitted by the LendSafe council." },
]

export const LoanRiskAnalysis = () => {
  return (
    <div className="p-6 bg-gray-800 rounded-lg h-full">
      <h3 className="text-xl font-semibold mb-4">Loan Risk Analysis</h3>
      
      {/* Risk Alerts Section */}
      <div className="mb-6">
        <h4 className="text-md font-semibold mb-3 flex items-center text-gray-300">
          <ShieldExclamationIcon className="h-5 w-5 mr-2" />
          Active Alerts
        </h4>
        <ul className="space-y-3">
          {alerts.map((alert, index) => (
            <li key={index} className="p-3 bg-gray-700/50 rounded-lg">
              <p className={`text-sm font-bold ${alert.color}`}>{alert.level} Risk</p>
              <p className="text-xs text-gray-400">{alert.message}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
