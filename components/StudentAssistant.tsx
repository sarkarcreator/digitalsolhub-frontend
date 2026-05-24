
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, WifiOff, ShieldCheck, Sparkles, BookOpen, GraduationCap } from 'lucide-react';
import { Language } from '../types';

interface StudentAssistantProps {
  lang: Language;
  studentName: string;
  courses: { name: string; progress: number }[];
  onClose?: () => void;
  isOpenExternal?: boolean; // Control from parent
  setIsOpenExternal?: (val: boolean) => void;
}

const StudentAssistant: React.FC<StudentAssistantProps> = ({ 
  lang, 
  studentName, 
  courses, 
  isOpenExternal, 
  setIsOpenExternal 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'error'>('idle');

  // Sync with parent state if provided
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
      if (!isOpenExternal) disconnectVoice();
    }
  }, [isOpenExternal]);

  const handleClose = () => {
    setIsOpen(false);
    if (setIsOpenExternal) setIsOpenExternal(false);
    disconnectVoice();
  };

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  // --- Audio Helpers ---
  const floatTo16BitPCM = (input: Float32Array) => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  };

  const base64ToUint8Array = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // --- Gemini Live Connection ---
  const connectToLiveAPI = async () => {
    setStatus('connecting');
    try {
      setStatus('error');
      throw new Error('Voice mode is disabled until backend streaming is enabled.');

    } catch (error) {
      setStatus('error');
    }
  };

  const disconnectVoice = () => {
    setIsConnected(false);
    setIsSpeaking(false);
    setStatus('idle');
    
    streamRef.current?.getTracks().forEach(track => track.stop());
    sourceRef.current?.disconnect();
    processorRef.current?.disconnect();
    inputContextRef.current?.close();
    audioContextRef.current?.close();
    
    inputContextRef.current = null;
    audioContextRef.current = null;
    sessionPromiseRef.current = null;
    nextStartTimeRef.current = 0;
  };

  useEffect(() => {
    return () => disconnectVoice();
  }, []);

  if (!isOpen) {
    // Floating Trigger Button (Only visible if not open)
    return (
      <button
        onClick={() => {
            setIsOpen(true);
            if (setIsOpenExternal) setIsOpenExternal(true);
        }}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_30px_rgba(124,58,237,0.4)] flex items-center justify-center hover:scale-110 transition-transform animate-float"
        title="AI Learning Assistant"
      >
        <Sparkles className="w-8 h-8 absolute animate-pulse opacity-50" />
        <Mic className="w-8 h-8 relative z-10" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md mx-4 bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="absolute top-0 w-full p-4 flex justify-between items-center z-20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-800 rounded-lg">
                <GraduationCap className="w-5 h-5 text-purple-400" />
            </div>
            <span className="font-bold text-white text-sm">Learning Assistant</span>
          </div>
          <button onClick={handleClose} className="p-2 bg-white/5 rounded-full hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center pt-20 pb-12 px-8 relative">
           
           {/* Glow Effect */}
           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] transition-all duration-700 ${isSpeaking ? 'scale-125 opacity-100' : 'scale-100 opacity-50'}`}></div>

           {/* Status Message */}
           <div className="text-center mb-10 relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2">
                {status === 'idle' && `Hi, ${studentName}!`}
                {status === 'connecting' && "Connecting..."}
                {status === 'listening' && "I'm Listening..."}
                {status === 'speaking' && "Speaking..."}
                {status === 'error' && "Connection Error"}
              </h3>
              <p className="text-purple-200/60 text-sm">
                {status === 'idle' ? "Ready for today's lesson?" : "Ask about lessons, progress, or help."}
              </p>
           </div>

           {/* Visualizer / Button */}
           <div className="relative z-10 mb-8">
              <button 
                onClick={status === 'idle' || status === 'error' ? connectToLiveAPI : disconnectVoice}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                  isConnected 
                    ? 'bg-red-500/20 text-red-500 border-2 border-red-500 hover:bg-red-500 hover:text-white' 
                    : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg hover:scale-105'
                }`}
              >
                {isConnected ? (
                   isSpeaking ? <Volume2 className="w-10 h-10 animate-pulse" /> : <div className="flex gap-1 h-6 items-center"><span className="w-1 h-3 bg-current animate-bounce"></span><span className="w-1 h-5 bg-current animate-bounce delay-75"></span><span className="w-1 h-3 bg-current animate-bounce delay-150"></span></div>
                ) : (
                   <Mic className="w-10 h-10" />
                )}
                
                {/* Ping Rings */}
                {isConnected && !isSpeaking && (
                   <span className="absolute inset-0 rounded-full border border-purple-400/30 animate-ping"></span>
                )}
              </button>
           </div>

           {/* Suggestions */}
           {status === 'idle' && (
             <div className="flex flex-wrap justify-center gap-2 relative z-10 max-w-[300px]">
                {["Today's Lesson", "My Progress", "Help with Assignment"].map((text, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">
                    {text}
                  </span>
                ))}
             </div>
           )}

           {status === 'error' && (
              <p className="text-red-400 text-xs mt-4 flex items-center gap-2"><WifiOff className="w-3 h-3" /> Check microphone permissions</p>
           )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950/50 p-4 border-t border-white/5 text-center relative z-10">
           <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1.5">
             <ShieldCheck className="w-3 h-3 text-green-500" />
             Your learning data is secure with Digital Solutions Hub.
           </p>
        </div>

      </div>
    </div>
  );
};

export default StudentAssistant;
