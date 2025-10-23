"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from 'wagmi';
import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { 
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  rainbowWallet,
  phantomWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { WalletProvider } from '@/contexts/WalletContext';
import { AuthProvider } from '@/contexts/AuthContext';
import '@rainbow-me/rainbowkit/styles.css';

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'gonad-demo-project-id';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Installed',
      wallets: [
        injectedWallet,
        metaMaskWallet,
        phantomWallet,
      ],
    },
    {
      groupName: 'Popular',
      wallets: [
        coinbaseWallet,
        walletConnectWallet,
        rainbowWallet,
      ],
    },
  ],
  { appName: 'Gonad on Monad', projectId }
);

const config = createConfig({
  connectors,
  chains: [mainnet, polygon, optimism, arbitrum, base],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          modalSize="compact" 
          showRecentTransactions={false}
          appInfo={{
            appName: 'Gonad on Monad',
            learnMoreUrl: 'https://gonadnft.com',
          }}
        >
          <WalletProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </WalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
