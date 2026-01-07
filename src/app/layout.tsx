import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/contexts/WalletContext";
import { GemWalletProvider } from "@/contexts/gemWalletContext";

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
        <GemWalletProvider>
          <WalletProvider>{children}</WalletProvider>
        </GemWalletProvider>
      </body>
    </html>
  );
}
