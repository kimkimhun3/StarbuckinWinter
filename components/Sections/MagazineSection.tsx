'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MagazineSection() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  const magazines = [
    { title: "Vol.06", image: "https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg" },
    { title: "Vol.05", image: "https://images.pexels.com/photos/35111813/pexels-photo-35111813.jpeg" },
    { title: "Vol.04", image: "https://images.pexels.com/photos/34488286/pexels-photo-34488286.jpeg" },
    { title: "Vol.03", image: "https://images.pexels.com/photos/34188665/pexels-photo-34188665.jpeg" },
    { title: "Vol.02", image: "https://images.pexels.com/photos/35171495/pexels-photo-35171495.jpeg" },
    { title: "Vol.01", image: "https://images.pexels.com/photos/32488229/pexels-photo-32488229.jpeg" },
    { title: "Vol.00", image: "https://images.pexels.com/photos/35045211/pexels-photo-35045211.jpeg" }
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
    <section className="bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4">
            iPhone 16 Pro <span className="text-blue-600">が切り取った瞬間</span>
          </h2>
          <p className="text-gray-600">
            旅の途中で、iPhone 16 Pro と出会った風景
          </p>
        </div>

        {/* Magazine Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {magazines.map((mag, index) => (
            <div
              key={index}
              onClick={() => openLightbox(index)}
              className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-md cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <img
                src={mag.image}
                alt={mag.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white font-semibold text-lg">{mag.title}</p>
              </div>
            </div>
          ))}

          {/* Dummy placeholders */}
          <div className="relative aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-400 font-semibold">Coming Soon</p>
          </div>
          <div className="relative aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-400 font-semibold">Coming Soon</p>
          </div>
        </div>

        {/* Shop Link */}
        <div className="text-center">
          <Link
            href="#"
            className="inline-block bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            開宅舎商店へ
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 transition-colors z-10"
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
            className="absolute left-6 text-white text-5xl hover:text-gray-300 transition-colors z-10"
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
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 px-6 py-2 rounded-full">
              <p className="text-white font-semibold">
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
            className="absolute right-6 text-white text-5xl hover:text-gray-300 transition-colors z-10"
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}