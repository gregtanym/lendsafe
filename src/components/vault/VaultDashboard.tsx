"use client";

import { Header } from "@/components/Header";
import { CirculatingSupply } from "./CirculatingSupply";
import { TotalXRP } from "./TotalXRP";
import { ProtocolFees } from "./ProtocolFees";
import { NetFlow } from "./NetFlow";
import { LoanHistory } from "./LoanHistory";
import { BorrowerProfiles } from "./BorrowerProfiles";
import { LenderProfiles } from "./LenderProfiles";
import { BlacklistedProfiles } from "./BlacklistedProfiles";
import { LoanRiskAnalysis } from "./LoanRiskAnalysis";

export default function VaultDashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="p-8">
        <h2 className="text-3xl font-bold mb-8">Vault Dashboard</h2>
        
        {/* Top row for summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <CirculatingSupply />
          <TotalXRP />
          <ProtocolFees />
          <NetFlow />
        </div>

        {/* Loan History (Full Width) */}
        <div className="mb-8">
          <LoanHistory />
        </div>

        {/* Loan Risk Analysis (Full Width) */}
        <div className="mb-8">
          <LoanRiskAnalysis />
        </div>

        {/* Bottom row for profiles */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <BorrowerProfiles />
          <LenderProfiles />
          <BlacklistedProfiles />
        </div>
      </main>
    </div>
  );
}
