"use client";

import { ConnectWallet } from "./ConnectWallet";

export const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <h1 className="text-2xl font-bold">LendSafe XRPL</h1>
      <ConnectWallet />
    </header>
  );
};
