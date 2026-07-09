'use client';

import { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api-client';

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
  const [activeImage, setActiveImage] = useState(0);

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

  const openEntry = (entry: RandomMessage) => {
    setSelected(entry);
    setActiveImage(0);
  };

  const closeEntry = () => setSelected(null);

  // All images for the opened entry: cover first, then gallery
  const galleryImages = selected
    ? [selected.coverImage, ...(selected.images || [])].filter(Boolean)
    : [];

  const goToImage = (index: number) => {
    if (galleryImages.length === 0) return;
    setActiveImage((index + galleryImages.length) % galleryImages.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeEntry();
    if (e.key === 'ArrowLeft') goToImage(activeImage - 1);
    if (e.key === 'ArrowRight') goToImage(activeImage + 1);
  };

  // Hide the whole section when there is nothing to show
  if (!isLoading && messages.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#F5F1E8] py-16 sm:py-20 md:py-24 px-6" id="messages">
      <div className="max-w-6xl mx-auto">
        {/* Section heading with vertical Japanese accent */}
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
                  onClick={() => openEntry(entry)}
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
        <div
          className="fixed inset-0 bg-[#2B2B28]/95 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto"
          onClick={closeEntry}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <button
            onClick={closeEntry}
            className="fixed top-5 right-5 text-white text-4xl hover:text-[#D4CFC4] transition-colors z-10"
            aria-label="Close"
          >
            ×
          </button>

          <div
            className="relative w-full max-w-5xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 md:gap-8 items-start">
              {/* Left: image gallery */}
              <div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-[#1f1f1d]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={galleryImages[activeImage]}
                    alt={`${selected.title} ${activeImage + 1}`}
                    className="w-full h-full object-contain"
                  />

                  {galleryImages.length > 1 && (
                    <>
                      <button
                        onClick={() => goToImage(activeImage - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-[#D4CFC4] transition-colors"
                        aria-label="Previous"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => goToImage(activeImage + 1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-[#D4CFC4] transition-colors"
                        aria-label="Next"
                      >
                        ›
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#2B2B28]/70 text-white text-xs px-3 py-1 rounded-full">
                        {activeImage + 1} / {galleryImages.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {galleryImages.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {galleryImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden border-2 transition-colors ${
                          i === activeImage ? 'border-[#F5F1E8]' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: place name + the handwritten memo, styled like a notebook page */}
              <div className="text-[#F5F1E8]">
                <h3 className="text-2xl md:text-3xl font-light mb-2">{selected.title}</h3>
                {selected.description && (
                  <p className="text-sm text-[#D4CFC4] leading-relaxed mb-6">
                    {selected.description}
                  </p>
                )}

                {selected.memo ? (
                  <div className="bg-[#F5F1E8] text-[#2F2F2F] rounded-sm p-6 shadow-lg relative">
                    <span className="block text-[11px] uppercase tracking-widest text-[#9D9D9D] mb-3">
                      Notebook
                    </span>
                    <p
                      className="text-base leading-loose italic whitespace-pre-line"
                      style={{ fontFamily: 'var(--font-shippori), serif' }}
                    >
                      {selected.memo}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-[#9D9D9D] italic">まだことづてはありません。</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
