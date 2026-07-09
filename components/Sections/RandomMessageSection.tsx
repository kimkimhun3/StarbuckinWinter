'use client';

import { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import GalleryLightbox from '@/components/GalleryLightbox';

type RandomMessage = {
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

export default function RandomMessageSection() {
  const [messages, setMessages] = useState<RandomMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<RandomMessage | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { messages: data } = await apiClient.getPublicRandomMessages();
        setMessages(data || []);
      } catch (error) {
        console.error('Failed to load random messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Hide the whole section when there is nothing to show
  if (!isLoading && messages.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#F5F1E8] py-16 sm:py-20 md:py-24 px-6" id="messages">
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <Reveal>
          <div className="relative text-center mb-12 md:mb-16">
            <h3 className="text-[#5D5D5D] text-sm uppercase tracking-widest mb-3">
              A Random Message
            </h3>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#2F2F2F] mb-4">
              みちのことづて
            </h2>
            <div className="w-16 h-px bg-[#3D3D3D] mx-auto mb-4"></div>
            <p className="text-[#5D5D5D] max-w-xl mx-auto text-sm md:text-base leading-relaxed">
              山で出会った人たちが、小さなノートに残してくれた言葉たち。
              その場所の写真とともに。
            </p>
          </div>
        </Reveal>

        {/* Grid of cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-[#E5E1D6] rounded-sm mb-4"></div>
                <div className="h-4 bg-[#E5E1D6] rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-[#E5E1D6] rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {messages.map((entry, index) => (
              <Reveal key={entry.id} delay={index * 100}>
                <button
                  onClick={() => setSelected(entry)}
                  className="group block w-full text-left"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-sm group-hover:shadow-lg transition-all duration-500">
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
                    {/* Memo hint */}
                    {entry.memo && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2B2B28]/70 to-transparent p-4">
                        <span className="text-[#F5F1E8] text-xs tracking-wide">ことづてを読む →</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <h4 className="text-base md:text-lg font-medium text-[#2F2F2F] group-hover:text-[#5D5D5D] transition-colors">
                      {entry.title}
                    </h4>
                    {entry.description && (
                      <p className="text-sm text-[#5D5D5D] leading-relaxed line-clamp-2">
                        {entry.description}
                      </p>
                    )}
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* Gallery + memo modal */}
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
          memoLabel="Notebook"
          emptyMemoText="まだことづてはありません。"
        />
      )}
    </section>
  );
}
