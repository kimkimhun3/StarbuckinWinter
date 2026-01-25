'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
};

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function Reveal({ children, delay = 0 }: RevealProps) {
  const { ref, visible } = useInView(0.25);

  return (
    <div
      ref={ref}
      className={[
        'transition-all duration-1000 ease-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
      ].join(' ')}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ✅ NEW: Helper function to extract English part from bilingual title
function getEnglishTitle(title: string): string {
  const delimiters = ['|', '/', ' - '];
  
  for (const delimiter of delimiters) {
    if (title.includes(delimiter)) {
      const parts = title.split(delimiter).map(part => part.trim());
      if (parts.length >= 2) {
        // Return the first part (English)
        return parts[0];
      }
    }
  }
  
  // If no delimiter found, return the whole title
  return title;
}

export default function HousesSection() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { posts: allPosts } = await apiClient.getPublicPosts();
      // Get only the 3 latest posts
      const latestPosts = allPosts.slice(0, 3);
      setPosts(latestPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultImage = "https://cdn-imgix.headout.com/media/images/22fba69863f7d95408b199a4796db8e8-Fujinomiya%205th%20Station.jpg?auto=format&w=1222.3999999999999&h=687.6&q=90&ar=16%3A9&crop=faces&fit=crop";

  return (
    <section id="house" className="bg-[#F5F1E8] py-6 xs:py-8 sm:py-10 md:py-12 lg:py-16 xl:py-20 2xl:py-24">
      <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Main Card Container */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 xs:p-4 sm:p-5 md:p-7 lg:p-9 xl:p-10 2xl:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] xl:grid-cols-[2.2fr_1fr] gap-5 xs:gap-6 sm:gap-7 md:gap-9 lg:gap-11 xl:gap-13 2xl:gap-16">
            {/* Left Column: Vertical Title + House Listings */}
            <div className="flex gap-2 xs:gap-3 sm:gap-3.5 md:gap-4 lg:gap-6 xl:gap-7 2xl:gap-10">
              {/* Vertical Title */}
              <Reveal>
                <div className="flex-shrink-0 flex items-start gap-1 xs:gap-1.5 sm:gap-2 md:gap-2 lg:gap-2.5 xl:gap-3">
                  <div 
                    className="text-[22px] xs:text-[24px] sm:text-[28px] md:text-[32px] lg:text-[36px] xl:text-[38px] 2xl:text-[40px] font-light text-[#3D3D3D] leading-none"
                    style={{ writingMode: 'vertical-rl', letterSpacing: '0.15em' }}
                  >
                    さいしんのたび
                  </div>
                  {/* Horizontal Bar - matches text height */}
                  <div className="w-[1px] bg-[#3D3D3D] self-stretch mt-2"></div>
                </div>
              </Reveal>

              {/* House Listings */}
              <div className="flex-1 space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-7 lg:space-y-8 xl:space-y-9 2xl:space-y-11">
                {isLoading ? (
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 2xl:gap-7">
                      <div className="w-32 xs:w-36 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80 aspect-[4/3] bg-gray-200 animate-pulse rounded-sm flex-shrink-0"></div>
                      <div className="flex-1 space-y-2 xs:space-y-2.5 sm:space-y-2.5 md:space-y-3 lg:space-y-3.5">
                        <div className="h-3.5 xs:h-4 sm:h-4 md:h-4.5 lg:h-5 bg-gray-200 animate-pulse w-4/5 rounded"></div>
                        <div className="h-3 xs:h-3 sm:h-3.5 md:h-3.5 lg:h-4 bg-gray-200 animate-pulse w-full rounded"></div>
                        <div className="h-3 xs:h-3 sm:h-3.5 md:h-3.5 lg:h-4 bg-gray-200 animate-pulse w-11/12 rounded"></div>
                      </div>
                    </div>
                  </div>
                ) : posts.length > 0 ? (
                  posts.map((post, index) => (
                    <Reveal key={post.id || index} delay={index * 150}>
                      <div className="flex gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 2xl:gap-7 items-start">
                        {/* Image with Badge */}
                        <div className="relative flex-shrink-0">
                          <div className="w-32 xs:w-36 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80 aspect-[4/3] overflow-hidden rounded-md shadow-sm">
                            <img
                              src={post.coverImage || defaultImage}
                              alt={getEnglishTitle(post.title)}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          </div>
                        </div>
                        
                        {/* Text Content - All on the right */}
                        <div className="flex-1 space-y-1.5 xs:space-y-2 sm:space-y-2 md:space-y-2.5 lg:space-y-3 xl:space-y-3.5 pt-0.5 xs:pt-0.5 sm:pt-1">
                          {/* ✅ UPDATED: Show only English title */}
                          <h3 className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm lg:text-base xl:text-[17px] font-medium text-[#3D3D3D] leading-snug line-clamp-2">
                            {getEnglishTitle(post.title)}
                          </h3>
                          <p className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs lg:text-[13px] text-[#5D5D5D] leading-relaxed line-clamp-3">
                            {post.excerpt || post.description || '移住者の多い地域で始める新しい暮らし'}
                          </p>
                          {/* CTA Link */}
                          <div className="pt-0.5 xs:pt-1">
                            <Link 
                              href={`/blog/${post.slug}`}
                              className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] text-[#3D3D3D] hover:text-[#5D5D5D] transition-colors inline-block border-b border-[#3D3D3D] hover:border-[#5D5D5D] pb-0.5"
                            >
                              詳しくはこちら
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  ))
                ) : (
                  <Reveal>
                    <div className="text-sm text-[#5D5D5D]">投稿がありません</div>
                  </Reveal>
                )}

                {/* More Link */}
                <Reveal delay={300}>
                  <div className="pt-2 xs:pt-2.5 sm:pt-3 md:pt-3.5 lg:pt-4 border-t border-[#E5E5E5] mt-1.5 xs:mt-2">
                    <Link 
                      href="/all"
                      className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs text-[#3D3D3D] inline-block hover:text-[#5D5D5D] transition-colors font-medium"
                    >
                      &gt; もっと見る
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>

            {/* Right Column: About Me */}
            <div className="space-y-3 xs:space-y-3.5 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-7 flex flex-col items-center lg:items-start mt-6 lg:mt-0">
              {/* Circular Image with Badge */}
              <Reveal delay={100}>
                <div className="relative">
                  <div className="w-36 xs:w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72 2xl:w-80 h-36 xs:h-40 sm:h-48 md:h-56 lg:h-64 xl:h-72 2xl:h-80 rounded-full overflow-hidden shadow-lg ring-2 xs:ring-3 sm:ring-4 ring-white/50">
                    <img
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Yellow Badge */}
                  <div className="absolute top-0 right-0 bg-[#FFE500] text-[#3D3D3D] text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium px-2 py-1.5 xs:px-2.5 xs:py-1.5 sm:px-3 sm:py-2 md:px-3.5 md:py-2 lg:px-4 lg:py-2.5 rounded-full shadow-md text-center leading-tight">
                    About<br />Me
                  </div>
                </div>
              </Reveal>

              {/* Text Content - About Me */}
              <Reveal delay={200}>
                <div className="space-y-2 xs:space-y-2.5 sm:space-y-3 md:space-y-3.5 lg:space-y-4 text-center lg:text-left max-w-md px-2 xs:px-3 sm:px-4 md:px-5 lg:px-0">
                  <h3 className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm lg:text-base font-medium text-[#3D3D3D]">
                    About Me
                  </h3>
                  <p className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs lg:text-[13px] text-[#5D5D5D] leading-relaxed">
                    知らない道を探して、日本中を旅しています。小さな発見と出会いを記録するトラベルブログ「みちへしらない」を運営。旅の途中で見つけた景色、人、物語を綴っています。
                  </p>
                  <div className="pt-0.5 xs:pt-1">
                    <Link
                      href="/aboutme"
                      className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] text-[#3D3D3D] hover:text-[#5D5D5D] transition-colors inline-block border-b border-[#3D3D3D] hover:border-[#5D5D5D] pb-0.5"
                    >
                      詳しくはこちら
                    </Link>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}