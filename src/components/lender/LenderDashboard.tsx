"use client";

import { Header } from "@/components/Header";
import { FundsDeposited } from "./FundsDeposited";
import { MoneyEarned } from "./MoneyEarned";
import { LiquidityPoolHealth } from "./LiquidityPoolHealth";
import { BorrowerPortfolios } from "./BorrowerPortfolios";
import { BlacklistedProfiles } from "./BlacklistedProfiles";

export default function LenderDashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="p-8">
        <h2 className="text-3xl font-bold mb-8">Lender Dashboard</h2>
        
        <div className="space-y-8">
          {/* Row 1: Liquidity Pool Health */}
          <div className="grid grid-cols-1">
            <LiquidityPoolHealth />
          </div>

          {/* Row 2: Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FundsDeposited />
            <MoneyEarned />
          </div>

          {/* Row 3: Borrower Info */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <BorrowerPortfolios />
            </div>
            <div>
              <BlacklistedProfiles />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
