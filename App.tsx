import React, { useState, useRef, useCallback } from 'react';
import { toPng, toBlob } from 'html-to-image';
import { InputPanel } from './components/InputPanel';
import { CardPreview } from './components/CardPreview';
import { CardData } from './types';
import { DEFAULT_CARD_DATA, BACKGROUNDS } from './constants';
import { generateCardContent, recommendTopic } from './services/geminiService';

export default function App() {
  const [topic, setTopic] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [cardData, setCardData] = useState<CardData>(DEFAULT_CARD_DATA);
  const [selectedBgId, setSelectedBgId] = useState<string>(BACKGROUNDS[0].id);
  
  const cardRef = useRef<HTMLDivElement>(null);

  const selectedBackground = BACKGROUNDS.find(b => b.id === selectedBgId) || BACKGROUNDS[0];

  const handleRecommend = async () => {
    setLoading(true);
    const recommended = await recommendTopic();
    setTopic(recommended);
    // Auto generate after recommendation? Or just fill input. 
    // Let's just fill input to let user decide.
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    const result = await generateCardContent(topic);
    if (result) {
      setCardData(result);
    } else {
      alert("생성에 실패했습니다. 다시 시도해주세요.");
    }
    setLoading(false);
  };

  const handleDownload = useCallback(async () => {
    if (cardRef.current === null) {
      return;
    }

    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 1 });
      const link = document.createElement('a');
      link.download = `cardnews-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert("이미지 저장 중 오류가 발생했습니다.");
    }
  }, [cardRef]);

  const handleGetImageBlob = useCallback(async () => {
    if (cardRef.current === null) return null;
    try {
      // Create a blob from the card element with explicit dimensions to ignore preview scaling
      return await toBlob(cardRef.current, { 
        cacheBust: true, 
        pixelRatio: 1,
        width: 1080,
        height: 1920,
        style: {
          transform: 'none', // Reset any scaling transforms
          transformOrigin: 'top left'
        }
      });
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [cardRef]);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 overflow-hidden">
      {/* Left Panel: Inputs & Settings (Scrollable) */}
      <div className="w-full lg:w-[450px] flex-shrink-0 h-[40vh] lg:h-full z-20 shadow-xl">
        <InputPanel 
          topic={topic}
          setTopic={setTopic}
          loading={loading}
          onGenerate={handleGenerate}
          onRecommend={handleRecommend}
          cardData={cardData}
          setCardData={setCardData}
          selectedBgId={selectedBgId}
          setSelectedBgId={setSelectedBgId}
          onDownload={handleDownload}
          getImageBlob={handleGetImageBlob}
        />
      </div>

      {/* Right Panel: Preview Area */}
      <div className="flex-1 h-[60vh] lg:h-full bg-slate-200 relative overflow-hidden">
        <CardPreview 
          ref={cardRef}
          data={cardData}
          background={selectedBackground}
        />
      </div>
    </div>
  );
}