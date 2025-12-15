import Link from 'next/link';

interface HouseCardProps {
  image: string;
  status: string;
  title: string;
  description: string;
  link?: string;
}

export default function HouseCard({ image, status, title, description, link = "#" }: HouseCardProps) {
  return (
    <Link href={link} className="group block">
      <div className="relative overflow-hidden rounded-sm shadow-lg hover:shadow-2xl transition-all duration-500">
        {/* Image */}
        <div className="aspect-[5/4] overflow-hidden bg-gray-200">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
        
        {/* Status badge */}
        <div className="absolute top-4 left-4 bg-white px-4 py-1 text-xs text-[#3D3D3D] font-medium">
          {status}
        </div>

        {/* Content */}
        <div className="p-6 bg-white">
          <h3 className="text-xl font-medium text-[#3D3D3D] mb-3 group-hover:text-[#5D5D5D] transition-colors">
            {title}
          </h3>
          <p className="text-sm text-[#7D7D7D] leading-relaxed mb-4">
            {description}
          </p>
          <div className="text-xs text-[#9D9D9D] group-hover:text-[#5D5D5D] transition-colors flex items-center">
            詳しくはこちら
            <span className="ml-2 transform group-hover:translate-x-2 transition-transform">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

