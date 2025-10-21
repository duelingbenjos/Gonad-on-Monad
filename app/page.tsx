"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { WalletConnectionModal } from "@/components/WalletConnectionModal";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
      </main>
      <WalletConnectionModal />
    </div>
  );
}
