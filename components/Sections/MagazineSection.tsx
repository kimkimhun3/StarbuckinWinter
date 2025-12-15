import Link from 'next/link';

export default function MagazineSection() {
  const magazines = [
    { title: "Vol.05", image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400" },
    { title: "Vol.04", image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400" },
    { title: "Vol.03", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400" },
    { title: "Vol.02", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400" },
    { title: "Vol.01", image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400" },
    { title: "Vol.00", image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400" }
  ];

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-8">
        {/* Section Title */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-[#3D3D3D] mb-4">
            月刊開宅 <span className="text-2xl ml-4 text-[#7D7D7D]">号外開宅</span>
          </h2>
          <p className="text-[#5D5D5D] text-base mt-6">
            開宅舎が発行する印刷メディアです。一部バックナンバーはSTORESで販売もしています。
          </p>
        </div>

        {/* Magazine Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {magazines.map((mag, index) => (
            <Link 
              key={index}
              href="#"
              className="group block"
            >
              <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-lg hover:shadow-2xl transition-all duration-500 bg-gray-100">
                <img
                  src={mag.image}
                  alt={mag.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <p className="text-center text-sm text-[#5D5D5D] mt-3 group-hover:text-[#3D3D3D] transition-colors">
                {mag.title}
              </p>
            </Link>
          ))}
          
          {/* Dummy placeholders */}
          <div className="aspect-[3/4] rounded-sm bg-[#F5F1E8] flex items-center justify-center">
            <p className="text-[#9D9D9D] text-sm">Coming Soon</p>
          </div>
          <div className="aspect-[3/4] rounded-sm bg-[#F5F1E8] flex items-center justify-center">
            <p className="text-[#9D9D9D] text-sm">Coming Soon</p>
          </div>
        </div>

        {/* Shop Link */}
        <div className="text-center">
          <Link 
            href="#shop"
            className="inline-block text-[#5D5D5D] text-sm hover:text-[#3D3D3D] transition-colors border-b border-[#5D5D5D] pb-1"
          >
            開宅舎商店へ
          </Link>
        </div>
      </div>
    </section>
  );
}

