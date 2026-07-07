'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MagazineSection() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  const magazines = [
    { title: "Vol.06", image: "https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg" },
    { title: "Vol.05", image: "https://res.cloudinary.com/duvusa8ck/image/upload/v1783438262/IMG_7236_hh2zxf.jpg" },
    { title: "Vol.04", image: "https://res.cloudinary.com/duvusa8ck/image/upload/v1783438771/techojpg_qvso1x.jpg" },
    { title: "Vol.03", image: "https://res.cloudinary.com/duvusa8ck/image/upload/v1783438276/IMG_7644_mkyuty.jpg" },
    { title: "Vol.02", image: "https://res.cloudinary.com/duvusa8ck/image/upload/v1783439055/IMG_4648_fg9ibe.jpg" },
    { title: "Vol.01", image: "https://res.cloudinary.com/duvusa8ck/image/upload/v1783438242/IMG_8579_a3oqov.jpg" },
    { title: "Vol.00", image: "https://res.cloudinary.com/duvusa8ck/image/upload/v1783439238/okayamacastle_d5tlnz.jpg" },
    { title: "Vol.000", image: "https://res.cloudinary.com/duvusa8ck/image/upload/v1783439356/IMG_6933_vjo9li.jpg" }
  ];

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + magazines.length) % magazines.length);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % magazines.length);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  return (
    <section className="bg-white py-16 sm:py-20 md:py-24 px-6" id='kamo'>
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
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

        {/* Magazine Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-10 md:mb-12">
          {magazines.map((mag, index) => (
            <div
              key={index}
              onClick={() => openLightbox(index)}
              className="relative aspect-[3/4] overflow-hidden rounded-sm shadow-sm cursor-pointer transition-all duration-500 hover:shadow-lg group"
            >
              <img
                src={mag.image}
                alt={mag.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2B2B28]/80 to-transparent p-4">
                <p className="text-white text-sm tracking-widest">{mag.title}</p>
              </div>
            </div>
          ))}

          {/* Dummy placeholders */}
          <div className="relative aspect-[3/4] bg-[#F0ECE1] rounded-sm border border-[#D4CFC4] flex items-center justify-center">
            <p className="text-[#9D9D9D] text-sm tracking-wide">Coming Soon</p>
          </div>
          {/* <div className="relative aspect-[3/4] bg-[#F0ECE1] rounded-sm border border-[#D4CFC4] flex items-center justify-center">
            <p className="text-[#9D9D9D] text-sm tracking-wide">Coming Soon</p>
          </div> */}
        </div>

        {/* Shop Link */}
        <div className="text-center">
          <Link
            href="/all"
            className="inline-block border border-[#3D3D3D] text-[#3D3D3D] px-8 py-3 hover:bg-[#3D3D3D] hover:text-white transition-colors text-sm tracking-wide"
          >
            みちのかけらをもっと見る
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-[#2B2B28]/95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white text-4xl hover:text-[#D4CFC4] transition-colors z-10"
            aria-label="Close"
          >
            ×
          </button>

          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-6 text-white text-5xl hover:text-[#D4CFC4] transition-colors z-10"
            aria-label="Previous"
          >
            ‹
          </button>

          {/* Image Container */}
          <div
            className="relative max-w-5xl max-h-[85vh] mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={magazines[selectedIndex].image}
              alt={magazines[selectedIndex].title}
              className="max-w-full max-h-[85vh] object-contain rounded-sm"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#2B2B28]/80 px-6 py-2 rounded-full">
              <p className="text-white text-sm tracking-widest">
                {magazines[selectedIndex].title} ({selectedIndex + 1}/{magazines.length})
              </p>
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-6 text-white text-5xl hover:text-[#D4CFC4] transition-colors z-10"
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}