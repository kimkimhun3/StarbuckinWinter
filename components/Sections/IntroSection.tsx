'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function IntroSection() {
  const imageRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [scrollDir, setScrollDir] = useState<'up' | 'down'>('down');

  useEffect(() => {
    let prevScrollY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrollDir(currentY < prevScrollY ? 'up' : 'down');
      prevScrollY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const target = imageRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative bg-[#F5F1E8] py-20">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Section Heading with vertical Japanese text */}
        <div className="relative text-center mb-10">
          <h3 className="text-[#5D5D5D] text-sm uppercase tracking-widest mb-3">
            Why I Travel
          </h3>
          <h2 className="text-[#3D3D3D] text-2xl md:text-3xl font-light">
            The Reason Behind,<br />
            And How It Started
          </h2>
          
          {/* Vertical Japanese text on the right */}
          <div className="absolute right-0 top-0 flex items-start gap-1">
            <div 
              className="text-[28px] font-light text-[#3D3D3D] opacity-20"
              style={{ writingMode: 'vertical-rl', letterSpacing: '0.1em' }}
            >
              たびを
            </div>
            <div 
              className="text-[28px] font-light text-[#3D3D3D] opacity-20"
              style={{ writingMode: 'vertical-rl', letterSpacing: '0.1em' }}
            >
              なぜ
            </div>
          </div>
        </div>

        {/* Animated Image */}
        <div
          ref={imageRef}
          className={[
            'w-full max-w-3xl mx-auto mb-8 overflow-hidden rounded-sm shadow-2xl',
            'transition-all duration-900 delay-300 ease-out will-change-transform',
            isInView
              ? scrollDir === 'down'
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-100 scale-90 translate-y-1'
              : 'opacity-0 scale-80 translate-y-6',
          ].join(' ')}
        >
          <div className="aspect-[16/10] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200"
              alt="Mt. Fuji - Where my journey began"
              loading="lazy"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-1400 delay-600"
            />
          </div>
        </div>

        {/* Content below image: Text (left) + Vertical titles (right) - Wider than image */}
        <div className="max-w-4xl mx-auto mb-8 flex items-start gap-8">
          {/* Left side: Main intro text + CTA Link */}
          <div className="flex-1">
            <h2 className="text-[#3D3D3D] text-lg md:text-xl leading-relaxed font-light mb-4">
              旅は私にとって、新しい世界を見る窓です。文化のつづき、出会いのつづき、物語のつづき。一つ一つの場所に光をあてて、人生のつづきをつくります。
            </h2>

            {/* CTA Link with border */}
            <div className="inline-block relative group">
              <Link
                href="/riyuu"
                className="text-[#3D3D3D] text-sm hover:text-[#5D5D5D] transition-colors pb-1 inline-flex items-center gap-2 relative"
              >
                <span>&gt;</span>
                <span>詳しくはこちら</span>
              </Link>
              <span
                className="absolute left-0 -bottom-0.5 h-px bg-[#3D3D3D] w-[300%] origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100"
                style={{ transitionTimingFunction: 'cubic-bezier(0.3, 0, 0.2, 1)' }}
              />
            </div>
          </div>

          {/* Right side: Vertical titles (smaller) */}
          <div className="flex items-end gap-1">
            <div 
              className="text-[36px] font-light text-[#3D3D3D] opacity-30"
              style={{ writingMode: 'vertical-rl', letterSpacing: '0.1em' }}
            >
              つくる
            </div>
            <div 
              className="text-[36px] font-light text-[#3D3D3D] opacity-30"
              style={{ writingMode: 'vertical-rl', letterSpacing: '0.1em' }}
            >
              つづきを
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}