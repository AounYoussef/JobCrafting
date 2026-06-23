
import React, { useState, useRef, useEffect } from 'react';
import { enhanceCV, enhanceCVFromImage, generateImageCV } from '../services/geminiService';

interface CVEnhancerProps {
  targetJob: string;
}

const CV_STYLES = [
  { id: 'minimal', name: 'Modern Minimalist', description: 'Clean lines, lots of whitespace' },
  { id: 'tech', name: 'Creative Tech', description: 'Dynamic, colorful, bold' },
  { id: 'executive', name: 'Executive Classic', description: 'Traditional, sophisticated, authoritative' },
  { id: 'infographic', name: 'Visual Infographic', description: 'Data-driven, icon-rich design' }
];

const LOADING_STEPS = [
  "Analyzing professional hierarchy...",
  "Applying design principles...",
  "Optimizing typographic balance...",
  "Rendering high-fidelity assets...",
  "Finalizing your masterpiece..."
];

const CVEnhancer: React.FC<CVEnhancerProps> = ({ targetJob }) => {
  const [currentCV, setCurrentCV] = useState('');
  const [enhancedCV, setEnhancedCV] = useState('');
  const [loading, setLoading] = useState(false);
  const [designLoading, setDesignLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [inputMode, setInputMode] = useState<'text' | 'image'>('text');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [visualCVUrl, setVisualCVUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(CV_STYLES[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cycle through loading messages
  useEffect(() => {
    let interval: number;
    if (designLoading) {
      setLoadingStep(0);
      interval = window.setInterval(() => {
        setLoadingStep(prev => (prev + 1) % LOADING_STEPS.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [designLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImagePreview(reader.result as string);
        setImageData({ base64: base64String, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhance = async () => {
    setLoading(true);
    try {
      let result = '';
      if (inputMode === 'text' && currentCV.trim()) {
        result = await enhanceCV(currentCV, targetJob) || '';
      } else if (inputMode === 'image' && imageData) {
        result = await enhanceCVFromImage(imageData.base64, imageData.mimeType, targetJob) || '';
      }
      setEnhancedCV(result || "No response generated. Please try again.");
      setVisualCVUrl(null); 
    } catch (error) {
      console.error(error);
      setEnhancedCV("Error enhancing CV. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDesignCV = async () => {
    if (!enhancedCV) return;
    
    setDesignLoading(true);
    try {
      // Use type casting to access aistudio which is assumed to be provided globally by the environment.
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
      
      const imageUrl = await generateImageCV(enhancedCV, targetJob, selectedStyle.name);
      if (imageUrl) {
        setVisualCVUrl(imageUrl);
      }
    } catch (error: any) {
      console.error("Design failed", error);
      if (error?.message?.includes("Requested entity was not found.")) {
        await (window as any).aistudio.openSelectKey();
      }
    } finally {
      setDesignLoading(false);
    }
  };

  const resetImage = () => {
    setImagePreview(null);
    setImageData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">AI CV Studio</h2>
          <p className="text-gray-500 mt-2 text-lg">
            Engineering a perfect resume for: <span className="font-bold text-brand-600 px-2 py-1 bg-brand-50 rounded-lg">{targetJob || 'Your Future Career'}</span>
          </p>
        </div>
        {enhancedCV && !visualCVUrl && (
          <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
             <select 
               className="bg-gray-50 border-none rounded-lg text-sm font-bold text-gray-700 focus:ring-0"
               value={selectedStyle.id}
               onChange={(e) => setSelectedStyle(CV_STYLES.find(s => s.id === e.target.value) || CV_STYLES[0])}
             >
               {CV_STYLES.map(style => (
                 <option key={style.id} value={style.id}>{style.name}</option>
               ))}
             </select>
             <button 
               onClick={handleDesignCV}
               disabled={designLoading}
               className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-brand-700 transition-all flex items-center gap-2 shadow-lg active:scale-95"
             >
                {designLoading ? (
                   <span className="flex items-center gap-2">
                     <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     Studio Active...
                   </span>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Generate Visual CV
                  </>
                )}
             </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-stretch">
        {/* Input Side */}
        <div className="flex flex-col h-full bg-white p-8 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -z-0 opacity-50"></div>
          
          <div className="flex bg-gray-100 p-1.5 rounded-xl mb-8 self-start relative z-10">
            <button
              onClick={() => setInputMode('text')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${inputMode === 'text' ? 'bg-white text-brand-700 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Paste Content
            </button>
            <button
              onClick={() => setInputMode('image')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${inputMode === 'image' ? 'bg-white text-brand-700 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Upload CV Image
            </button>
          </div>

          <div className="flex-1 min-h-[400px] relative z-10">
            {inputMode === 'text' ? (
              <textarea
                className="w-full h-full p-6 rounded-2xl border-gray-200 border focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none shadow-inner resize-none font-medium text-gray-700 bg-gray-50 leading-relaxed"
                placeholder="Paste your current resume text here. Our AI will analyze and improve every detail."
                value={currentCV}
                onChange={(e) => setCurrentCV(e.target.value)}
              />
            ) : (
              <div className="h-full flex flex-col">
                {!imagePreview ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 border-3 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-12 cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all bg-gray-50/50 group"
                  >
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-12 h-12 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-xl text-gray-700 font-black">Drop your CV here</p>
                    <p className="text-gray-400 font-medium mt-2">Support for JPG, PNG, WEBP</p>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                  <div className="relative flex-1 group rounded-3xl overflow-hidden border-2 border-brand-100 shadow-2xl bg-gray-900">
                    <img src={imagePreview} alt="CV Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-6 backdrop-blur-sm">
                       <button 
                         onClick={() => {
                            const link = document.createElement('a');
                            link.href = imagePreview;
                            link.download = `JobCrafting_Source_CV.png`;
                            link.click();
                         }}
                         className="bg-white p-4 rounded-2xl text-brand-600 hover:scale-110 transition-transform shadow-2xl font-bold flex items-center gap-2"
                       >
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                         Download Source
                       </button>
                       <button 
                         onClick={resetImage}
                         className="bg-red-500 p-4 rounded-2xl text-white hover:scale-110 transition-transform shadow-2xl font-bold flex items-center gap-2"
                       >
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         Remove
                       </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleEnhance}
            disabled={loading || (inputMode === 'text' && !currentCV) || (inputMode === 'image' && !imageData)}
            className="mt-8 w-full bg-brand-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-brand-700 disabled:opacity-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex justify-center items-center gap-3 active:scale-95 z-10"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Analyzing Content...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Optimize Resume
              </>
            )}
          </button>
        </div>

        {/* Output Side / Design Studio */}
        <div className="flex flex-col h-full bg-slate-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden text-white border border-white/10">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2v-2zm0-10h2v8h-2V6z"/></svg>
          </div>
          
          <label className="block text-xs font-black text-brand-400 mb-6 uppercase tracking-[0.2em]">
            {designLoading ? 'Gemini Design Studio' : visualCVUrl ? 'Final Masterpiece' : 'Optimized Content'}
          </label>
          
          <div className="flex-1 w-full min-h-[445px] relative">
            {designLoading ? (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12 bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-brand-500/30">
                {/* Background Shimmer */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-600/10 to-transparent animate-pulse"></div>
                
                {/* Visual Skeleton with Scanning Beam */}
                <div className="relative w-48 h-64 bg-slate-800 rounded-lg border border-white/10 shadow-2xl mb-12 flex flex-col p-4 gap-3 opacity-80 overflow-hidden">
                   <div className="h-6 w-1/2 bg-white/10 rounded"></div>
                   <div className="h-3 w-3/4 bg-white/5 rounded"></div>
                   <div className="mt-4 space-y-2">
                     <div className="h-2 w-full bg-white/5 rounded"></div>
                     <div className="h-2 w-full bg-white/5 rounded"></div>
                     <div className="h-2 w-2/3 bg-white/5 rounded"></div>
                   </div>
                   <div className="mt-auto h-24 w-full bg-brand-500/5 rounded border border-brand-500/20"></div>

                   {/* Scanning Beam */}
                   <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>

                <div className="text-center relative z-10">
                  <h3 className="text-2xl font-black text-white mb-3 tracking-tight animate-pulse">
                    Crafting Visual Identity
                  </h3>
                  <p className="text-brand-300 font-bold text-sm tracking-widest uppercase mb-8 h-4 text-center w-full">
                    {LOADING_STEPS[loadingStep]}
                  </p>
                  
                  <div className="flex justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                </div>

                <style>{`
                  @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                  }
                `}</style>
              </div>
            ) : visualCVUrl ? (
              <div className="h-full flex flex-col items-center animate-in zoom-in-95 duration-700">
                 <div className="relative w-full h-full bg-white rounded-2xl overflow-hidden shadow-2xl ring-4 ring-brand-500/20">
                    <img src={visualCVUrl} alt="Visual CV Design" className="w-full h-full object-contain" />
                    <div className="absolute top-4 right-4 flex gap-2">
                       <button 
                         onClick={() => {
                            const link = document.createElement('a');
                            link.href = visualCVUrl;
                            link.download = `JobCrafting_CV_${targetJob.replace(/\s+/g, '_')}.png`;
                            link.click();
                         }}
                         className="bg-brand-600 p-3 rounded-xl text-white shadow-2xl hover:bg-brand-700 transition-all flex items-center gap-2 font-bold hover:scale-105 active:scale-95"
                       >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                         Export PNG
                       </button>
                    </div>
                 </div>
              </div>
            ) : enhancedCV ? (
              <div className="h-full w-full p-8 rounded-2xl bg-white/5 border border-white/10 overflow-y-auto scrollbar-hide backdrop-blur-md animate-in slide-in-from-bottom-4">
                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap leading-relaxed font-medium">
                  {enhancedCV}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-12 space-y-6">
                 <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
                    <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                 </div>
                 <p className="font-bold text-lg text-slate-400">Professional Refinement Awaits</p>
                 <p className="text-sm max-w-xs opacity-60">Complete the intake on the left to activate the AI Design Studio.</p>
              </div>
            )}
          </div>

          {enhancedCV && !visualCVUrl && !designLoading && (
             <div className="mt-8 grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigator.clipboard.writeText(enhancedCV)}
                  className="bg-white/10 text-white border border-white/20 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  Copy Text
                </button>
                <button
                  onClick={handleDesignCV}
                  className="bg-brand-500 text-white py-4 rounded-2xl font-black hover:bg-brand-600 transition-all active:scale-95 shadow-lg shadow-brand-500/40 hover:-translate-y-0.5"
                >
                  Generate Visual CV
                </button>
             </div>
          )}

          {visualCVUrl && !designLoading && (
             <button
               onClick={() => setVisualCVUrl(null)}
               className="mt-8 w-full bg-white/5 text-slate-400 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/10"
             >
               Return to Editor
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVEnhancer;
