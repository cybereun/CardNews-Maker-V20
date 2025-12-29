import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { CardData, BackgroundTheme } from '../types';

interface CardPreviewProps {
  data: CardData;
  background: BackgroundTheme;
}

export const CardPreview = forwardRef<HTMLDivElement, CardPreviewProps>(({ data, background }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4); // Start with a safe default

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      
      const parent = containerRef.current;
      const { width: parentWidth, height: parentHeight } = parent.getBoundingClientRect();
      
      const CARD_WIDTH = 1080;
      const CARD_HEIGHT = 1920;
      const PADDING = 40; // Space around the card
      
      const availableWidth = Math.max(0, parentWidth - PADDING);
      const availableHeight = Math.max(0, parentHeight - PADDING);
      
      const scaleX = availableWidth / CARD_WIDTH;
      const scaleY = availableHeight / CARD_HEIGHT;
      
      // Choose the smaller scale to ensure the whole card fits
      const nextScale = Math.min(scaleX, scaleY);
      setScale(nextScale);
    };

    updateScale();
    
    // Observer for smoother resizing when panels change size
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    window.addEventListener('resize', updateScale);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  // Helper to calculate title length without formatting characters to determine font size
  const getCleanTitleLength = (title: string) => {
    return title.replace(/[\*\{\}\[\]]/g, '').length;
  };

  const getTitleFontSizeClass = (title: string) => {
    const len = getCleanTitleLength(title);
    if (len < 10) return "text-[95px]";
    if (len < 16) return "text-[85px]";
    if (len < 22) return "text-[70px]";
    if (len < 28) return "text-[60px]";
    return "text-[50px]";
  };

  // Generic text renderer that parses formatting codes
  const renderStyledText = (text: string, defaultTextColorClass?: string) => {
    // Regex to split by delimiters: *text*, {text}, [text]
    const regex = /(\*[^*]+\*|\{[^}]+\}|\[[^\]]+\])/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        // Keyword (Orange)
        return (
          <span key={index} className="text-[#FF5F1F] inline-block">
            {part.slice(1, -1)}
          </span>
        );
      } else if (part.startsWith('{') && part.endsWith('}')) {
        // Number/Ratio (Yellow/Gold)
        return (
          <span key={index} className="text-[#FFD700] inline-block">
            {part.slice(1, -1)}
          </span>
        );
      } else if (part.startsWith('[') && part.endsWith(']')) {
         // Unit/Count (Green)
         return (
          <span key={index} className="text-[#4ADE80] inline-block">
            {part.slice(1, -1)}
          </span>
        );
      } else {
        // Normal Text
        return <span key={index} className={defaultTextColorClass}>{part}</span>;
      }
    });
  };

  // Determine density based on item count
  const count = data.items.length;
  const isDense = count >= 7;
  const isVeryDense = count >= 9;

  // Dynamic Styles based on density
  // Adjusted for stacked layout (Problem \n Solution)
  
  // Header margin
  const headerMargin = isVeryDense ? "mt-8 mb-4" : isDense ? "mt-10 mb-8" : "mt-16 mb-12";
  
  // List Container spacing - use justify-evenly to spread out
  // Item font size
  const itemFontSize = isVeryDense ? "text-[38px]" : isDense ? "text-[42px]" : "text-[48px]";
  
  // Badge size
  const badgeSize = isVeryDense ? "w-10 h-10 text-xl" : isDense ? "w-12 h-12 text-2xl" : "w-14 h-14 text-3xl";
  
  // Gap between Problem and Solution
  const contentGap = isVeryDense ? "gap-0" : "gap-1";

  return (
    <div ref={containerRef} className="flex items-center justify-center bg-slate-200 h-full w-full overflow-hidden relative">
      <div 
        style={{ 
          width: 1080, 
          height: 1920,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0 // Prevent flexbox from squishing it
        }} 
        className="relative shadow-2xl transition-transform duration-200 ease-out"
      >
        <div 
          ref={ref} 
          className="w-full h-full flex flex-col bg-white border-[6px] border-[#ffffff40] box-border"
        >
          {/* Main Body Section */}
          <div 
            className="flex-1 w-full flex flex-col p-14 pb-0 relative"
            style={{
              ...background.style,
              fontFamily: "'Noto Sans KR', sans-serif"
            }}
          >
            {/* Optional Overlay pattern */}
            {background.overlayClass && <div className={`absolute inset-0 ${background.overlayClass}`} />}

            {/* Top Decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-sky-400 to-yellow-400 opacity-80"></div>

            {/* Header Section - Centered */}
            <div className={`${headerMargin} relative z-10 flex flex-col items-center text-center transition-all shrink-0`}>
              <div className="inline-block px-5 py-2 border border-yellow-500/50 rounded-full text-yellow-500 text-2xl font-medium mb-4 whitespace-nowrap bg-black/20 backdrop-blur-sm">
                오늘의 정보
              </div>
              <h1 className={`${getTitleFontSizeClass(data.title)} font-black leading-[1.15] drop-shadow-xl break-keep tracking-tight`}>
                <span className="mr-3 inline-block align-middle relative -top-1">{data.emoji}</span>
                {renderStyledText(data.title, "text-[#ffe4e6]")}
              </h1>
            </div>

            {/* List Section - Uses flex-1 and justify-evenly to fill space */}
            <div className={`flex-1 flex flex-col justify-evenly relative z-10 transition-all py-2`}>
              {data.items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 w-full">
                  {/* Badge */}
                  <span className={`flex-shrink-0 flex items-center justify-center ${badgeSize} rounded-full bg-slate-800/60 text-white/90 font-bold border border-slate-500/50 mt-[0.15em] transition-all`}>
                    {idx + 1}
                  </span>
                  
                  {/* Content (Stacked) */}
                  <div className={`flex-1 flex flex-col ${contentGap} ${itemFontSize} leading-snug drop-shadow-md transition-all`}>
                    {/* Problem Text */}
                    <div className="text-white/95 font-medium tracking-wide break-keep">
                      {renderStyledText(item.problem)}
                    </div>
                    {/* Solution Text (Moved to next line) */}
                    <div className="font-bold tracking-wide break-keep pl-1">
                       <span className="text-yellow-400 mr-2 inline-block align-middle text-[0.9em]">👉</span>
                       <span className="text-[#38BDF8] underline decoration-4 underline-offset-[6px] decoration-sky-500/30">
                        {renderStyledText(item.solution)}
                       </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Editable Call-to-Action (Footer Message) */}
            <div className="mt-8 mb-14 relative z-10 w-full flex flex-col items-center shrink-0">
              <div className="inline-flex items-center gap-5 bg-black/40 px-14 py-7 rounded-full backdrop-blur-md border border-white/10 shadow-2xl max-w-full">
                <span className="text-4xl flex-shrink-0 animate-pulse">✨</span>
                <p className="text-[42px] font-bold text-white tracking-wider drop-shadow-lg whitespace-nowrap overflow-hidden text-ellipsis px-2">
                  {renderStyledText(data.footer)}
                </p>
                <span className="text-4xl flex-shrink-0 animate-pulse delay-75">✨</span>
              </div>
            </div>
          </div>

          {/* Fixed Brand Footer (Full Width with Contrast Background) */}
          <div 
            className="w-full h-[110px] shrink-0 flex items-center justify-center relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]"
            style={background.footerStyle ?? { background: '#000000' }}
          >
            <div className="text-3xl text-white/80 drop-shadow-sm flex items-center gap-5">
              <span className="font-serif font-light tracking-[0.4em] uppercase opacity-70">A-Class</span>
              <div className="w-[1px] h-4 bg-white/20"></div>
              <span className="font-bold font-sans tracking-widest opacity-90">소장각 카드정보</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CardPreview.displayName = "CardPreview";