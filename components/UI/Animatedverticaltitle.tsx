type AnimatedVerticalTitleProps = {
  words: string[];
  initialDelay?: number;
  className?: string;
  barHeights?: number[];
};

export default function AnimatedVerticalTitle({ 
  words, 
  initialDelay = 2.6,
  className = "",
  barHeights
}: AnimatedVerticalTitleProps) {
  
  // Calculate delays for each character
  const getCharacterDelays = () => {
    let currentDelay = initialDelay + 0.2; // Start slightly after container fade
    const delays: number[][] = [];
    
    // Process words from right to left (reverse order)
    for (let i = words.length - 1; i >= 0; i--) {
      const word = words[i];
      const wordDelays: number[] = [];
      
      for (let j = 0; j < word.length; j++) {
        wordDelays.push(currentDelay);
        currentDelay += 0.2; // 0.2s between each character
      }
      
      delays.unshift(wordDelays); // Add to beginning since we're going backwards
    }
    
    return delays;
  };

  const characterDelays = getCharacterDelays();
  
  // Calculate bar delays (after characters)
  const getBarDelays = () => {
    const delays: number[] = [];
    const lastCharDelay = characterDelays[characterDelays.length - 1][characterDelays[characterDelays.length - 1].length - 1];
    
    for (let i = 0; i < words.length; i++) {
      delays.push(lastCharDelay + 0.5 + (i * 0.2));
    }
    
    return delays;
  };

  const barDelays = getBarDelays();

  // Responsive bar heights if not provided - now returns responsive classes
  const getResponsiveBarHeight = (index: number) => {
    if (barHeights && barHeights[index]) {
      // Use custom heights with responsive scaling
      const baseHeight = barHeights[index];
      return {
        mobile: baseHeight * 0.6,    // 60% on mobile
        sm: baseHeight * 0.7,         // 70% on small
        md: baseHeight * 0.85,        // 85% on medium
        lg: baseHeight,               // 100% on large
      };
    }
    
    // Default: calculate based on word length
    const word = words[index];
    const baseHeight = 50 + word.length * 70;
    return {
      mobile: baseHeight * 0.6,
      sm: baseHeight * 0.7,
      md: baseHeight * 0.85,
      lg: baseHeight,
    };
  };

  return (
    <>
      <div 
        className={`animate-fadeIn ${className}`}
        style={{ 
          animationDelay: `${initialDelay}s`, 
          opacity: 0, 
          animationFillMode: 'forwards' 
        }}
      >
        {/* Container - reads right to left */}
        <div className="flex items-end gap-1 sm:gap-1.5 md:gap-2 lg:gap-2.5">
          
          {words.map((word, wordIndex) => {
            const heights = getResponsiveBarHeight(wordIndex);
            
            return (
              <div key={wordIndex} className="flex items-end gap-1 sm:gap-1.5 md:gap-2 lg:gap-2.5">
                {/* Word */}
                <h1 
                  className="text-[32px] xs:text-[36px] sm:text-[42px] md:text-[52px] lg:text-[60px] font-light text-[#3D3D3D] leading-none"
                  style={{ 
                    writingMode: 'vertical-rl',
                    letterSpacing: '0.15em',
                    lineHeight: '1.1'
                  }}
                >
                  {word.split('').map((char, charIndex) => (
                    <span 
                      key={charIndex}
                      className="inline-block animate-charAppear" 
                      style={{ 
                        animationDelay: `${characterDelays[wordIndex][charIndex]}s`, 
                        opacity: 0, 
                        animationFillMode: 'forwards' 
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </h1>
                
                {/* Vertical bar after each word - with responsive heights */}
                <div 
                  className="w-[1.5px] sm:w-[1.75px] md:w-[2px] lg:w-[2px] bg-[#3D3D3D] animate-lineGrow self-end origin-bottom responsive-bar" 
                  style={{ 
                    animationDelay: `${barDelays[wordIndex]}s`,
                    opacity: 1,
                    transform: 'scaleY(0)',
                    animationFillMode: 'forwards',
                    '--height-mobile': `${heights.mobile}px`,
                    '--height-sm': `${heights.sm}px`,
                    '--height-md': `${heights.md}px`,
                    '--height-lg': `${heights.lg}px`,
                  } as React.CSSProperties}
                ></div>
              </div>
            );
          })}

        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes charAppear {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.8);
            filter: blur(4px);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-5px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes lineGrow {
          0% {
            opacity: 0;
            transform: scaleY(0);
          }
          100% {
            opacity: 1;
            transform: scaleY(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-charAppear {
          animation: charAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-lineGrow {
          animation: lineGrow 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Responsive bar heights */
        .responsive-bar {
          height: var(--height-mobile);
        }

        @media (min-width: 640px) {
          .responsive-bar {
            height: var(--height-sm);
          }
        }

        @media (min-width: 768px) {
          .responsive-bar {
            height: var(--height-md);
          }
        }

        @media (min-width: 1024px) {
          .responsive-bar {
            height: var(--height-lg);
          }
        }

        /* Small screen optimizations */
        @media (max-width: 639px) {
          .animate-charAppear {
            animation: charAppear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          
          .animate-lineGrow {
            animation: lineGrow 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        }
      `}</style>
    </>
  );
}