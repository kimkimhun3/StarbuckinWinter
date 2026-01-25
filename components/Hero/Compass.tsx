export default function Compass() {
  return (
    <div 
      className="absolute top-0 left-0 z-50 p-4 md:p-6 lg:p-8 animate-fadeIn" 
      style={{ animationDelay: '2.2s', opacity: 0 }}
    >
      {/* Vertical logo - brand name */}
      <div 
        className="text-sm md:text-base lg:text-base font-medium text-[#3D3D3D] tracking-[0.3em]"
        style={{ writingMode: 'vertical-rl' }}
      >
        ここではないどこか
      </div>
    </div>
  );
}