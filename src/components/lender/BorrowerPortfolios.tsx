"use client";

import { useState, useEffect } from 'react';

export const BorrowerPortfolios = () => {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [borrowersRes, loansRes] = await Promise.all([
          fetch('/api/borrowers'),
          fetch('/api/loans')
        ]);

        if (borrowersRes.ok && loansRes.ok) {
          const borrowers = await borrowersRes.json();
          const loans = await loansRes.json();

          // Filter only verified/active borrowers (not blacklisted)
          const activeBorrowers = borrowers.filter((b: any) => b.status !== 'Blacklisted');

          const data = activeBorrowers.map((borrower: any) => {
            const borrowerLoans = loans.filter((l: any) => l.borrowerAccount === borrower.account);
            
            const activeLoansCount = borrowerLoans.filter((l: any) => l.status === 'Active').length;
            const totalBorrowed = borrowerLoans.reduce((sum: number, l: any) => sum + parseFloat(l.amount), 0);

            return {
              companyName: borrower.companyName,
              account: borrower.account,
              activeLoans: activeLoansCount,
              totalBorrowed: totalBorrowed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              creditScore: borrower.creditScore
            };
          });

          setPortfolios(data);
        }
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg h-full flex justify-center items-center">
        <p>Loading borrower portfolios...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg h-full">
      <h3 className="text-xl font-semibold mb-4">Borrower Portfolios</h3>
      <div className="overflow-x-auto max-h-[30rem]">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700/50 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">Company Name</th>
              <th scope="col" className="px-6 py-3">Active Loans</th>
              <th scope="col" className="px-6 py-3">Total Borrowed (USD)</th>
              <th scope="col" className="px-6 py-3">Credit Score</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {portfolios.length > 0 ? (
              portfolios.map((portfolio) => (
                <tr key={portfolio.account} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-white">{portfolio.companyName}</td>
                  <td className="px-6 py-4">{portfolio.activeLoans}</td>
                  <td className="px-6 py-4">{portfolio.totalBorrowed}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      portfolio.creditScore >= 750 ? 'bg-green-900 text-green-300' :
                      portfolio.creditScore >= 650 ? 'bg-blue-900 text-blue-300' :
                      'bg-yellow-900 text-yellow-300'
                    }`}>
                      {portfolio.creditScore}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="font-medium text-blue-500 hover:underline text-xs">
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No active borrower portfolios found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
