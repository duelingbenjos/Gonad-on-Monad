import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Genesis of Geneses - Gonad Chronicles",
  description: "The primordial chronicles of Gooch Island, the birth narratives of the CryptoDickButts, and the foundational prophecies of infinite expansion",
  openGraph: {
    title: "Genesis of Geneses - Gonad Chronicles",
    description: "The primordial chronicles of Gooch Island, the birth narratives of the CryptoDickButts, and the foundational prophecies of infinite expansion",
    images: [
      {
        url: "/gonad.png",
        width: 512,
        height: 512,
        alt: "Gonad Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Genesis of Geneses - Gonad Chronicles",
    description: "The primordial chronicles of Gooch Island, the birth narratives of the CryptoDickButts, and the foundational prophecies of infinite expansion",
    images: ["/gonad.png"],
  },
};

export default function LoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
