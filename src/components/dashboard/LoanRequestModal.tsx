"use client";

import { XMarkIcon } from '@heroicons/react/24/solid';

type LoanRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const LoanRequestModal = ({ isOpen, onClose }: LoanRequestModalProps) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Loan request submitted");
    onClose(); // Close modal on submit
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h3 className="text-2xl font-bold mb-6">Request a New Loan</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-300">
              Loan Amount (wUSD)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 5000"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="term" className="block mb-2 text-sm font-medium text-gray-300">
              Loan Term (Months)
            </label>
            <input
              type="number"
              id="term"
              name="term"
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 12"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-700"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
