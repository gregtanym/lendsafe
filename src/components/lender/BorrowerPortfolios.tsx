"use client";

// Mock data for borrower portfolios
const borrowers = [
  {
    address: "rP...f4x",
    activeLoans: 2,
    totalBorrowed: "15,000 USD",
    creditScore: "Good",
  },
  {
    address: "rU...p8g",
    activeLoans: 1,
    totalBorrowed: "2,500 USD",
    creditScore: "Excellent",
  },
  {
    address: "rD...q2c",
    activeLoans: 5,
    totalBorrowed: "50,000 USD",
    creditScore: "Fair",
  },
];

export const BorrowerPortfolios = () => {
  return (
    <div className="p-6 bg-gray-800 rounded-lg h-full">
      <h3 className="text-xl font-semibold mb-4">Borrower Portfolios</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
            <tr>
              <th scope="col" className="px-6 py-3">Borrower Address</th>
              <th scope="col" className="px-6 py-3">Active Loans</th>
              <th scope="col" className="px-6 py-3">Total Borrowed</th>
              <th scope="col" className="px-6 py-3">Credit Score</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {borrowers.map((borrower) => (
              <tr key={borrower.address} className="bg-gray-800/50 border-b border-gray-700 hover:bg-gray-700/50">
                <td className="px-6 py-4 font-mono">{borrower.address}</td>
                <td className="px-6 py-4">{borrower.activeLoans}</td>
                <td className="px-6 py-4">{borrower.totalBorrowed}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    borrower.creditScore === 'Excellent' ? 'bg-green-900 text-green-300' :
                    borrower.creditScore === 'Good' ? 'bg-blue-900 text-blue-300' :
                    'bg-yellow-900 text-yellow-300'
                  }`}>
                    {borrower.creditScore}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="font-medium text-blue-500 hover:underline">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
