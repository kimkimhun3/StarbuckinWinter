import Link from 'next/link';
import MountainDecor from '../UI/MountainDecor';

export default function LandscapeSection() {
  const images = [
    "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600",
    "https://images.unsplash.com/photo-1528164344705-47542687000d?w=600",
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600",
    "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600"
  ];

  return (
    <section id="kamo" className="bg-[#F5F1E8] py-24">
      <div className="max-w-7xl mx-auto px-8">
        {/* Mountain Decorations */}
        <div className="flex gap-4 justify-center mb-12 opacity-60">
          <MountainDecor className="w-10 h-5" />
          <MountainDecor className="w-10 h-5" />
          <MountainDecor className="w-10 h-5" />
        </div>

        {/* Vertical Text Titles */}
        <div className="flex justify-center gap-8 mb-16">
          <div 
            className="text-[50px] font-light text-[#3D3D3D]"
            style={{ writingMode: 'vertical-rl', letterSpacing: '0.15em' }}
          >
            緩やかな流れ
          </div>
          <div 
            className="text-[50px] font-light text-[#3D3D3D]"
            style={{ writingMode: 'vertical-rl', letterSpacing: '0.15em' }}
          >
            遅い列車、
          </div>
          <div 
            className="text-[50px] font-light text-[#3D3D3D]"
            style={{ writingMode: 'vertical-rl', letterSpacing: '0.15em' }}
          >
            低い山、
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {images.map((image, index) => (
            <div 
              key={index}
              className="aspect-square overflow-hidden rounded-sm shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <img
                src={image}
                alt={`Landscape ${index + 1}`}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </div>
          ))}
        </div>

        {/* Link */}
        <div className="text-center">
          <Link 
            href="#kamo"
            className="inline-block text-[#5D5D5D] text-sm hover:text-[#3D3D3D] transition-colors border-b border-[#5D5D5D] pb-1"
          >
            加茂地区のこと
          </Link>
        </div>
      </div>
    </section>
  );
}

