import React, { useState, useEffect } from 'react';
import { X, Key, Save, CheckCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { saveApiKey, getApiKey, removeApiKey } from '../utils/storage';
import { testConnection } from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const stored = getApiKey();
      if (stored) {
        setApiKey(stored);
      }
      setStatus('idle');
      setMessage('');
    }
  }, [isOpen]);

  const handleTestAndSave = async () => {
    if (!apiKey.trim()) {
      setStatus('error');
      setMessage('API Key를 입력해주세요.');
      return;
    }

    setStatus('testing');
    const isConnected = await testConnection(apiKey);

    if (isConnected) {
      saveApiKey(apiKey);
      setStatus('success');
      setMessage('연결 성공! 키가 안전하게 암호화되어 저장되었습니다.');
      // Close after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setStatus('error');
      setMessage('연결 실패. API Key가 올바른지 확인해주세요.');
    }
  };

  const handleClear = () => {
    removeApiKey();
    setApiKey('');
    setStatus('idle');
    setMessage('저장된 키가 삭제되었습니다.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-bounce-in">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Key size={20} className="text-yellow-400" />
            API Key 설정
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Google Gemini API Key를 입력하세요.<br />
              입력된 키는 <strong>암호화되어 브라우저 내부에만 저장</strong>됩니다.
            </p>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AI Studio API Key 입력"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
              />
              <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Status Message */}
          {status !== 'idle' && (
            <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
              status === 'testing' ? 'bg-blue-50 text-blue-700' :
              status === 'success' ? 'bg-green-50 text-green-700' :
              'bg-red-50 text-red-700'
            }`}>
              {status === 'testing' && <Loader2 size={18} className="animate-spin mt-0.5" />}
              {status === 'success' && <ShieldCheck size={18} className="mt-0.5" />}
              {status === 'error' && <AlertCircle size={18} className="mt-0.5" />}
              <span>{message || (status === 'testing' ? '연결 테스트 중...' : '')}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
             <button
              onClick={handleClear}
              className="px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-lg font-medium text-sm transition-colors"
            >
              키 삭제
            </button>
            <button
              onClick={handleTestAndSave}
              disabled={status === 'testing'}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'testing' ? (
                '테스트 중...'
              ) : (
                <>
                  <Save size={18} />
                  저장 및 연결 테스트
                </>
              )}
            </button>
          </div>
          
          <div className="text-center">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-blue-500 hover:underline inline-flex items-center gap-1"
            >
              API Key 발급받기 (Google AI Studio)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};