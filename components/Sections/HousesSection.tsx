import Link from 'next/link';
import HouseCard from '../UI/HouseCard';

export default function HousesSection() {
  const houses = [
    {
      image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600",
      status: "募集中",
      title: "ご近所さんが多い家",
      description: "移住者の多い地域で始める新しい暮らし"
    },
    {
      image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600",
      status: "募集中",
      title: "田んぼが見える家",
      description: "縁側の窓を開ければ、目の前に大きな田んぼが広がる"
    }
  ];

  return (
    <section id="house" className="bg-[#F5F1E8] py-24">
      <div className="max-w-7xl mx-auto px-8">
        {/* Section Title */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-[#3D3D3D] mb-4">
            空き家のつづき <span className="text-2xl ml-4 text-[#7D7D7D]">空き家の つづき</span>
          </h2>
        </div>

        {/* House Cards Grid */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {houses.map((house, index) => (
            <HouseCard key={index} {...house} />
          ))}
        </div>

        {/* Featured Person */}
        <div className="bg-white rounded-sm shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600"
                alt="石田 理絵さん"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-12">
              <h3 className="text-2xl font-medium text-[#3D3D3D] mb-2">
                石田 理絵さん / いしころ works
              </h3>
              <p className="text-[#5D5D5D] leading-relaxed mb-6">
                養老渓谷の空き家を活用して、おつかいをたのまれる宿BoBuchiを準備中。ゲストにおつかいをたのんでしまうちょっと変わった宿です。準備工程はインスタグラムにて。
              </p>
            </div>
          </div>
        </div>

        {/* More Link */}
        <div className="text-center mt-12">
          <Link 
            href="#house"
            className="inline-block text-[#5D5D5D] text-sm hover:text-[#3D3D3D] transition-colors border-b border-[#5D5D5D] pb-1"
          >
            もっと見る
          </Link>
        </div>
      </div>
    </section>
  );
}

