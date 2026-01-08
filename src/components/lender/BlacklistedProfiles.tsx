"use client";

import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

type BlacklistedBorrower = {
  account: string;
  companyName: string;
  status: string;
};

export const BlacklistedProfiles = () => {
  const [blacklist, setBlacklist] = useState<BlacklistedBorrower[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlacklist = async () => {
      try {
        const response = await fetch('/api/borrowers');
        if (response.ok) {
          const data = await response.json();
          // Filter only blacklisted borrowers
          const blacklisted = data.filter((b: any) => b.status === 'Blacklisted');
          setBlacklist(blacklisted);
        }
      } catch (error) {
        console.error("Error fetching blacklist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlacklist();
  }, []);

  return (
    <div className="p-6 bg-gray-800 rounded-lg h-full">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
        Blacklisted Profiles
      </h3>
      <div className="overflow-y-auto max-h-72">
        {isLoading ? (
          <p className="text-center text-gray-500 py-4">Loading...</p>
        ) : blacklist.length > 0 ? (
          <ul className="space-y-3">
            {blacklist.map((profile) => (
              <li key={profile.account} className="p-3 bg-gray-700/50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-red-400">{profile.companyName}</p>
                  <p className="font-mono text-xs text-gray-400">{profile.account.slice(0, 10)}...</p>
                </div>
                <div className="text-xs font-medium text-red-500">
                  Revoked
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-center text-gray-500 py-4">No profiles have been blacklisted.</p>
        )}
      </div>
    </div>
  );
};
