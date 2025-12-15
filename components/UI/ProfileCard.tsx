import Link from 'next/link';

interface ProfileCardProps {
  image: string;
  title: string;
  subtitle: string;
  name: string;
  description: string;
  link?: string;
}

export default function ProfileCard({ image, title, subtitle, name, description, link = "#" }: ProfileCardProps) {
  return (
    <Link href={link} className="group block">
      <div className="overflow-hidden rounded-sm shadow-lg hover:shadow-2xl transition-all duration-500 bg-white">
        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden bg-gray-200">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>

        {/* Content */}
        <div className="p-8">
          <h3 className="text-xl font-medium text-[#3D3D3D] mb-2 group-hover:text-[#5D5D5D] transition-colors">
            {title}
          </h3>
          <p className="text-base text-[#7D7D7D] mb-4">
            {subtitle}
          </p>
          <p className="text-sm text-[#5D5D5D] leading-relaxed mb-4">
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

