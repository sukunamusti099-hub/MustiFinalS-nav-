
import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizSettings, AdminAction, User } from '../types';

interface GameInterfaceProps {
  questions: QuizQuestion[];
  settings: QuizSettings;
  onComplete: (score: number, userAnswers: Record<number, string>) => void;
  onExit: () => void;
  isBanned: boolean;
  adminUser?: User | null;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ questions, settings, onComplete, onExit, isBanned, adminUser }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [lives, setLives] = useState(3);
  const [xp, setXp] = useState(0);
  const [hammerActive, setHammerActive] = useState(false);
  const [shake, setShake] = useState(false);
  const [showHammerOverlay, setShowHammerOverlay] = useState(false);
  const [impact, setImpact] = useState(false);

  if (!questions || questions.length === 0) return null;
  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const triggerHammer = () => {
    if (showExplanation || hammerActive) return;
    
    setHammerActive(true);
    setShowHammerOverlay(true);
    
    // Balyoz vuruş dizisi
    setTimeout(() => {
      setImpact(true);
      setShake(true);
      setSelectedAnswers(prev => ({ ...prev, [currentIndex]: currentQuestion.correct_answer }));
      setShowExplanation(true);
      setXp(prev => prev + 100);
    }, 600); // Vuruş anı

    setTimeout(() => {
      setImpact(false);
      setShake(false);
    }, 1100);

    setTimeout(() => {
      setShowHammerOverlay(false);
      setHammerActive(false);
      // Admin için otomatik geçiş
      setTimeout(() => {
         if (!isLast) forceNext();
      }, 1500);
    }, 2500);
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'admin_action' && e.newValue) {
        const action: AdminAction = JSON.parse(e.newValue);
        if (action.type === 'SKIP') triggerHammer();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [currentIndex, showExplanation, hammerActive]);

  const forceNext = () => {
    if (isLast) onComplete(questions.reduce((acc, q, idx) => acc + (selectedAnswers[idx] === q.correct_answer ? 1 : 0), 0), selectedAnswers);
    else {
      setCurrentIndex(prev => prev + 1);
      setShowExplanation(false);
    }
  };

  const handleConfirm = () => {
    const isCorrect = selectedAnswers[currentIndex] === currentQuestion.correct_answer;
    if (isCorrect) setXp(prev => prev + 25);
    else {
      setLives(prev => Math.max(0, prev - 1));
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    setShowExplanation(true);
  };

  return (
    <div className={`max-w-5xl mx-auto py-10 px-6 transition-all duration-300 relative ${shake ? 'animate-shake' : ''}`}>
      
      {/* GELİŞMİŞ BALYOZ OVERLAY */}
      {showHammerOverlay && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none overflow-hidden">
           {/* Arka Plan Karartma ve Glitch */}
           <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${impact ? 'opacity-100 bg-amber-500/20' : 'opacity-80'}`}></div>
           <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
           
           {/* Şok Dalgası */}
           {impact && (
             <div className="absolute w-1 h-1 bg-amber-500 rounded-full animate-shockwave shadow-[0_0_100px_#fbbf24]"></div>
           )}

           {/* Balyoz Görseli */}
           <div className={`text-[18rem] transition-all duration-[600ms] ${impact ? 'translate-y-20 scale-125 rotate-0 opacity-100' : '-translate-y-[100vh] -rotate-45 opacity-0'} filter drop-shadow-[0_0_50px_rgba(251,191,36,0.8)]`}>
              🔨
           </div>

           {/* Bilgilendirme Yazıları */}
           <div className="absolute bottom-20 left-0 w-full text-center">
              <div className="inline-block bg-black border-2 border-amber-500 px-10 py-4 rounded-2xl shadow-[0_0_40px_rgba(251,191,36,0.3)] animate-pulse">
                 <p className="text-amber-500 font-black text-xl italic uppercase tracking-[0.5em]">
                    {impact ? '!! KRİTİK_HATA_BAYPAS_EDİLDİ !!' : 'SİSTEM_GÜVENLİĞİ_AŞILIYOR...'}
                 </p>
                 <div className="mt-4 h-1 bg-white/10 w-full rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 animate-progress-fast"></div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* HEADER HUD */}
      <div className="bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-8 mb-8 flex items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1 bg-indigo-500 shadow-[0_0_15px_#6366f1]"></div>
        <div className="flex items-center gap-6">
           <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
              <span className="text-xl font-black italic text-indigo-400">{currentIndex + 1}</span>
           </div>
           <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Terminal_Subject</p>
              <h2 className="text-white font-black text-lg uppercase tracking-tight">{settings.topic}</h2>
           </div>
        </div>

        <div className="flex items-center gap-10">
           <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-1">Health_Integrity</p>
              <div className="flex gap-1.5">
                 {[...Array(3)].map((_, i) => (
                   <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${i < lives ? 'bg-indigo-500 shadow-[0_0_10px_#6366f1]' : 'bg-red-900/20'}`}></div>
                 ))}
              </div>
           </div>
           <div className="bg-indigo-500/5 px-8 py-4 rounded-3xl border border-indigo-500/10 text-center min-w-[120px]">
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic">Total_XP</p>
              <p className="text-2xl font-black text-white italic tracking-tighter">{xp}</p>
           </div>
        </div>
      </div>

      {/* QUESTION CORE */}
      <div className={`bg-[#08080a]/90 backdrop-blur-xl rounded-[3.5rem] p-8 md:p-16 shadow-2xl border border-white/5 min-h-[550px] flex flex-col justify-between transition-all relative ${hammerActive ? 'ring-8 ring-amber-500/50 scale-[0.98]' : ''}`}>
        
        {hammerActive && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em] italic z-20 shadow-[0_0_30px_#fbbf24]">
            ADMIN_BYPASS_MODE
          </div>
        )}

        <div>
          <div className="flex items-center gap-4 mb-12">
             <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_100px_#6366f1]"></div>
             <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.5em] italic">AI_Query_Active</p>
          </div>
          
          <h3 className="text-2xl md:text-4xl font-black text-white leading-[1.2] mb-12 md:mb-20 italic tracking-tight">
            {currentQuestion.question}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(currentQuestion.options).map(([key, value]) => {
              const isSelected = selectedAnswers[currentIndex] === key;
              const isCorrect = key === currentQuestion.correct_answer;
              const isWrong = isSelected && !isCorrect;

              let style = "bg-white/[0.03] border-white/5 text-gray-400 hover:bg-white/[0.07] hover:text-white hover:border-white/10";
              if (showExplanation) {
                if (isCorrect) style = "bg-emerald-600 text-white border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.4)] scale-[1.03] z-10";
                else if (isWrong) style = "bg-red-600/20 text-red-400 border-red-500/30 opacity-50";
                else style = "opacity-20 scale-95 grayscale";
              } else if (isSelected) {
                style = "bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)] border-indigo-400 scale-[1.03] z-10";
              }

              return (
                <button
                  key={key}
                  disabled={showExplanation}
                  onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentIndex]: key }))}
                  className={`p-6 md:p-10 rounded-[2.5rem] border-2 font-black transition-all text-left flex items-center gap-6 group ${style}`}
                >
                  <span className={`text-base font-black ${isSelected || (showExplanation && isCorrect) ? 'text-white/50' : 'text-indigo-500'}`}>{key}</span>
                  <span className="flex-1 text-base md:text-lg italic tracking-tight leading-tight">{value}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 md:mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex-1">
              {showExplanation && (
                <div className="animate-in slide-in-from-left-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Analiz_Raporu</p>
                   <p className="text-gray-400 text-xs italic line-clamp-2">{currentQuestion.solution}</p>
                </div>
              )}
           </div>

           {!showExplanation ? (
             <button
                disabled={!selectedAnswers[currentIndex]}
                onClick={handleConfirm}
                className="w-full md:w-auto px-16 py-6 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-400 hover:text-white active:scale-95 transition-all disabled:opacity-10"
             >
                SEÇİMİ_ONAYLA
             </button>
           ) : (
             <button
                onClick={forceNext}
                className="w-full md:w-auto px-16 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-500 active:scale-95 transition-all"
             >
                {isLast ? 'FİNAL_RAPORU' : 'SONRAKİ_AŞAMA'}
             </button>
           )}
        </div>
      </div>

      {/* ADMIN FLOATING HAMMER TOOL */}
      {adminUser?.role === 'Admin' && (
        <div className="fixed bottom-10 right-10 z-[150] group">
          <div className={`absolute inset-0 bg-amber-500 blur-3xl transition-opacity duration-300 ${hammerActive ? 'opacity-100 animate-pulse' : 'opacity-20 group-hover:opacity-50'}`}></div>
          <button 
            onClick={triggerHammer}
            disabled={showExplanation || hammerActive}
            className={`relative w-24 h-24 bg-amber-500 text-black rounded-full flex items-center justify-center border-4 border-black font-black transition-all disabled:grayscale group shadow-[0_0_30px_rgba(251,191,36,0.5)] ${hammerActive ? 'scale-110 rotate-12 shadow-[0_0_100px_rgba(251,191,36,1)] animate-pulse' : 'hover:scale-110 active:scale-90'}`}
          >
            <div className="flex flex-col items-center">
              <span className={`text-3xl mb-1 transition-transform ${hammerActive ? 'animate-bounce' : 'group-hover:rotate-12'}`}>🔨</span>
              <span className="text-[8px] uppercase tracking-tighter">HAMMER</span>
            </div>
          </button>
          
          <div className={`absolute bottom-full right-0 mb-4 transition-transform origin-bottom-right ${hammerActive ? 'scale-125' : 'scale-0 group-hover:scale-100'}`}>
             <div className={`bg-black border text-amber-500 px-6 py-3 rounded-2xl whitespace-nowrap text-[10px] font-black uppercase tracking-widest italic shadow-2xl ${hammerActive ? 'border-amber-500 shadow-amber-500/50' : 'border-amber-500/30'}`}>
                {hammerActive ? 'PROKOL_YÜRÜTÜLÜYOR...' : 'SORUYU_ETKİSİZ_HALE_GETİR'}
             </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-10px, -5px); }
          20%, 40%, 60%, 80% { transform: translate(10px, 5px); }
        }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }

        @keyframes shockwave {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(50); opacity: 0; border: 2px solid #fbbf24; }
        }
        .animate-shockwave { animation: shockwave 1s ease-out forwards; }

        @keyframes progress-fast {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress-fast { animation: progress-fast 2.5s linear forwards; }
      `}</style>
    </div>
  );
};

export default GameInterface;
