"use client";

import { VerificationStatus } from "./VerificationStatus";
import { ActiveLoans } from "./ActiveLoans";
import { LoanRequestModal } from "./LoanRequestModal";
import { Header } from "@/components/Header";
import { useState } from "react";

export default function BorrowerDashboard({ isVerified, isVerificationLoading }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="p-8">
        <h2 className="text-3xl font-bold mb-8">Borrower Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column for Verification and Loan Request */}
          <div className="md:col-span-1 flex flex-col gap-8">
            <VerificationStatus isVerified={isVerified} isLoading={isVerificationLoading} />
            
            {isVerified && (
              <div>
                <h3 className="text-xl font-semibold mb-4">New Loan</h3>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                >
                  Request a Loan
                </button>
              </div>
            )}
          </div>

          {/* Right column for Active Loans */}
          <div className="md:col-span-2">
            <ActiveLoans />
          </div>
        </div>
      </main>

      <LoanRequestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
