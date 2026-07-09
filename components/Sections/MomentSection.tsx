'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import GalleryLightbox from '@/components/GalleryLightbox';

type Moment = {
  id: string;
  title: string;
  description?: string | null;
  coverImage: string;
  memo?: string | null;
  images: string[];
};

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
  const { ref, visible } = useInView(0.2);

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

export default function MomentSection() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Moment | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { moments: data } = await apiClient.getPublicMoments();
        setMoments(data || []);
      } catch (error) {
        console.error('Failed to load moments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Hide the whole section when there is nothing to show
  if (!isLoading && moments.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-16 sm:py-20 md:py-24 px-6" id="kamo">
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <Reveal>
          <div className="mb-12 md:mb-16 text-center">
            <h3 className="text-[#5D5D5D] text-sm uppercase tracking-widest mb-3">
              Moments, Captured
            </h3>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#2F2F2F] mb-4">
              iPhone 16 Pro が切り取った瞬間
            </h2>
            <div className="w-16 h-px bg-[#3D3D3D] mx-auto mb-4"></div>
            <p className="text-[#5D5D5D]">
              旅の途中で、iPhone 16 Pro と出会った風景
            </p>
          </div>
        </Reveal>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-10 md:mb-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[3/4] bg-[#F0ECE1] rounded-sm animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-10 md:mb-12">
            {moments.map((entry, index) => (
              <Reveal key={entry.id} delay={index * 80}>
                <button
                  onClick={() => setSelected(entry)}
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-sm shadow-sm hover:shadow-lg transition-all duration-500 group text-left"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.coverImage}
                    alt={entry.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Photo count badge when there are extra images */}
                  {entry.images && entry.images.length > 0 && (
                    <div className="absolute top-3 right-3 bg-[#2B2B28]/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {entry.images.length + 1}
                    </div>
                  )}
                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2B2B28]/80 to-transparent p-4">
                    <p className="text-white text-sm tracking-wide">{entry.title}</p>
                    {entry.description && (
                      <p className="text-[#D4CFC4] text-xs mt-0.5 line-clamp-1">
                        {entry.description}
                      </p>
                    )}
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/all"
            className="inline-block border border-[#3D3D3D] text-[#3D3D3D] px-8 py-3 hover:bg-[#3D3D3D] hover:text-white transition-colors text-sm tracking-wide"
          >
            みちのかけらをもっと見る
          </Link>
        </div>
      </div>

      {/* Gallery + message modal */}
      {selected && (
        <GalleryLightbox
          key={selected.id}
          entry={{
            title: selected.title,
            description: selected.description,
            memo: selected.memo,
            images: [selected.coverImage, ...(selected.images || [])],
          }}
          onClose={() => setSelected(null)}
          memoLabel="Note"
          emptyMemoText="メッセージはありません。"
        />
      )}
    </section>
  );
}
