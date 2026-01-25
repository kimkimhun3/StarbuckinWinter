'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import WavyLineDividerAdvanced from '@/components/Hero/Wavylinedivideradvanced';

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

export default function ProfilesSection() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Specific post IDs for Best 3 Discovery
  const bestDiscoveryIds = [
    'cmicvza67000327bwpuakg2ts',
    'cmicw653c000727bwwgdihtdx',
    'cmiczu2tt0001n6opwrm689vn'
  ];

  useEffect(() => {
    loadBestDiscoveries();
  }, []);

  const loadBestDiscoveries = async () => {
    try {
      const postPromises = bestDiscoveryIds.map(id => 
        apiClient.getPost(id).catch(err => {
          console.error(`Failed to load post ${id}:`, err);
          return null;
        })
      );
      
      const postResults = await Promise.all(postPromises);
      const validPosts = postResults
        .filter(result => result !== null && result.post && result.post.published)
        .map(result => result.post)
        .slice(0, 3);
      
      setPosts(validPosts);
    } catch (error) {
      console.error('Failed to load best discoveries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultImage = "https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200";

  return (
    <section id="sawada" className="bg-white py-12 sm:py-14 md:py-16 lg:py-20 xl:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        
        {/* Section Title with Underline */}
        <Reveal>
          <div className="text-center mb-10 sm:mb-12 md:mb-14 lg:mb-16 xl:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-[#3D3D3D] mb-2 sm:mb-3 md:mb-4 inline-block">
              ベスト3ディスカバリー
            </h2>
            <div className="w-full max-w-md mx-auto h-[2px] bg-[#3D3D3D] mt-2 sm:mt-3 md:mt-4"></div>
          </div>
        </Reveal>

        {/* Profile Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-14">
            {[1, 2, 3].map((index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 rounded-sm mb-4 sm:mb-5 md:mb-6"></div>
                <div className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4 mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-14">
            {posts.map((post, index) => (
              <Reveal key={post.id || index} delay={index * 100}>
                <Link href={`/blog/${post.slug}`} className="block group">
                  <article className="space-y-4 sm:space-y-5 md:space-y-6">
                    {/* Image with Vertical Text Overlay */}
                    <div className="relative aspect-[4/3] overflow-hidden rounded-sm shadow-md group-hover:shadow-xl transition-shadow duration-300">
                      {/* ✅ UPDATED: Image alt text with English only */}
                      <img
                        src={post.coverImage || defaultImage}
                        alt={getEnglishTitle(post.title)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                    </div>

                    {/* Text Content Below Image */}
                    <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                      {/* ✅ UPDATED: Name with English only */}
                      <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-[#3D3D3D]">
                        {getEnglishTitle(post.title)}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-xs sm:text-sm md:text-base text-[#5D5D5D] leading-relaxed line-clamp-3">
                        {post.excerpt || post.description || '移住者の多い地域で始める新しい暮らし。小さな町での日々の発見と出会いを記録しています。'}
                      </p>
                      
                      {/* Link with Border */}
                      <div className="pt-2 sm:pt-3 md:pt-4">
                        <span className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-[#3D3D3D] inline-block border-b border-[#3D3D3D] pb-1 group-hover:text-[#5D5D5D] group-hover:border-[#5D5D5D] transition-colors">
                          &gt; 詳しくはこちら
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="text-center text-[#5D5D5D] py-12">
              <p className="text-sm sm:text-base md:text-lg">投稿が見つかりませんでした</p>
            </div>
          </Reveal>
        )}

        {/* View All Link */}
        {!isLoading && posts.length > 0 && (
          <Reveal delay={300}>
            <div className="flex justify-start mt-10 sm:mt-12 md:mt-14 lg:mt-16">
              <Link 
                href="/all"
                className="text-sm sm:text-base md:text-lg text-[#3D3D3D] inline-block  pb-1 hover:text-[#5D5D5D] hover:border-[#5D5D5D] transition-colors font-medium"
              >
                &gt; もっと見る
              </Link>
            </div>
          </Reveal>
        )}
        
      </div>  
      <WavyLineDividerAdvanced 
        style="gentle"
        color="#5D5D5D"
        strokeWidth={1.5}
        height={80}
        speed={7}
        opacity={0.6}
        reverse={true}
      />    
    </section>
    
  );
}