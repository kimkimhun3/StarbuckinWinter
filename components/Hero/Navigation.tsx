import Link from 'next/link';

export default function Navigation() {
  return (
    <nav 
      className="absolute top-20 md:top-24 lg:top-24 left-16 md:left-20 lg:left-24 xl:left-40 2xl:left-52 z-50 pl-0 md:pl-0 lg:pl-6 xl:pl-12 2xl:pl-16 pr-4 md:pr-6 lg:pr-8 animate-fadeIn" 
      style={{ animationDelay: '2.4s', opacity: 0 }}
    >
      {/* Main navigation links */}
      <div className="space-y-4 md:space-y-5 text-[17px] md:text-[18px] lg:text-[19px] font-bold text-[#5D5D5D]">
        <Link href="#about" className="block hover:text-[#3D3D3D] transition-colors duration-300">
          ＞ つづきをつくる
        </Link>
        <Link href="#sawada" className="block hover:text-[#3D3D3D] transition-colors duration-300">
          ＞ 暮らしのつづき
        </Link>
        <Link href="#kamo" className="block hover:text-[#3D3D3D] transition-colors duration-300">
          ＞ 風景のつづき
        </Link>
        <Link href="#house" className="block hover:text-[#3D3D3D] transition-colors duration-300">
          ＞ 空き家のつづき
        </Link>
      </div>
      
      {/* Footer-style links */}
      <div className="mt-6 md:mt-8 space-y-2 md:space-y-3 text-[11px] md:text-[12px] lg:text-[13px] text-[#9D9D9D]">
        <Link href="#contact" className="block hover:text-[#5D5D5D] transition-colors">
          お問い合わせ
        </Link>
        <Link href="#school" className="block hover:text-[#5D5D5D] transition-colors">
          ノックの学校
        </Link>
      </div>
    </nav>
  );
}