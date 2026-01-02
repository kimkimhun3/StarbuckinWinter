'use client';

import { useEffect, useRef, useState } from 'react';
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

// Wavy line decoration component
function WavyLine() {
  return (
    <>
      <div className="relative w-full h-8 overflow-hidden opacity-30">
        <svg 
          viewBox="0 0 2400 40" 
          className="absolute inset-0 w-full h-full"
          fill="none"
          preserveAspectRatio="none"
        >
          <path 
            className="animate-wave-shape"
            stroke="#3D3D3D" 
            strokeWidth="1.5"
            fill="none"
          >
            <animate
              attributeName="d"
              values="M0 20 Q 150 5, 300 20 T 600 20 T 900 20 T 1200 20 T 1500 20 T 1800 20 T 2100 20 T 2400 20;M0 20 Q 150 10, 300 20 T 600 20 T 900 20 T 1200 20 T 1500 20 T 1800 20 T 2100 20 T 2400 20;M0 20 Q 150 15, 300 20 T 600 20 T 900 20 T 1200 20 T 1500 20 T 1800 20 T 2100 20 T 2400 20;M0 20 Q 150 10, 300 20 T 600 20 T 900 20 T 1200 20 T 1500 20 T 1800 20 T 2100 20 T 2400 20;M0 20 Q 150 5, 300 20 T 600 20 T 900 20 T 1200 20 T 1500 20 T 1800 20 T 2100 20 T 2400 20"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
    </>
  );
}

