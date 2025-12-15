'use client';

import { useEffect, useRef, useState } from 'react';

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
};

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function Reveal({ children, delay = 0 }: RevealProps) {
  const { ref, visible } = useInView(0.25);

  return (
    <div
      ref={ref}
      className={[
        'transition-all duration-1000 ease-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
      ].join(' ')}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Wavy line decoration component
function WavyLine() {
  return (
    <svg 
      viewBox="0 0 1200 40" 
      className="w-full h-8 opacity-30"
      fill="none"
      preserveAspectRatio="none"
    >
      <path 
        d="M0 20 Q 150 5, 300 20 T 600 20 T 900 20 T 1200 20" 
        stroke="#3D3D3D" 
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

export default function RiyuuSection() {
  return (
    <section className="relative bg-white text-[#2F2F2F]">
      
      {/* Part 1: Vertical Title + Hero Image + Intro */}
      <div className="max-w-4xl mx-auto px-6 md:px-10 lg:px-12 pt-16 md:pt-20 pb-12 md:pb-16">
        {/* Vertical Japanese Title - Centered */}
        <Reveal>
          <div className="flex justify-center mb-12 md:mb-16">
            <div className="flex items-start gap-1">
              <div 
                className="text-[32px] md:text-[40px] font-light text-[#3D3D3D] tracking-wider"
                style={{ writingMode: 'vertical-rl', letterSpacing: '0.15em' }}
              >
                その後
              </div>
              <div 
                className="text-[32px] md:text-[40px] font-light text-[#3D3D3D] tracking-wider"
                style={{ writingMode: 'vertical-rl', letterSpacing: '0.15em' }}
              >
                旅の
              </div>
            </div>
          </div>
        </Reveal>

        {/* Hero Image */}
        <Reveal delay={100}>
          <div className="w-full mb-12 md:mb-16 overflow-hidden">
            <img
              src="https://www.agoda.com/wp-content/uploads/2024/05/Featured-image-Kanazawa-castle-in-Kanazawa-Japan.jpg"
              alt="Kanazawa Castle"
              className="w-full h-auto object-cover"
            />
          </div>
        </Reveal>

        {/* Intro Text */}
        <Reveal delay={150}>
          <div className="space-y-6">
            <h3 className="text-base md:text-lg font-medium">旅人さん</h3>
            <p className="text-sm md:text-[15px] leading-relaxed text-[#3F3F3F]">
              東京、鹿児島を経て、現在は夕方に家族3人で暮らす沢田さん一家。移住して2年が経ち、お子さんの美希ちゃんを育てながら製陶で働く沢田さん。今、何を感じどのような暮らしをしているのか、美希ちゃん手作りのお菓子ときほくのきつまいもをいただきながら話を聞いた。月刊開宅で紹介した移住者のその後を取材する特別編、月刊開宅"その後"、沢田さん、その後どう？
            </p>
          </div>
        </Reveal>

        {/* Wavy Line Decoration */}
        <Reveal delay={200}>
          <div className="mt-12 md:mt-16">
            <WavyLine />
          </div>
        </Reveal>
      </div>

      {/* Part 2: "その後、感じていること" Section */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-16">
        <Reveal>
          <h2 className="text-xl md:text-2xl font-light mb-10 md:mb-14">「その後、感じていること」</h2>
        </Reveal>

        {/* Two-column layout: Text left, Image right */}
        <Reveal delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16 md:mb-20">
            {/* Left: Text */}
            <div className="space-y-6 text-sm md:text-[15px] leading-relaxed text-[#3F3F3F]">
              <p className="font-medium text-[#2F2F2F]">
                開宅舎 岡本(以下Oと示す)：実際に住んでみて、住む前のイメージと何か変わりましたか？
              </p>
              <p>
                沢田分督代さん(以下Sと示す)：元々ここでの暮らしをそんなにイメージしていなかったんです。別視したところへきて行くのを楽しそうでも、運ったら運ったらやうなって思っていたので、行ったら行った、これはこうしろうものと受け入れようと思ってきました。なのでまさにギャップがないのはなかったですし、毎日楽しく暮らしています。
              </p>
            </div>

            {/* Right: Image */}
            <div className="overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200"
                alt="Family scene"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </Reveal>

        {/* Two-column layout: Image left, Text right */}
        <Reveal delay={150}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16 md:mb-20">
            {/* Left: Image */}
            <div className="overflow-hidden order-2 lg:order-1">
              <img
                src="https://japanspecialist.com/documents/d/japanspecialist/9-hokkaido-in-winter-body"
                alt="Winter scene"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right: Text */}
            <div className="space-y-6 text-sm md:text-[15px] leading-relaxed text-[#3F3F3F] order-1 lg:order-2">
              <p className="font-medium text-[#2F2F2F]">
                沢田美希さん(以下下しと示す)：私は東京も好きです！
              </p>
              <p>
                O：ふきちゃんは東京も好きなんだね。(笑)
              </p>
              <p>
                S：大学生や社会人になったら、日本に戻るずね。もうどこにでもって思っているんだけど、小さい時にこういう環境にいませてあげられたって、こっちからの新しけしがあるしたらけど、踊りもめだと思って、大きくなった時に思い出してくれたらって思ってるんです。
              </p>
            </div>
          </div>
        </Reveal>

        {/* Full-width Image */}
        <Reveal delay={200}>
          <div className="w-full max-w-3xl mx-auto overflow-hidden">
            <img
              src="https://i1.wp.com/visitmatsumoto.com/wp-content/uploads/2018/01/DSC00687_DxO.jpg?fit=1024%2C628&ssl=1"
              alt="Matsumoto view"
              className="w-full h-auto object-cover"
            />
          </div>
        </Reveal>
      </div>

      {/* Part 3: "その後の暮らし" Section */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-16">
        <Reveal>
          <h2 className="text-xl md:text-2xl font-light mb-10 md:mb-14">「その後の暮らし」</h2>
        </Reveal>

        {/* Two-column layout: Text left, Image right */}
        <Reveal delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16 md:mb-20">
            {/* Left: Q&A Text */}
            <div className="space-y-6 text-sm md:text-[15px] leading-relaxed text-[#3F3F3F]">
              <p className="font-medium text-[#2F2F2F]">
                O：以前のイタリア料理店で働かれていたということでしたが、こちらへ来て何の仕事をやられてるんですか？
              </p>
              <p>
                S：今はパバは造園の仕事をやっていて、私は製陶で働いているんです。レストランで仕事するとなると、やっぱりみんながが飯を食べる時間に働かないといけないからから。週末も働くことが多くなっちゃって、この子どもの生活の時間がずれちゃったりするから、でも、今の農業の仕事も楽しいんです。ふーちゃんは、私もやろうって言って一緒にやったりします。
              </p>
            </div>

            {/* Right: Image */}
            <div className="overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200"
                alt="Daily life"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </Reveal>

        {/* Two-column layout: Image left, More Q&A Text right */}
        <Reveal delay={150}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left: Image */}
            <div className="overflow-hidden order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200"
                alt="Kitchen scene"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right: More Q&A */}
            <div className="space-y-6 text-sm md:text-[15px] leading-relaxed text-[#3F3F3F] order-1 lg:order-2">
              <p className="font-medium text-[#2F2F2F]">
                O：お休みの日は家族でよく行く場所とかあるんですか？
              </p>
              <p>
                S：朝海によく遊びに行きますね。ここからだとすぐ近いんです。30分とかで行けたりして、パバがサーフィンが好きで、パバだと海に入って、もう海砂主戦線。(笑)
              </p>
              <p>
                海で日の出を見たり、近所の犬のをなどを連れていったりしてますね。でも、まなこは海に進れて行くときは進れてかれたって繁な顔をするから、海が嫌いなのかもしれない。(笑)
              </p>
              <p>
                あとは温泉とか、朝理におる食べに行ったり、釣りもやってたんなって思って、ふーちゃんと一緒にやったんですけど、鮒がざくい雷いて、うわおってなっちゃって、釣りは上手くいかなかったんです。この辺は網満と雨朝園にゆるゆると行ちゃうので、家族の友達と先れき雨網満に遊びにきてなりって来れらる丸まよえます。
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Part 4: "その後の関わり" Section */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-16 pb-20 md:pb-24">
        <Reveal>
          <h2 className="text-xl md:text-2xl font-light mb-10 md:mb-14">「その後の関わり」</h2>
        </Reveal>

        <Reveal delay={100}>
          <div className="space-y-8 text-sm md:text-[15px] leading-relaxed text-[#3F3F3F]">
            <p className="font-medium text-[#2F2F2F]">
              O：きっき沢田さん夫婦に来る前に野菜をあげあちゃんがが持ってきてくれていましたが、よくくらうんですか？
            </p>
            <p>
              S：くれる、くれる。そうとくいただけるんです。ふーちゃんも学校帰りにランドセル背負って、大根片手に帰ってきたり。ごばんだばズッキーニもらってたよね。野菜以外にも、網りのペスおわり雨酪っと上時に峠堂してくれたりとかね。この辺宜はは子供がいないから、みんな見守ってくれるんです。この子がい人に出歩く時もあるから、そういう的には誰深の人たちが見守っていてくれるから、ずごく安心です。
            </p>
            <p className="font-medium text-[#2F2F2F] pt-4">
              O：そうですよね。何が気配がかった時とかすぐ気づいてくれたりするから、そういった安心感はありますよね。
            </p>
            <p className="font-medium text-[#2F2F2F] pt-4">
              O：地域で集まりごとはあったりするんですか？
            </p>
            <p>
              S：開校とか寄付りがあります。そんなに参きちょしているわけでもなくて、時間あったらお祭いにつーっという感じです。でも、うちのパパがすごい親力みたいで、みんなに来れる？来れる？って聞かれるんです。もは誰私はお断りできないって。(笑)
            </p>
            <p className="font-medium text-[#2F2F2F] pt-4">
              O：造園のお仕事もされてるってなら、すごく頼りにされちゃいますよね。
            </p>
            <p>
              S：この地域の人たちは元気で、朝野菜を待ってきてくれたおばあちゃんも95歳なんです。農味も腰がやって、よく働い日なのかはストープがいてたり、耳が遠いから電音でラジオ聞いてたり。そういうおばいちゃん、おじあやちゃんたちがけてこっ元気なんです。
            </p>
            <p>
              地域の人と野菜とかね、もうう趣味を多くて、すぐく長くしてもらっています。家に満ると今日は雨のとうもと、ふきゅめのとうって話と場が多るって知ぬってる？
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}