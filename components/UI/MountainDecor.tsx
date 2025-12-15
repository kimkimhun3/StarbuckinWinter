export default function MountainDecor({ className = "" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 40 20" 
      className={`w-8 h-4 ${className}`}
      fill="none"
    >
      <path 
        d="M0 20 L10 5 L20 20 L30 8 L40 20" 
        stroke="#D4CFC4" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