export default function AboutMeSection() {
  return (
    <section className="relative bg-white text-[#2F2F2F]">
      
      {/* Part 1: Vertical Title + Hero Image + Intro */}
      <div className="max-w-4xl mx-auto px-6 md:px-10 lg:px-12 pt-16 md:pt-20 pb-12 md:pb-16">
        {/* Animated Vertical Japanese Title - Centered */}
        <div className="flex justify-center mb-12 md:mb-16">
          <AnimatedVerticalTitle 
            words={[ 'ついて', 'わたしに']} 
            initialDelay={0.5}
            barHeights={[160, 250]}
          />
        </div>

        {/* Hero Image */}
        <Reveal delay={100}>
          <div className="w-full mb-12 md:mb-16 overflow-hidden rounded-md">
            <img
              src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200"
              alt="Tokyo cityscape"
              className="w-full h-auto object-cover"
            />
          </div>
        </Reveal>

        {/* Intro Text */}
        <Reveal delay={150}>
          <div className="space-y-6">
            <h3 className="text-base md:text-lg font-medium">Kimhoon</h3>
            <p className="text-sm md:text-[15px] leading-relaxed text-[#3F3F3F]">
              I'm Kimhoon, a software developer currently working in Japan. I graduated with a bachelor's degree in Computer Science, which laid the groundwork for my journey into the tech world. After finishing my degree, I moved to Japan to work and explore opportunities in one of the most fascinating tech landscapes.
            </p>
            <p className="text-sm md:text-[15px] leading-relaxed text-[#3F3F3F]">
              When it comes to languages, I can speak English professionally and have conversational skills in Japanese. I'm also actively learning Japanese to further immerse myself in the culture and communicate more effectively in both my professional and personal life.
            </p>
          </div>
        </Reveal>

        {/* Wavy Line Decoration */}
        <Reveal delay={200}>
          <div className="mt-12 md:mt-16">
            <WavyLine />
          </div>
        </Reveal>
      </div>

      {/* Part 2: Life in Japan */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-16">
        <Reveal>
          <h2 className="text-xl md:text-2xl font-light mb-10 md:mb-14">Life in Japan</h2>
        </Reveal>

        {/* Two-column layout: Text left, Image right */}
        <Reveal delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16 md:mb-20">
            {/* Left: Text */}
            <div className="space-y-6 text-sm md:text-[15px] leading-relaxed text-[#3F3F3F]">
              <p className="font-medium text-[#2F2F2F]">
                The Journey to Japan
              </p>
              <p>
                Moving to Japan was both exciting and challenging. As a software developer, I found the tech scene here to be incredibly innovative and fast-paced. The blend of traditional culture and cutting-edge technology creates a unique environment that constantly inspires me in my work.
              </p>
              <p>
                Every day brings new opportunities to learn—whether it's mastering a new programming framework or understanding the nuances of Japanese business culture. This journey has taught me that growth happens when you step outside your comfort zone.
              </p>
            </div>

            {/* Right: Image */}
            <div className="overflow-hidden rounded-md">
              <img
                src="https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200"
                alt="Tokyo street scene"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </Reveal>

        {/* Two-column layout: Image left, Text right */}
        <Reveal delay={150}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16 md:mb-20">
            {/* Left: Image */}
            <div className="overflow-hidden rounded-md order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=1200"
                alt="Japanese workspace"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right: Text */}
            <div className="space-y-6 text-sm md:text-[15px] leading-relaxed text-[#3F3F3F] order-1 lg:order-2">
              <p className="font-medium text-[#2F2F2F]">
                Language & Culture
              </p>
              <p>
                Learning Japanese has been one of the most rewarding parts of living here. While I started with basic conversational skills, I'm constantly improving through daily interactions—from ordering at local restaurants to discussing technical concepts with colleagues.
              </p>
              <p>
                The language opens doors to deeper cultural understanding. It's not just about words; it's about the way people think, communicate, and build relationships in this beautiful country.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Full-width Image */}
        <Reveal delay={200}>
          <div className="w-full max-w-3xl mx-auto overflow-hidden rounded-md">
            <img
              src="https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1200"
              alt="Cherry blossoms in Japan"
              className="w-full h-auto object-cover"
            />
          </div>
        </Reveal>
      </div>

      {/* Part 3: Weekend Activities */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-16">
        <Reveal>
          <h2 className="text-xl md:text-2xl font-light mb-10 md:mb-14">How I Spend My Time</h2>
        </Reveal>

        {/* Two-column layout: Text left, Image right */}
        <Reveal delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16 md:mb-20">
            {/* Left: Text */}
            <div className="space-y-6 text-sm md:text-[15px] leading-relaxed text-[#3F3F3F]">
              <p className="font-medium text-[#2F2F2F]">
                Cycling & Coffee
              </p>
              <p>
                Weekends often find me on my bicycle, exploring the neighborhoods of Tokyo and beyond. There's something therapeutic about cycling through the quiet streets early in the morning, watching the city wake up.
              </p>
              <p>
                My rides usually end at Starbucks, where I enjoy a good cup of coffee and take time to reflect on the week. It's become a ritual—a moment of pause in an otherwise busy life. Sometimes I bring my laptop and work on personal projects, other times I just sit and people-watch.
              </p>
            </div>

            {/* Right: Image */}
            <div className="overflow-hidden rounded-md">
              <img
                src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1200"
                alt="Bicycle and coffee"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </Reveal>

        {/* Two-column layout: Image left, Text right */}
        <Reveal delay={150}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left: Image */}
            <div className="overflow-hidden rounded-md order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200"
                alt="Evening drinks"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right: Text */}
            <div className="space-y-6 text-sm md:text-[15px] leading-relaxed text-[#3F3F3F] order-1 lg:order-2">
              <p className="font-medium text-[#2F2F2F]">
                Moments of Reflection
              </p>
              <p>
                Some evenings, I head out for drinks—sometimes alone to unwind and reflect on life, sometimes with friends to share stories and laughter. Both have their own value.
              </p>
              <p>
                Solo outings give me space to think, to process the day, and to simply be present in the moment. When I'm with friends, whether colleagues from work or people I've met through various communities, these gatherings remind me of the importance of connection and shared experiences.
              </p>
              <p>
                Living in Japan has taught me to appreciate these small moments—the quiet contemplation over a drink, the animated conversation with friends, the simple pleasure of good company. These experiences, combined with my work and travels, shape who I am and how I see the world.
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Part 4: This Blog & Contact */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-16 pb-20 md:pb-24">
        <Reveal>
          <h2 className="text-xl md:text-2xl font-light mb-10 md:mb-14">About This Blog</h2>
        </Reveal>

        <Reveal delay={100}>
          <div className="space-y-8 text-sm md:text-[15px] leading-relaxed text-[#3F3F3F]">
            <p>
              I created "みちへしらない" (Unknown Roads) as a space to document my journey—both literal and figurative. The name reflects my philosophy: the best discoveries often happen when we venture down unfamiliar paths.
            </p>
            <p>
              Through this blog, I share my travels around Japan, thoughts on technology and software development, reflections on life as an expatriate, and the small moments that make this adventure meaningful. Whether I'm exploring a new city, trying a local dish, or simply observing daily life in Japan, there's always something worth capturing.
            </p>
            <p className="font-medium text-[#2F2F2F] pt-4">
              Connect With Me
            </p>
            <p>
              Feel free to explore my writings here to learn more about my thoughts, my work, and what keeps me inspired. If you'd like to get in touch or follow my daily adventures, you can find me on Instagram:{' '}
              <a 
                href="https://www.instagram.com/kimhoooon_/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#3D3D3D] underline hover:text-[#5D5D5D] transition-colors"
              >
                @kimhoooon__
              </a>
            </p>
            <p>
              Thanks for stopping by, and I hope you enjoy reading about my journey through unknown roads.
            </p>
          </div>
        </Reveal>
      </div>
      <WavyLine />
    </section>
  );
}