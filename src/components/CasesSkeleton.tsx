export default function CasesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div 
          key={i} 
          className="h-[480px] border border-[#2a2a2a] flex flex-col relative overflow-hidden animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          {/* Cover Placeholder */}
          <div className="relative h-56 w-full bg-[#111111] border-b border-[#2a2a2a]"></div>
          
          {/* Motive Badge Placeholder */}
          <div className="absolute top-[200px] left-0 z-10 w-24 h-7 bg-[#222222]"></div>

          {/* Body Placeholder */}
          <div className="p-6 flex flex-col flex-grow pt-8">
            {/* Killer Name */}
            <div className="w-1/3 h-3 bg-[#222222] mb-4"></div>
            {/* Title */}
            <div className="w-3/4 h-6 bg-[#222222] mb-4"></div>
            {/* Summary lines */}
            <div className="w-full h-3 bg-[#111111] mb-2"></div>
            <div className="w-5/6 h-3 bg-[#111111] mb-8 flex-grow"></div>
            
            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-[#2a2a2a]/50 flex justify-between items-center">
              <div className="w-12 h-3 bg-[#111111]"></div>
              <div className="w-20 h-3 bg-[#222222]"></div>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes pulse {
              0%, 100% { background-color: #1a1a1a; }
              50% { background-color: #222222; }
            }
          `}} />
        </div>
      ))}
    </div>
  );
}
