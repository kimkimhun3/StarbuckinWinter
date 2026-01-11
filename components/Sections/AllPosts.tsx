'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import AnimatedVerticalTitle from '@/components/UI/Animatedverticaltitle';

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

// Helper function to format view count
function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`.replace('.0K', 'K');
  }
  return count.toString();
}

export default function AllPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedTag = searchParams.get('tag') || null;

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    // Filter posts when tag changes
    if (selectedTag) {
      const filtered = allPosts.filter((post) => 
        post.tags && post.tags.includes(selectedTag)
      );
      setPosts(filtered);
    } else {
      setPosts(allPosts);
    }
  }, [selectedTag, allPosts]);

  const loadPosts = async () => {
    try {
      const { posts: allPostsData } = await apiClient.getPublicPosts();
      // Get ALL posts (no slicing)
      setAllPosts(allPostsData);
      if (!selectedTag) {
        setPosts(allPostsData);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get all unique tags from all posts
  const getAllTags = () => {
    const tagSet = new Set<string>();
    allPosts.forEach((post) => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag: string) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  };

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      // Clear filter if clicking the same tag
      router.push('/all');
    } else {
      router.push(`/all?tag=${encodeURIComponent(tag)}`);
    }
  };

  const defaultImage = "https://cdn-imgix.headout.com/media/images/22fba69863f7d95408b199a4796db8e8-Fujinomiya%205th%20Station.jpg?auto=format&w=1222.3999999999999&h=687.6&q=90&ar=16%3A9&crop=faces&fit=crop";

  const allTags = getAllTags();

  return (
    <section className="bg-[#F5F1E8] min-h-screen py-10 sm:py-14 md:py-18 lg:py-22 xl:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
        
        {/* Animated Title */}
        <div className="flex justify-center mb-12 sm:mb-14 md:mb-16 lg:mb-20">
          <AnimatedVerticalTitle 
            words={['むかう', 'つづきを']} 
            initialDelay={0.3}
            barHeights={[ 180, 240]}
          />
        </div>

        {/* Tags Filter */}
        {!isLoading && allTags.length > 0 && (
          <Reveal delay={100}>
            <div className="mb-8 sm:mb-10 md:mb-12">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-sm sm:text-base font-medium text-[#3D3D3D]">Tags:</span>
                <button
                  onClick={() => router.push('/all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    !selectedTag
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-[#3D3D3D] hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedTag === tag
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-[#3D3D3D] hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
              {selectedTag && (
                <div className="text-sm text-[#5D5D5D]">
                  Showing posts tagged with: <span className="font-semibold text-[#3D3D3D]">#{selectedTag}</span>
                  {' '}
                  <button
                    onClick={() => router.push('/all')}
                    className="text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Clear filter
                  </button>
                </div>
              )}
            </div>
          </Reveal>
        )}

        {/* Posts Grid */}
        <div className="rounded-xl p-5 sm:p-7 md:p-9 lg:p-11 xl:p-12">
          {isLoading ? (
            // Loading Skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="w-full aspect-[4/3] bg-gray-200 animate-pulse rounded-md"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 animate-pulse w-3/4 rounded"></div>
                    <div className="h-3 bg-gray-200 animate-pulse w-full rounded"></div>
                    <div className="h-3 bg-gray-200 animate-pulse w-5/6 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
              {posts.map((post, index) => (
                <Reveal key={post.id || index} delay={index * 100}>
                  <Link href={`/blog/${post.slug}`} className="block group">
                    <article className="space-y-4">
                      {/* Post Image with View Count Badge */}
                      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-md shadow-sm">
                        <img
                          src={post.coverImage || defaultImage}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* View Count Badge - Top Right */}
                        {post.viewCount !== undefined && (
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-medium">
                            <svg 
                              className="w-3.5 h-3.5" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                              />
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                              />
                            </svg>
                            <span>{formatViewCount(post.viewCount || 0)}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Post Content */}
                      <div className="space-y-2">
                        <h3 className="text-base sm:text-lg md:text-xl font-medium text-[#3D3D3D] leading-snug line-clamp-2 group-hover:text-[#5D5D5D] transition-colors">
                          {post.title}
                        </h3>
                        
                        <p className="text-xs sm:text-sm md:text-[15px] text-[#5D5D5D] leading-relaxed line-clamp-3">
                          {post.excerpt || post.description || '旅の記録を綴っています'}
                        </p>
                        
                        {/* Date if available */}
                        {post.publishedAt && (
                          <p className="text-xs text-[#9D9D9D] mt-2">
                            {new Date(post.publishedAt).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                    </article>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            // No Posts
            <Reveal>
              <div className="text-center py-20">
                <p className="text-lg text-[#5D5D5D]">まだ投稿がありません</p>
                <p className="text-sm text-[#9D9D9D] mt-2">No posts yet</p>
              </div>
            </Reveal>
          )}
        </div>

        {/* Back to Home Link */}
        <Reveal delay={200}>
          <div className="flex justify-center mt-12 sm:mt-14 md:mt-16">
            <Link 
              href="/"
              className="text-sm sm:text-base text-[#3D3D3D] hover:text-[#5D5D5D] transition-colors inline-flex items-center gap-2 border-b border-[#3D3D3D] hover:border-[#5D5D5D] pb-1"
            >
              ← ホームに戻る
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}