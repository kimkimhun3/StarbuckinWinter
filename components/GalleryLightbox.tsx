'use client';

import { useState } from 'react';

export type GalleryEntry = {
  title: string;
  description?: string | null;
  memo?: string | null;
  /** Combined image list: cover first, then gallery images */
  images: string[];
};

interface GalleryLightboxProps {
  entry: GalleryEntry;
  onClose: () => void;
  /** Label shown above the memo card (e.g. "Notebook") */
  memoLabel?: string;
  /** Text shown when there is no memo */
  emptyMemoText?: string;
}

// Mount one instance per opened entry (via a `key` on the parent) so
// `activeImage` starts fresh each time without needing a reset effect.
export default function GalleryLightbox({
  entry,
  onClose,
  memoLabel = 'Notebook',
  emptyMemoText = 'まだメッセージはありません。',
}: GalleryLightboxProps) {
  const [activeImage, setActiveImage] = useState(0);

  const images = entry.images.filter(Boolean);

  const goToImage = (index: number) => {
    if (images.length === 0) return;
    setActiveImage((index + images.length) % images.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') goToImage(activeImage - 1);
    if (e.key === 'ArrowRight') goToImage(activeImage + 1);
  };

  return (
    <div
      className="fixed inset-0 bg-[#2B2B28]/95 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <button
        onClick={onClose}
        className="fixed top-5 right-5 text-white text-4xl hover:text-[#D4CFC4] transition-colors z-10"
        aria-label="Close"
      >
        ×
      </button>

      <div
        className="relative w-full max-w-sm sm:max-w-2xl lg:max-w-4xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5 sm:gap-6 md:gap-8 items-start">
          {/* Left: image gallery */}
          <div>
            <div className="relative overflow-hidden rounded-sm bg-[#1f1f1d] flex items-center justify-center">
              {images[activeImage] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[activeImage]}
                  alt={`${entry.title} ${activeImage + 1}`}
                  className="w-auto h-auto max-w-full max-h-[38vh] sm:max-h-[48vh] lg:max-h-[58vh] object-contain"
                />
              )}

              {images.length > 1 && (
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
                    {activeImage + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden border-2 transition-colors ${
                      i === activeImage
                        ? 'border-[#F5F1E8]'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: title + the message, styled like a notebook page */}
          <div className="text-[#F5F1E8]">
            <h3 className="text-2xl md:text-3xl font-light mb-2">{entry.title}</h3>
            {entry.description && (
              <p className="text-sm text-[#D4CFC4] leading-relaxed mb-6">
                {entry.description}
              </p>
            )}

            {entry.memo ? (
              <div className="bg-[#F5F1E8] text-[#2F2F2F] rounded-sm p-6 shadow-lg relative">
                <span className="block text-[11px] uppercase tracking-widest text-[#9D9D9D] mb-3">
                  {memoLabel}
                </span>
                <p
                  className="text-base leading-loose italic whitespace-pre-line"
                  style={{ fontFamily: 'var(--font-shippori), serif' }}
                >
                  {entry.memo}
                </p>
              </div>
            ) : (
              <p className="text-sm text-[#9D9D9D] italic">{emptyMemoText}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
