import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/contexts/WalletContext";
import { GemWalletProvider } from "@/contexts/gemWalletContext";
import { FunctionsProvider } from "@/contexts/FunctionsContext.jsx";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LendSafe XRPL",
  description: "A lending protocol simulation on the XRPL testnet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FunctionsProvider>
          <GemWalletProvider>
            <WalletProvider>
              {children}
            </WalletProvider>
          </GemWalletProvider>
        </FunctionsProvider>
      </body>
    </html>
  );
}
