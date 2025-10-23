"use client";

import React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Header } from "@/components/Header";
import loreData from "../../public/data/lore.json";

// Type definitions
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

export default function LorePage() {
  const { articles } = loreData.lore;

  // Custom components for markdown rendering
  const markdownComponents = {
    h1: ({ children }: any) => (
      <h1 className="font-oswald text-5xl md:text-7xl font-bold mt-16 mb-16 text-foreground first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="font-oswald text-4xl md:text-5xl font-bold mt-10 mb-6 text-foreground">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="font-oswald text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="font-oswald text-xl md:text-2xl font-semibold mt-6 mb-3 text-foreground">
        {children}
      </h4>
    ),
    p: ({ children }: any) => (
      <p className="font-cormorant text-xl md:text-2xl leading-loose tracking-wide mt-14 text-muted-foreground">
        {children}
      </p>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic">{children}</em>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary/50 pl-6 my-10 italic text-xl text-muted-foreground font-cormorant leading-loose tracking-wide">
        {children}
      </blockquote>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside mb-8 space-y-3 font-cormorant text-xl md:text-2xl text-muted-foreground tracking-wide">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside mb-8 space-y-3 font-cormorant text-xl md:text-2xl text-muted-foreground tracking-wide">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="leading-loose">{children}</li>
    ),
    code: ({ children }: any) => (
      <code className="bg-muted px-2 py-1 rounded text-primary font-mono text-base">
        {children}
      </code>
    ),
    pre: ({ children }: any) => (
      <pre className="bg-muted p-6 rounded-lg overflow-x-auto mb-6 border border-border">
        {children}
      </pre>
    ),
    a: ({ href, children }: any) => (
      <a 
        href={href}
        className="text-primary hover:text-primary/80 underline transition-colors"
      >
        {children}
      </a>
    ),
    hr: () => (
      <div className="flex items-center justify-center my-16">
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
        <div className="mx-4 text-muted-foreground text-sm">⬟</div>
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header Section */}
          <header className="text-center mb-16 border-b border-border/20 pb-12">
            <h1 className="font-oswald text-5xl md:text-7xl font-bold mb-6 text-foreground">
              GENESIS OF GENESES
            </h1>
            <p className="font-cormorant text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              The primordial chronicles of Gooch Island, the birth narratives of the CryptoDickButts, and the foundational prophecies of infinite expansion
            </p>
            
            {/* Vitruvian Dickbutt - Pixel Art */}
            <div className="flex justify-center mb-8">
              <img 
                src="/images/genesis-of-geneses/Vetruviandickbutt.png" 
                alt="Vitruvian Dickbutt - The Perfect Proportions of Cosmic Absurdity"
                className="w-64 h-64 md:w-80 md:h-80 object-contain pixel-art"
              />
            </div>
            
          </header>

          {/* Articles in continuous scroll */}
          <div className="space-y-20">
            {articles.map((article: LoreArticle, index: number) => (
              <article key={article.id} className="relative">
                {/* Article Title */}
                <header className="mb-8">
                  {/* <h1 className="font-oswald text-4xl md:text-6xl font-bold mb-4 text-foreground">
                    {article.title}
                  </h1> */}
                </header>

                {/* Article Content - Clickable */}
                <Link href={`/lore/${article.slug}`} className="block hover:bg-muted/20 rounded-lg p-4 -m-4 transition-colors cursor-pointer">
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown 
                      components={markdownComponents}
                      remarkPlugins={[remarkGfm]}
                    >
                      {article.content}
                    </ReactMarkdown>
                  </div>
                </Link>

                {/* Separator between articles */}
                {index < articles.length - 1 && (
                  <div className="flex items-center justify-center mt-20">
                    <div className="w-48 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                    <div className="mx-6 text-muted-foreground text-lg">◆</div>
                    <div className="w-48 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
