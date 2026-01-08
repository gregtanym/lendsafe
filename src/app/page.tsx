"use client";

import { useWallet } from "@/contexts/WalletContext";
import BorrowerDashboard from "@/components/dashboard/BorrowerDashboard";
import LenderDashboard from "@/components/lender/LenderDashboard";
import VaultDashboard from "@/components/vault/VaultDashboard";
import MerchantPage from "@/components/merchant/MerchantPage";
import { Header } from "@/components/Header";

export default function Home() {
  const { isConnected, role, isVerified, isVerificationLoading } = useWallet();

  if (isConnected) {
    if (role === 'borrower') {
      return <BorrowerDashboard isVerified={isVerified} isVerificationLoading={isVerificationLoading} />;
    }
    if (role === 'lender') {
      return <LenderDashboard />;
    }
    if (role === 'vault') {
      return <VaultDashboard />;
    }
    if (role === 'merchant') {
      return <MerchantPage />;
    }
  }

  // Default homepage content
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="p-8 text-center">
        <h2 className="text-4xl font-bold mt-20">Welcome to LendSafe</h2>
        <p className="mt-4 text-xl text-gray-300">
          A decentralized lending protocol on the XRP Ledger testnet.
        </p>
        <p className="mt-2 text-lg text-gray-400">
          Connect your wallet to get started.
        </p>
      </main>
    </div>
  );
}
