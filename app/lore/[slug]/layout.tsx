import type { Metadata } from "next";
import loreData from "../../../public/data/lore.json";

interface LoreArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  author: string;
  readTime: string;
  tags: string[];
  featured: boolean;
  seoImage: string;
  content: string;
}

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const article = loreData.lore.articles.find((a: LoreArticle) => a.slug === slug);

  if (!article) {
    return {
      title: "Genesis Not Found - Gonad Chronicles",
      description: "The genesis you seek has not been chronicled yet.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gonadnft.com";
  const ogImage = article.seoImage || "/gonad.png";

  return {
    title: `${article.title} - Genesis of Geneses`,
    description: article.excerpt,
    keywords: article.tags.join(", "),
    authors: [{ name: article.author }],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      url: `${baseUrl}/lore/${article.slug}`,
      siteName: "Gonad - Genesis of Geneses",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [ogImage],
      creator: "@gonadnft",
      site: "@gonadnft",
    },
    alternates: {
      canonical: `${baseUrl}/lore/${article.slug}`,
    },
    other: {
      'article:author': article.author,
      'article:published_time': article.publishedAt,
      'article:section': article.category,
      'article:tag': article.tags.join(','),
    },
  };
}

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
