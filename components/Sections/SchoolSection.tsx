import Link from 'next/link';

export default function SchoolSection() {
  return (
    <section id="school" className="bg-[#3D3D3D] py-32">
      <div className="max-w-5xl mx-auto px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-light text-white mb-8">
          ノックの学校
        </h2>
        <p className="text-[#D4CFC4] text-lg leading-relaxed mb-12">
          空き家問題や移住促進に取り組む各地の方へ<br />
          開宅のノウハウを伝える研修を開いています
        </p>
        <Link 
          href="#school"
          className="inline-block bg-white text-[#3D3D3D] px-8 py-3 rounded-sm hover:bg-[#F5F1E8] transition-colors duration-300"
        >
          ノックの学校について
        </Link>
      </div>
    </section>
  );
}

