
import React, { useState } from 'react';
import { Subject, Level, QuizSettings } from '../types';

interface QuizGeneratorProps {
  onGenerate: (settings: QuizSettings) => void;
  isLoading: boolean;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ onGenerate, isLoading }) => {
  const [subject, setSubject] = useState<Subject>('Matematik');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<Level>('Orta');
  const [randomSeed, setRandomSeed] = useState(Math.floor(Math.random() * 100000).toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({ subject, topic, level, randomSeed });
  };

  const getExampleTopic = (sub: Subject) => {
    switch (sub) {
      case 'Matematik': return 'Kesirlerde toplama';
      case 'Fen': return 'Kimya elementler';
      case 'Türkçe': return 'Fiiller';
      case 'Sosyal': return 'Osmanlı tarihi';
      default: return '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 items-stretch pb-10">
      {/* Sol Panel: Terminal Statları ve Mascot */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="bg-[#0a0a0c] border border-white/5 p-8 rounded-[3.5rem] flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-20 h-20 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
           </div>
           <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-indigo-500/20 shadow-[0_0_40px_rgba(79,70,229,0.3)] bg-white/5 flex items-center justify-center p-4 relative">
              <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>
              <img 
                src="https://cdn-icons-png.flaticon.com/512/802/802191.png" 
                alt="Mascot Musti" 
                className="w-full h-full object-contain animate-bounce-slow relative z-10"
              />
           </div>
           <div className="relative z-10">
              <h4 className="text-white font-black italic tracking-tighter text-2xl mb-1 uppercase leading-none">PROF. MUSTİ</h4>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4">NEURAL_TUTOR_X1</p>
              <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent mx-auto mb-4"></div>
              <p className="text-gray-400 text-xs font-bold italic leading-relaxed px-2 bg-white/5 py-3 rounded-2xl border border-white/5">
                "Zihin kapasiteni %100'e çek evlat. Veri akışı başlıyor!"
              </p>
           </div>
        </div>

        <div className="bg-[#0a0a0c] border border-white/5 p-8 rounded-[3rem] shadow-xl relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 italic flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
             LIVE_TERMINAL_FEED
           </p>
           <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-[10px] text-gray-600 font-black uppercase">Engine:</span><span className="text-[10px] text-indigo-400 font-black font-mono">GEMINI_3_ULTRA</span></div>
              <div className="flex justify-between items-center"><span className="text-[10px] text-gray-600 font-black uppercase">Uptime:</span><span className="text-[10px] text-emerald-500 font-black font-mono">99.9%</span></div>
              <div className="flex justify-between items-center"><span className="text-[10px] text-gray-600 font-black uppercase">Buffer:</span><span className="text-[10px] text-amber-500 font-black font-mono">0.02ms</span></div>
           </div>
        </div>
      </div>

      {/* Ana Form Paneli */}
      <div className="flex-1 p-8 md:p-14 bg-[#0a0a0c] border border-white/10 rounded-[4.5rem] shadow-2xl backdrop-blur-3xl relative overflow-hidden animate-in fade-in slide-in-from-right-10 duration-1000">
        <div className="absolute top-0 right-0 p-16 opacity-[0.03] select-none pointer-events-none">
           <span className="text-[15rem] font-black italic uppercase leading-none">EDU</span>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-12">
          {/* Branş Seçimi */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 border border-indigo-500/20 italic font-black text-xs">01</div>
              <label className="text-[12px] font-black text-white uppercase tracking-[0.4em] italic">BRANŞ_SEKTÖRÜ</label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['Matematik', 'Fen', 'Türkçe', 'Sosyal'] as Subject[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSubject(s);
                    setTopic(getExampleTopic(s));
                  }}
                  className={`group relative overflow-hidden py-6 rounded-[2.5rem] border-2 transition-all duration-500 ${
                    subject === s 
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_50px_rgba(79,70,229,0.5)] scale-105' 
                      : 'bg-white/[0.03] border-white/5 text-gray-500 hover:border-indigo-500/30'
                  }`}
                >
                  <span className="relative z-10 font-black text-[11px] uppercase tracking-[0.2em]">{s}</span>
                  {subject === s && <div className="absolute inset-0 bg-gradient-to-tr from-indigo-800 to-indigo-500 opacity-50 animate-pulse"></div>}
                </button>
              ))}
            </div>
          </div>

          {/* Konu Girişi */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 border border-indigo-500/20 italic font-black text-xs">02</div>
              <label className="text-[12px] font-black text-white uppercase tracking-[0.4em] italic">OPERASYON_HEDEFİ (KONU)</label>
            </div>
            <div className="group relative">
               <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={`Örn: ${getExampleTopic(subject)}`}
                required
                className="w-full bg-white/[0.03] border-b-2 border-white/10 px-8 py-8 text-white placeholder-white/5 focus:outline-none focus:border-indigo-500 transition-all font-black text-2xl italic uppercase tracking-tighter"
              />
              <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 w-0 group-focus-within:w-full transition-all duration-1000 shadow-[0_0_15px_#6366f1]"></div>
            </div>
          </div>

          {/* Zorluk ve Seed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500 border border-indigo-500/20 italic font-black text-[10px]">03</div>
                <label className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic">ZORLUK_MODU</label>
              </div>
              <div className="flex bg-white/[0.03] p-2 rounded-[2.5rem] border border-white/5">
                {(['Kolay', 'Orta', 'Zor'] as Level[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(l)}
                    className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                      level === l ? 'bg-white text-black shadow-2xl scale-[1.02]' : 'text-gray-600 hover:text-white'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500 border border-indigo-500/20 italic font-black text-[10px]">04</div>
                <label className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic">FREKANS_KODU</label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={randomSeed}
                  onChange={(e) => setRandomSeed(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 py-5 text-indigo-400 font-mono text-xs focus:outline-none focus:border-indigo-500/50 uppercase"
                />
                <button 
                  type="button" 
                  onClick={() => setRandomSeed(Math.floor(Math.random() * 100000).toString())}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="group relative w-full py-10 overflow-hidden rounded-[3rem] bg-white text-black transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-30"
          >
            <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out"></div>
            <div className="relative z-10 flex items-center justify-center gap-8">
              {isLoading ? (
                <>
                  <div className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                  <span className="font-black text-sm uppercase tracking-[0.6em] animate-pulse">VERİ_PAKETLERİ_HAZIRLANIYOR</span>
                </>
              ) : (
                <>
                  <span className="font-black text-lg uppercase tracking-[0.8em] group-hover:text-white transition-colors italic">SİMÜLASYONU_BAŞLAT</span>
                  <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center group-hover:bg-white group-hover:text-indigo-600 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </>
              )}
            </div>
          </button>
        </form>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default QuizGenerator;
