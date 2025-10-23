"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import loreData from "../../../public/data/lore.json";

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

export default function LoreArticle() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const article = loreData.lore.articles.find((a: LoreArticle) => a.slug === slug);
  const currentIndex = loreData.lore.articles.findIndex((a: LoreArticle) => a.slug === slug);
  const previousArticle = currentIndex > 0 ? loreData.lore.articles[currentIndex - 1] : null;
  const nextArticle = currentIndex < loreData.lore.articles.length - 1 ? loreData.lore.articles[currentIndex + 1] : null;

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24">
          <div className="max-w-4xl mx-auto px-6 py-8 text-center">
            <h1 className="font-oswald text-4xl font-bold mb-4 text-foreground">Genesis Not Found</h1>
            <p className="font-cormorant text-lg text-muted-foreground mb-8">
              The genesis you seek has not been chronicled yet.
            </p>
            <Link href="/lore">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Genesis of Geneses
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Custom components for markdown rendering
  const markdownComponents = {
    h1: ({ children }: any) => (
      <h1 className="font-oswald text-4xl md:text-6xl font-bold mt-12 mb-8 text-foreground first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="font-oswald text-3xl md:text-4xl font-bold mt-10 mb-6 text-foreground">
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
      <p className="font-cormorant text-xl md:text-2xl leading-loose tracking-wide mb-8 text-muted-foreground">
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
      <Link 
        href={href?.startsWith('http') ? href : `/lore/${href}`}
        className="text-primary hover:text-primary/80 underline transition-colors"
      >
        {children}
      </Link>
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
          {/* Back Button */}
          <div className="mb-12">
            <Link href="/lore">
              <Button variant="ghost" size="sm" className="font-cormorant">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Genesis of Geneses
              </Button>
            </Link>
          </div>

          {/* Article */}
          <article>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown 
                components={markdownComponents}
                remarkPlugins={[remarkGfm]}
              >
                {article.content}
              </ReactMarkdown>
            </div>

            {/* Article Footer with Navigation */}
            <footer className="mt-16 pt-8 border-t border-border/20">
              {/* Navigation - Responsive Layout */}
              <div className="mb-8">
                {/* Mobile Layout: Stacked */}
                <div className="flex flex-col items-center gap-4 md:hidden">
                  {/* Genesis of Genesis - Top on Mobile */}
                  <Link href="/lore">
                    <Button variant="outline" className="font-cormorant">
                      Genesis of Geneses
                    </Button>
                  </Link>
                  
                  {/* Previous/Next Buttons Row */}
                  <div className="flex justify-between w-full gap-4">
                    {/* Previous Article */}
                    <div className="w-36">
                      {previousArticle ? (
                        <Link href={`/lore/${previousArticle.slug}`} className="block">
                          <Button variant="ghost" className="font-cormorant p-3 h-auto w-full hover:bg-muted/50 whitespace-normal text-left">
                            <div className="flex flex-col items-start w-full">
                              <div className="flex items-center text-xs text-muted-foreground mb-1">
                                <ArrowLeft className="w-3 h-3 mr-1" />
                                Previous
                              </div>
                              <div className="font-medium text-foreground text-xs leading-tight text-left break-words w-full">
                                {previousArticle.title}
                              </div>
                            </div>
                          </Button>
                        </Link>
                      ) : (
                        <div className="w-full h-16"></div>
                      )}
                    </div>

                    {/* Next Article */}
                    <div className="w-36">
                      {nextArticle ? (
                        <Link href={`/lore/${nextArticle.slug}`} className="block">
                          <Button variant="ghost" className="font-cormorant p-3 h-auto w-full hover:bg-muted/50 whitespace-normal text-right">
                            <div className="flex flex-col items-end w-full">
                              <div className="flex items-center text-xs text-muted-foreground mb-1">
                                Next
                                <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
                              </div>
                              <div className="font-medium text-foreground text-xs leading-tight text-right break-words w-full">
                                {nextArticle.title}
                              </div>
                            </div>
                          </Button>
                        </Link>
                      ) : (
                        <div className="w-full h-16"></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop Layout: 3 Column Grid */}
                <div className="hidden md:grid grid-cols-3 gap-4 items-start">
                  {/* Previous Article */}
                  <div className="flex justify-start">
                    {previousArticle ? (
                      <Link href={`/lore/${previousArticle.slug}`} className="block">
                        <Button variant="ghost" className="font-cormorant p-4 h-auto w-48 hover:bg-muted/50 whitespace-normal text-left">
                          <div className="flex flex-col items-start w-full">
                            <div className="flex items-center text-sm text-muted-foreground mb-2">
                              <ArrowLeft className="w-4 h-4 mr-2" />
                              Previous
                            </div>
                            <div className="font-medium text-foreground text-sm leading-snug text-left break-words w-full">
                              {previousArticle.title}
                            </div>
                          </div>
                        </Button>
                      </Link>
                    ) : (
                      <div className="w-48 h-20"></div>
                    )}
                  </div>

                  {/* Back to Genesis - Center */}
                  <div className="flex justify-center items-start pt-4">
                    <Link href="/lore">
                      <Button variant="outline" className="font-cormorant whitespace-nowrap">
                        Genesis of Geneses
                      </Button>
                    </Link>
                  </div>

                  {/* Next Article */}
                  <div className="flex justify-end">
                    {nextArticle ? (
                      <Link href={`/lore/${nextArticle.slug}`} className="block">
                        <Button variant="ghost" className="font-cormorant p-4 h-auto w-48 hover:bg-muted/50 whitespace-normal text-right">
                          <div className="flex flex-col items-end w-full">
                            <div className="flex items-center text-sm text-muted-foreground mb-2">
                              Next
                              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                            </div>
                            <div className="font-medium text-foreground text-sm leading-snug text-right break-words w-full">
                              {nextArticle.title}
                            </div>
                          </div>
                        </Button>
                      </Link>
                    ) : (
                      <div className="w-48 h-20"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reading Progress Indicator */}
              <div className="text-center text-sm text-muted-foreground">
                Article {currentIndex + 1} of {loreData.lore.articles.length}
              </div>
            </footer>
          </article>
        </div>
      </main>
    </div>
  );
}
