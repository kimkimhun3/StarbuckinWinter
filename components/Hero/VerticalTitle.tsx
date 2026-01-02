export default function VerticalTitle() {
  return (
    <>
      <div className="absolute top-6 right-4 md:right-6 lg:right-8 xl:right-24 2xl:right-32 z-30 pr-0 md:pr-0 lg:pr-6 xl:pr-16 2xl:pr-20 animate-fadeIn" style={{ animationDelay: '2.6s', opacity: 0, animationFillMode: 'forwards' }}>
        {/* Container - reads right to left */}
        <div className="flex items-end gap-0.5 md:gap-1 lg:gap-1.5 xl:gap-2">
          
          {/* First: つくる (will be on the left) */}
          <h1 
            className="text-[60px] font-light text-[#3D3D3D] leading-none"
            style={{ 
              writingMode: 'vertical-rl',
              letterSpacing: '0.15em',
              lineHeight: '1.1'
            }}
          >
            <span className="inline-block animate-charAppear" style={{ animationDelay: '3.6s', opacity: 0, animationFillMode: 'forwards' }}>み</span>
            <span className="inline-block animate-charAppear" style={{ animationDelay: '3.8s', opacity: 0, animationFillMode: 'forwards' }}>ち</span>
            <span className="inline-block animate-charAppear" style={{ animationDelay: '4.0s', opacity: 0, animationFillMode: 'forwards' }}>へ</span>
          </h1>
          
          {/* First vertical bar - grows from bottom */}
          <div 
            className="w-[2px] bg-[#3D3D3D] animate-lineGrow self-end origin-bottom" 
            style={{ 
              animationDelay: '4.5s',
              height: '210px',
              opacity: 0,
              transform: 'scaleY(0)',
              animationFillMode: 'forwards'
            }}
          ></div>

          {/* Second: つづきを (will be on the right) */}
          <h1 
            className="text-[60px] font-light text-[#3D3D3D] leading-none"
            style={{ 
              writingMode: 'vertical-rl',
              letterSpacing: '0.15em',
              lineHeight: '1.1'
            }}
          >
            <span className="inline-block animate-charAppear" style={{ animationDelay: '2.8s', opacity: 0, animationFillMode: 'forwards' }}>し</span>
            <span className="inline-block animate-charAppear" style={{ animationDelay: '3.0s', opacity: 0, animationFillMode: 'forwards' }}>ら</span>
            <span className="inline-block animate-charAppear" style={{ animationDelay: '3.2s', opacity: 0, animationFillMode: 'forwards' }}>な</span>
            <span className="inline-block animate-charAppear" style={{ animationDelay: '3.4s', opacity: 0, animationFillMode: 'forwards' }}>い</span>
          </h1>

          {/* Second vertical bar - grows from bottom */}
          <div 
            className="w-[2px] bg-[#3D3D3D] animate-lineGrow self-end origin-bottom" 
            style={{ 
              animationDelay: '4.0s',
              height: '290px',
              opacity: 0,
              transform: 'scaleY(0)',
              animationFillMode: 'forwards'
            }}
          ></div>

        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes charAppear {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.8);
            filter: blur(4px);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-5px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes lineGrow {
          0% {
            opacity: 0;
            transform: scaleY(0);
          }
          100% {
            opacity: 1;
            transform: scaleY(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-charAppear {
          animation: charAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-lineGrow {
          animation: lineGrow 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
}