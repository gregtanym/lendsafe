"use client";

import { XMarkIcon } from '@heroicons/react/24/solid';
import { useFunctions } from '@/contexts/FunctionsContext.jsx';
import { useWallet } from '@/contexts/WalletContext';

export const VerificationModal = ({ isOpen, onClose }) => {
  const { startVerificationWorkflow, isLoading, statusMessage } = useFunctions();
  const { wallet } = useWallet();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (wallet?.address) {
      await startVerificationWorkflow(wallet.address);
    } else {
      alert("Wallet is not connected.");
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 ${isOpen ? '' : 'hidden'}`}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl p-8 bg-gray-800 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white disabled:text-gray-600"
          disabled={isLoading}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h3 className="text-2xl font-bold mb-6">Borrower Verification</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="companyName" className="block mb-1 text-sm font-medium text-gray-300">Company Name</label>
            <input type="text" id="companyName" defaultValue="Acme Inc." className="w-full input-style" />
          </div>
          <div>
            <label htmlFor="poc" className="block mb-1 text-sm font-medium text-gray-300">Point of Contact</label>
            <input type="text" id="poc" defaultValue="John Doe" className="w-full input-style" />
          </div>
          <div>
            <label htmlFor="docs" className="block mb-1 text-sm font-medium text-gray-300">Financial & Legal Documents</label>
            <input type="file" id="docs" className="w-full file-input-style" multiple />
          </div>
          
          <div className="pt-4">
            {statusMessage && (
              <div className="text-center text-sm text-yellow-400 mb-4">{statusMessage}</div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : 'Submit and Accept Credential'}
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
        .input-style {
          padding: 0.75rem 1rem;
          color: white;
          background-color: #374151; /* bg-gray-700 */
          border: 1px solid #4b5563; /* border-gray-600 */
          border-radius: 0.5rem;
        }
        .file-input-style {
            font-size: 0.875rem;
        }
        .file-input-style::file-selector-button {
            padding: 0.5rem 1rem;
            margin-right: 1rem;
            background-color: #4b5563; /* bg-gray-600 */
            color: white;
            border: none;
            border-radius: 0.25rem;
            cursor: pointer;
        }
        .file-input-style::file-selector-button:hover {
            background-color: #6b7280; /* bg-gray-500 */
        }
      `}</style>
    </div>
  );
};
