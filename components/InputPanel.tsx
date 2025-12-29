import React, { useState } from 'react';
import { CardData, YoutubeMetadata } from '../types';
import { BACKGROUNDS } from '../constants';
import { 
  Wand2, Download, Loader2, Youtube, Copy, Check, 
  LayoutTemplate, Film, Music, Upload, X, Info, Settings
} from 'lucide-react';
import { generateYoutubeMetadata } from '../services/geminiService';
import { ApiKeyModal } from './ApiKeyModal';

interface InputPanelProps {
  topic: string;
  setTopic: (s: string) => void;
  loading: boolean;
  onGenerate: () => void;
  onRecommend: () => void;
  cardData: CardData;
  setCardData: React.Dispatch<React.SetStateAction<CardData>>;
  selectedBgId: string;
  setSelectedBgId: (id: string) => void;
  onDownload: () => void;
  getImageBlob: () => Promise<Blob | null>;
}

type TabType = 'create' | 'export';

export const InputPanel: React.FC<InputPanelProps> = ({
  topic,
  setTopic,
  loading,
  onGenerate,
  onRecommend,
  cardData,
  setCardData,
  selectedBgId,
  setSelectedBgId,
  onDownload,
  getImageBlob
}) => {
  // Tabs State
  const [activeTab, setActiveTab] = useState<TabType>('create');

  // Existing Logic States
  const [ytLoading, setYtLoading] = useState(false);
  const [ytMetadata, setYtMetadata] = useState<YoutubeMetadata | null>(null);
  const [copied, setCopied] = useState(false);

  // Export & Rendering States
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [showCompletePopup, setShowCompletePopup] = useState(false);
  
  // API Key Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Handlers for Existing Logic ---
  const handleItemChange = (index: number, field: 'problem' | 'solution', value: string) => {
    const newItems = [...cardData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setCardData({ ...cardData, items: newItems });
  };

  const handleGenerateYoutube = async () => {
    setYtLoading(true);
    setYtMetadata(null);
    const result = await generateYoutubeMetadata(cardData);
    if (result) {
      setYtMetadata(result);
    } else {
      // Alert handled in service
    }
    setYtLoading(false);
  };

  const handleCopy = () => {
    if (!ytMetadata) return;
    const text = `${ytMetadata.title}\n\n${ytMetadata.description}\n\n${ytMetadata.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Handlers for Export Logic ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const startRendering = async () => {
    if (!audioFile) {
      alert("음악 파일을 먼저 추가해주세요.");
      return;
    }

    setIsRendering(true);
    setRenderProgress(0);

    try {
      // 1. Prepare Resources (Image & Audio)
      const imageBlob = await getImageBlob();
      if (!imageBlob) throw new Error("카드뉴스 이미지 생성에 실패했습니다.");

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const duration = audioBuffer.duration;

      if (!duration || duration === 0) throw new Error("오디오 파일의 길이를 확인할 수 없습니다.");

      // 2. Prepare Canvas
      const img = new Image();
      const imgLoadPromise = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      img.src = URL.createObjectURL(imageBlob);
      await imgLoadPromise;

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas context failed");
      
      // 3. Setup Recording Streams
      const streamDest = audioCtx.createMediaStreamDestination();
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(streamDest);

      // Create stream (30fps)
      const canvasStream = canvas.captureStream(30);
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...streamDest.stream.getAudioTracks()
      ]);

      // 4. Detect supported mime type
      const mimeTypes = [
        'video/mp4; codecs="avc1.42E01E, mp4a.40.2"', // H.264
        'video/mp4',
        'video/webm; codecs=h264',
        'video/webm; codecs=vp9',
        'video/webm'
      ];
      
      let selectedMimeType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }
      
      if (!selectedMimeType) {
        console.warn("No preferred mime type found, letting browser decide.");
        // Fallback to empty string to let browser use default
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMimeType || undefined,
        videoBitsPerSecond: 8000000 // 8Mbps High quality
      });

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
         const blob = new Blob(chunks, { type: selectedMimeType || 'video/webm' });
         const url = URL.createObjectURL(blob);
         
         // Direct Download
         const a = document.createElement('a');
         a.href = url;
         a.download = `cardnews-video-${Date.now()}.mp4`; // Extension might mismatch actual codec if browser forces webm, but usually playable
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         URL.revokeObjectURL(url);
         
         audioCtx.close();
         setIsRendering(false);
         setRenderProgress(100);
         setShowCompletePopup(true);
      };

      // 5. Start Recording
      recorder.start();
      source.start();
      
      // Ensure AudioContext is running (fix for 0% stuck issue)
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const startTime = audioCtx.currentTime;

      const renderLoop = () => {
        if (recorder.state !== 'recording') return;

        // Draw image every frame
        ctx.drawImage(img, 0, 0, 1080, 1920);

        const elapsed = audioCtx.currentTime - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setRenderProgress(Math.floor(progress));

        if (elapsed < duration) {
            requestAnimationFrame(renderLoop);
        } else {
            recorder.stop();
        }
      };

      requestAnimationFrame(renderLoop);

    } catch (error: any) {
      console.error(error);
      alert(`렌더링 오류: ${error.message || error}`);
      setIsRendering(false);
    }
  };

  const closePopup = () => {
    setShowCompletePopup(false);
    setRenderProgress(0);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 overflow-hidden relative">
      <ApiKeyModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* 1. Tab Navigation */}
      <div className="flex border-b border-slate-200 shrink-0">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'create' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <LayoutTemplate size={18} />
          소장각 카드뉴스
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'export' 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Film size={18} />
          내보내기 & 렌더링
        </button>
      </div>

      {/* 2. Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto">
        
        {/* --- TAB 1: CREATE (Existing UI) --- */}
        <div className={`p-6 space-y-8 pb-24 ${activeTab === 'create' ? 'block' : 'hidden'}`}>
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="bg-slate-900 text-yellow-400 p-1 rounded">GEM</span>
                소장각 카드뉴스
              </h1>
              <p className="text-sm text-slate-500 mt-1">AI와 함께 만드는 고퀄리티 카드뉴스</p>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              title="API Key 설정"
            >
              <Settings size={20} />
            </button>
          </div>

          {/* 1. Topic Input */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900 block">1. 주제 입력</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="예: 자취생 꿀팁, 엑셀 단축키..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
              />
              <button 
                onClick={onRecommend}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                title="AI 자동 추천"
              >
                <Wand2 size={20} />
              </button>
            </div>
            <button 
              onClick={onGenerate}
              disabled={loading || !topic.trim()}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : '카드뉴스 생성하기'}
            </button>
          </div>

          {/* 2. Background Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900 flex items-center justify-between">
              2. 배경 선택
              <span className="text-xs text-slate-500 font-normal">({BACKGROUNDS.length}종)</span>
            </label>
            <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1 border rounded-lg">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBgId(bg.id)}
                  className={`aspect-square rounded-md shadow-sm border-2 transition-all relative overflow-hidden ${selectedBgId === bg.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-slate-300'}`}
                  style={bg.style}
                  title={bg.name}
                >
                  {selectedBgId === bg.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Editor */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <label className="text-sm font-semibold text-slate-900 block">3. 내용 편집</label>
            
            <div className="space-y-2">
              <span className="text-xs text-slate-400 uppercase font-bold">제목</span>
              <div className="flex gap-2">
                <input 
                  value={cardData.emoji}
                  onChange={(e) => setCardData({...cardData, emoji: e.target.value})}
                  className="w-[15%] min-w-[50px] p-2 text-center text-lg border border-slate-200 rounded focus:border-blue-500 outline-none"
                  placeholder="💡"
                  maxLength={2}
                />
                <textarea 
                  value={cardData.title}
                  onChange={(e) => setCardData({...cardData, title: e.target.value})}
                  className="flex-1 p-2 text-sm border border-slate-200 rounded focus:border-blue-500 outline-none resize-none h-20"
                  placeholder="제목을 입력하세요"
                />
              </div>

              {/* Formatting Guide */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-500 flex flex-col gap-1">
                <div className="flex items-center gap-1 font-semibold text-slate-700">
                  <Info size={12} />
                  <span>텍스트 강조 문법</span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <span><span className="text-orange-500 font-bold">*키워드*</span> (주황)</span>
                  <span><span className="text-yellow-600 font-bold">{'{숫자}'}</span> (노랑)</span>
                  <span><span className="text-green-600 font-bold">[단위]</span> (초록)</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
               <span className="text-xs text-slate-400 uppercase font-bold">리스트 ({cardData.items.length})</span>
               {cardData.items.map((item, idx) => (
                 <div key={idx} className="flex gap-2 text-sm">
                   <input 
                     value={item.problem}
                     onChange={(e) => handleItemChange(idx, 'problem', e.target.value)}
                     className="w-1/3 p-2 border border-slate-200 rounded bg-slate-50 text-slate-600 focus:border-blue-500 outline-none"
                     placeholder="문제"
                   />
                   <input 
                     value={item.solution}
                     onChange={(e) => handleItemChange(idx, 'solution', e.target.value)}
                     className="w-2/3 p-2 border border-slate-200 rounded font-medium focus:border-blue-500 outline-none"
                     placeholder="해결책"
                   />
                 </div>
               ))}
            </div>

            <div className="space-y-2">
              <span className="text-xs text-slate-400 uppercase font-bold">하단 문구</span>
              <input 
                value={cardData.footer}
                onChange={(e) => setCardData({...cardData, footer: e.target.value})}
                className="w-full p-2 text-sm border border-slate-200 rounded focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* 4. Download Action */}
          <div className="pt-4 border-t border-slate-100">
             <button 
               onClick={onDownload}
               className="w-full py-4 bg-slate-900 text-yellow-400 font-bold text-lg rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
             >
               <Download size={24} />
               이미지 다운로드
             </button>
          </div>

          {/* 5. Youtube Metadata */}
          <div className="pt-6 border-t border-slate-100">
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
              <Youtube size={18} className="text-red-600" />
              유튜브 쇼츠 업로드용 텍스트
            </label>
            {!ytMetadata ? (
              <button
                onClick={handleGenerateYoutube}
                disabled={ytLoading}
                className="w-full py-3 bg-red-50 text-red-600 border border-red-100 font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                {ytLoading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                쇼츠 제목/설명 생성하기
              </button>
            ) : (
              <div className="space-y-3 animate-fade-in">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm space-y-3">
                  <div>
                    <div className="text-xs font-bold text-slate-500 mb-1 uppercase">Title</div>
                    <div className="font-bold text-slate-900">{ytMetadata.title}</div>
                  </div>
                  <div className="border-t border-slate-200 pt-2">
                    <div className="text-xs font-bold text-slate-500 mb-1 uppercase">Description</div>
                    <div className="text-slate-700 whitespace-pre-wrap">{ytMetadata.description}</div>
                  </div>
                  <div className="border-t border-slate-200 pt-2">
                     <div className="text-xs font-bold text-slate-500 mb-1 uppercase">Tags</div>
                     <div className="text-blue-600 text-xs leading-relaxed">
                       {ytMetadata.hashtags.map(tag => <span key={tag} className="mr-1">{tag}</span>)}
                     </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className={`flex-1 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${copied ? 'bg-green-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                  >
                    {copied ? <><Check size={16} /> 복사 완료!</> : <><Copy size={16} /> 전체 복사하기</>}
                  </button>
                   <button
                    onClick={handleGenerateYoutube}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                    title="다시 생성"
                  >
                    <Wand2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- TAB 2: EXPORT & RENDERING (New UI) --- */}
        <div className={`p-6 h-full flex flex-col ${activeTab === 'export' ? 'block' : 'hidden'}`}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="bg-indigo-600 text-white p-1 rounded"><Film size={20} /></span>
              내보내기 & 렌더링
            </h1>
            <p className="text-sm text-slate-500 mt-1">작업 중인 워크플로우를 내보냅니다.</p>
          </div>

          <div className="space-y-6 flex-1">
            
            {/* 1. Music Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Music size={16} /> 배경 음악 추가
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative group">
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {audioFile ? (
                  <div className="text-indigo-600 font-medium flex items-center gap-2">
                    <Music size={24} />
                    {audioFile.name}
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="text-slate-400 mb-2 group-hover:text-indigo-500 transition-colors" />
                    <p className="text-sm text-slate-600 font-medium">MP3, WAV 파일을 드래그하거나 클릭하세요</p>
                  </>
                )}
              </div>
            </div>

            {/* 2. Rendering Dashboard (Dark Card) */}
            {audioFile && (
              <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-2xl flex flex-col items-center justify-center text-center animate-fade-in relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10 w-full">
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-indigo-500/30">
                    <Film size={32} className="text-indigo-400" />
                  </div>

                  <h2 className="text-3xl font-bold italic tracking-tight mb-2">내보내기 (MP4)</h2>
                  <p className="text-slate-400 text-sm mb-10 max-w-xs mx-auto">
                    H.264/AAC 코덱을 사용하여 호환성이 뛰어난 MP4 영상을 제작합니다.
                  </p>

                  <div className="w-full space-y-2 mb-8">
                    <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-indigo-300">
                      <span>상태</span>
                      <span className="text-3xl font-black text-white">{renderProgress}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 ease-out"
                        style={{ width: `${renderProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-left text-xs text-slate-500 font-medium">
                      {isRendering ? '렌더링 진행 중...' : (renderProgress === 100 ? '렌더링 완료' : '렌더링 준비 완료')}
                    </div>
                  </div>

                  <button
                    onClick={startRendering}
                    disabled={isRendering}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold text-lg shadow-lg shadow-indigo-900/50 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isRendering ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                    MP4 렌더링 시작
                  </button>

                  <button 
                    onClick={() => setActiveTab('create')}
                    className="mt-4 text-slate-500 text-sm hover:text-white transition-colors"
                  >
                    소장각 카드 뉴스 제작
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Popup */}
      {showCompletePopup && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-6">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl transform scale-100 animate-bounce-in text-center relative">
            <button 
              onClick={closePopup}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
              <Check size={40} strokeWidth={3} />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-2">렌더링 완료!</h3>
            <p className="text-slate-500 mb-8">
              동영상 제작이 성공적으로 완료되었습니다.<br/>
              갤러리에서 확인해보세요.
            </p>
            
            <button 
              onClick={closePopup}
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};