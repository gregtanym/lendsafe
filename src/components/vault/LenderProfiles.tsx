"use client";

// Mock data for lender profiles
const lenders = [
  {
    address: "rL...e9d",
    totalDeposited: "1,250,000 USD",
    share: "50%",
  },
  {
    address: "rN...t2f",
    totalDeposited: "750,000 USD",
    share: "30%",
  },
  {
    address: "rG...b5k",
    totalDeposited: "500,000 USD",
    share: "20%",
  },
];

export const LenderProfiles = () => {
  return (
    <div className="p-6 bg-gray-800 rounded-lg h-full">
      <h3 className="text-xl font-semibold mb-4">Lender Profiles</h3>
      <div className="overflow-y-auto max-h-72">
        <ul className="space-y-3">
          {lenders.map((lender) => (
            <li key={lender.address} className="p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm text-green-400">{lender.address}</p>
                <p className="text-xs font-mono text-gray-300">Share: {lender.share}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Deposited: {lender.totalDeposited}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
