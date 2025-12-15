import ProfileCard from '../UI/ProfileCard';

export default function ProfilesSection() {
  const profiles = [
    {
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
      title: "沢田家の その後",
      subtitle: "沢田さん",
      name: "沢田さん",
      description: "加茂地区最南端の戸面町会にお子さんと一緒に移住した沢田さん。"
    },
    {
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600",
      title: "追い風の その後",
      subtitle: "白石さん",
      name: "白石さん",
      description: "加茂地区の空き家を改装してサイクルスポットをつくってた白石さん。"
    },
    {
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600",
      title: "古着の その後",
      subtitle: "沙友里さん",
      name: "沙友里さん",
      description: "\"服を売らない\"アパレルブランドenergy closet代表の三和さん。"
    }
  ];

  return (
    <section id="sawada" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-8">
        {/* Section Title */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-[#3D3D3D] mb-4">
            加茂地区のくらし
          </h2>
        </div>

        {/* Profile Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {profiles.map((profile, index) => (
            <ProfileCard key={index} {...profile} />
          ))}
        </div>
      </div>
    </section>
  );
}

