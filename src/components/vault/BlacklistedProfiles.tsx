"use client";

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Mock data for blacklisted profiles
const blacklist = [
  { address: "rE...v7h", reason: "Defaulted Loan" },
  { address: "rB...k3m", reason: "Suspicious Activity" },
];

export const BlacklistedProfiles = () => {
  return (
    <div className="p-6 bg-gray-800 rounded-lg h-full">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
        Blacklisted Profiles
      </h3>
      <div className="overflow-y-auto max-h-72">
        <ul className="space-y-3">
          {blacklist.length > 0 ? (
            blacklist.map((profile) => (
              <li key={profile.address} className="p-3 bg-gray-700/50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm text-red-400">{profile.address}</p>
                  <p className="text-xs text-gray-400">{profile.reason}</p>
                </div>
                <button className="text-xs font-medium text-blue-500 hover:underline">
                  Review
                </button>
              </li>
            ))
          ) : (
            <p className="text-sm text-center text-gray-500 py-4">No profiles have been blacklisted.</p>
          )}
        </ul>
      </div>
    </div>
  );
};
