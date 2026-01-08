"use client";

import { Header } from "@/components/Header";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

export default function MerchantPage() {
  const [usdAmount, setUsdAmount] = useState("");
  const [xrpAmount, setXrpAmount] = useState(0);

  // 1 USD = 0.1 XRP
  const exchangeRate = 0.1;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setUsdAmount(amount);
    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount) && numericAmount > 0) {
      setXrpAmount(numericAmount * exchangeRate);
    } else {
      setXrpAmount(0);
    }
  };

  const handleSwap = () => {
    // Logic for the swap would go here
    console.log(`Swapping ${usdAmount} USD for ${xrpAmount} XRP...`);
    alert("Swap functionality not yet implemented.");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="p-8 flex flex-col items-center">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-8 text-center">Merchant Swap</h2>
          
          <div className="p-8 bg-gray-800 rounded-lg shadow-xl">
            <div className="mb-4">
              <label htmlFor="usd-amount" className="block mb-2 text-sm font-medium text-gray-300">
                You pay (USD)
              </label>
              <input
                type="number"
                id="usd-amount"
                className="w-full px-4 py-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="0.00"
                value={usdAmount}
                onChange={handleAmountChange}
              />
            </div>
            
            <div className="flex justify-center my-6">
              <ArrowsRightLeftIcon className="h-6 w-6 text-gray-400" />
            </div>

            <div className="mb-6">
              <label htmlFor="xrp-amount" className="block mb-2 text-sm font-medium text-gray-300">
                You receive (XRP)
              </label>
              <div className="w-full px-4 py-3 text-white bg-gray-700/50 border border-gray-600 rounded-lg text-lg">
                {xrpAmount.toFixed(4)}
              </div>
            </div>

            <button
              onClick={handleSwap}
              disabled={!usdAmount || parseFloat(usdAmount) <= 0}
              className="w-full py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              Swap Now
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            Exchange Rate: 1 USD = 0.1 XRP
          </p>
        </div>
      </main>
    </div>
  );
}
