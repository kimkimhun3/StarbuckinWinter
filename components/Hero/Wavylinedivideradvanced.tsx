'use client';

import { useEffect, useState } from 'react';

type WavyLineStyle = 'smooth' | 'gentle' | 'dynamic' | 'subtle';

type WavyLineDividerAdvancedProps = {
  style?: WavyLineStyle;
  color?: string;
  strokeWidth?: number;
  height?: number;
  speed?: number;
  opacity?: number;
  className?: string;
  reverse?: boolean;
};

export default function WavyLineDividerAdvanced({
  style = 'smooth',
  color = '#3D3D3D',
  strokeWidth = 2,
  height = 100,
  speed = 3,
  opacity = 1,
  className = '',
  reverse = false,
}: WavyLineDividerAdvancedProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Style presets - using exact wavelength for perfect repetition
  const stylePresets = {
    smooth: {
      amplitude: 0.3,
      wavelength: 400,  // One complete wave cycle
      numWaves: 5,      // Number of waves to render
    },
    gentle: {
      amplitude: 0.1,
      wavelength: 500,
      numWaves: 8,
    },
    dynamic: {
      amplitude: 0.4,
      wavelength: 300,
      numWaves: 4,
    },
    subtle: {
      amplitude: 0.15,
      wavelength: 600,
      numWaves: 5,
    },
  };

  const preset = stylePresets[style];
  const amplitude = height * preset.amplitude;
  const centerY = height / 2;
  const wavelength = preset.wavelength;
  
  // Generate path that covers multiple wavelengths for seamless loop
  const generateContinuousWavePath = () => {
    let path = '';
    const totalWidth = wavelength * preset.numWaves;
    const pointsPerWave = 40; // Smooth curve points per wavelength
    const step = wavelength / pointsPerWave;
    
    // Start from -wavelength to ensure smooth entry
    const startX = -wavelength;
    const endX = totalWidth;
    
    let isFirst = true;
    for (let x = startX; x <= endX; x += step) {
      // Calculate y using sine wave: y = centerY + amplitude * sin(x / wavelength * 2π)
      const angle = (x / wavelength) * Math.PI * 2;
      const y = centerY + Math.sin(angle) * amplitude;
      
      if (isFirst) {
        path = `M ${x} ${y}`;
        isFirst = false;
      } else {
        path += ` L ${x} ${y}`;
      }
    }
    
    return path;
  };

  const wavePath = generateContinuousWavePath();
  const direction = reverse ? 1 : -1;

  return (
    <div className={`w-full overflow-hidden ${className}`} style={{ height: `${height}px` }}>
      <svg 
        viewBox={`0 0 2400 ${height}`}
        className="w-full h-full"
        fill="none"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isClient && (
          <g>
            <path
              d={wavePath}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={opacity}
            >
              {/* Continuous translation - moves exactly one wavelength then repeats */}
              <animateTransform
                attributeName="transform"
                type="translate"
                from={`0 0`}
                to={`${wavelength * direction} 0`}
                dur={`${speed}s`}
                repeatCount="indefinite"
              />
            </path>
          </g>
        )}
      </svg>
    </div>
  );
}