'use client'

import { useEffect, useState } from 'react';
import Compass from './Compass';
import Navigation from './Navigation';
import VerticalTitle from './VerticalTitle';

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [leftImageSet, setLeftImageSet] = useState(0); // 0 for image 1, 1 for image 4
  const [centerImageSet, setCenterImageSet] = useState(0); // 0 for image 2, 1 for image 5
  const [rightImageSet, setRightImageSet] = useState(0); // 0 for image 3, 1 for image 6

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Left image switches every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLeftImageSet((prev) => (prev === 0 ? 1 : 0));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Center image switches every 6.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCenterImageSet((prev) => (prev === 0 ? 1 : 0));
    }, 6500);

    return () => clearInterval(interval);
  }, []);

  // Right image switches every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRightImageSet((prev) => (prev === 0 ? 1 : 0));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen bg-[#F5F1E8] overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 bg-[#F5F1E8] z-0"></div>
      
      {/* Navigation and Headline Section - Always on top, above images */}
      <div className="relative z-50">
        <Compass />
        <Navigation />
        <VerticalTitle />
      </div>
      
      {/* Image Section - Positioned below navigation/headline, starts after text area */}
      {/* Images start below the navigation and headline, anchored to text above */}
      <div className="relative z-10 pt-[240px] md:pt-[280px] lg:pt-[320px] pb-12 md:pb-16 lg:pb-20">
        <div className="relative w-full min-h-[70vh] md:min-h-[60vh] lg:min-h-[70vh]">
          {/* Left Image Position - Image 1 and Image 4 */}
          <div 
            className="absolute left-0 top-[25%] w-[38%] h-[45vh] md:h-[40vh] lg:h-[45vh] overflow-hidden shadow-2xl"
            style={{ 
              transform: `translateY(${scrollY * 0.05}px)`
            }}
          >
            {/* Image 1 - First set */}
            <img
              src="https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200"
              alt="Mt. Fuji view"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                leftImageSet === 0 ? 'opacity-100' : 'opacity-0'
              } animate-fadeInLeft`}
              style={{ 
                animationDelay: '0.8s',
                animationFillMode: 'both'
              }}
            />
            {/* Image 4 - Second set */}
            <img
              src="https://www.agoda.com/wp-content/uploads/2024/05/Featured-image-Kanazawa-castle-in-Kanazawa-Japan.jpg"
              alt="Kanazawa castle"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                leftImageSet === 1 ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>

          {/* Center Image Position - Image 2 and Image 5 */}
          <div 
            className="absolute left-[28%] top-[10%] w-[45%] h-[50vh] md:h-[45vh] lg:h-[50vh] overflow-hidden shadow-2xl"
            style={{ 
              transform: `translateY(${scrollY * 0.03}px)`
            }}
          >
            {/* Image 2 - First set */}
            <img
              src="https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200"
              alt="Mt. Fuji with cherry blossoms"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                centerImageSet === 0 ? 'opacity-100' : 'opacity-0'
              } animate-fadeInUp`}
              style={{ 
                animationDelay: '0.4s',
                animationFillMode: 'backwards'
              }}
            />
            {/* Image 5 - Second set */}
            <img
              src="https://travelwithminh.com/wp-content/uploads/2023/10/Kamikochi2023_10_29_09_17_DSCF0805.jpg"
              alt="Kamikochi"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                centerImageSet === 1 ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>

          {/* Right Image Position - Image 3 and Image 6 */}
          <div 
            className="absolute right-[-7%] top-[15%] w-[35%] h-[55vh] md:h-[50vh] lg:h-[55vh] overflow-hidden shadow-2xl"
            style={{ 
              transform: `translateY(${scrollY * 0.04}px)`
            }}
          >
            {/* Image 3 - First set */}
            <img
              src="https://i1.wp.com/visitmatsumoto.com/wp-content/uploads/2018/01/DSC00687_DxO.jpg?fit=1024%2C628&ssl=1"
              alt="Mt. Fuji landscape"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                rightImageSet === 0 ? 'opacity-100' : 'opacity-0'
              } animate-fadeInRight`}
              style={{ 
                animationDelay: '1.2s',
                animationFillMode: 'forwards'
              }}
            />
            {/* Image 6 - Second set */}
            <img
              src="https://japanspecialist.com/documents/d/japanspecialist/9-hokkaido-in-winter-body"
              alt="Hokkaido in winter"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                rightImageSet === 1 ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}