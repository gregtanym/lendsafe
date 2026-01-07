import { Header } from "@/components/Header";
import { AccountInfo } from "@/components/AccountInfo";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="p-8">
        <h2 className="text-3xl font-bold">Welcome to LendSafe</h2>
        <p className="mt-2 text-lg">
          A decentralized lending protocol on the XRP Ledger testnet.
        </p>
        <AccountInfo />
      </main>
    </div>
  );
}
