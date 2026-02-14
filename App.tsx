
import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizSettings, QuizAttempt, StudentStats, Subject, User, AdminAction, Report } from './types';
import { generateQuizQuestions } from './services/geminiService';
import QuizGenerator from './components/QuizGenerator';
import GameInterface from './components/GameInterface';
import ResultView from './components/ResultView';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [originalAdmin, setOriginalAdmin] = useState<User | null>(null);
  const [view, setView] = useState<'setup' | 'game' | 'result' | 'admin'>('setup');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentSettings, setCurrentSettings] = useState<QuizSettings | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{score: number, total: number, answers: Record<number, string>} | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [banMessage, setBanMessage] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
  const [systemNotice, setSystemNotice] = useState<{message: string, type: 'info' | 'error' | 'success' | 'warn'} | null>(null);
  const [xpRewardToast, setXpRewardToast] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');

  const loadUserData = (username: string) => {
    const key = `quiz_attempts_${username}`;
    const savedAttempts = localStorage.getItem(key);
    setAttempts(savedAttempts ? JSON.parse(savedAttempts) : []);
  };

  const showNotice = (message: string, type: 'info' | 'error' | 'success' | 'warn' = 'info', duration = 3000) => {
    setSystemNotice({ message, type });
    setTimeout(() => setSystemNotice(null), duration);
  };

  const awardBonusXP = (amount: number) => {
    if (!user) return;
    const virtualAttempt: QuizAttempt = {
      id: 'sys-' + Math.random().toString(36).substr(2, 5),
      date: new Date().toISOString(),
      settings: { subject: 'Sistem', topic: 'Ödül', level: 'Zor', randomSeed: '999' },
      score: amount / 20, total: amount / 20, questions: [], userAnswers: {}
    };
    const updatedAttempts = [...attempts, virtualAttempt];
    setAttempts(updatedAttempts);
    localStorage.setItem(`quiz_attempts_${user.username}`, JSON.stringify(updatedAttempts));
    setXpRewardToast(amount);
    setTimeout(() => setXpRewardToast(null), 5000);
  };

  // Admin aksiyonlarını işleyen merkezi fonksiyon
  const processAdminAction = (action: AdminAction) => {
    if (action.type === 'AWARD_XP' && action.payload?.target === user?.username) {
        awardBonusXP(action.payload.amount);
    }
    if (action.type === 'WARN' && action.payload?.target === user?.username) {
        showNotice(action.payload?.message, 'warn', 5000);
    }
    if (action.type === 'MESSAGE') {
        showNotice(`SİSTEM DUYURUSU: ${action.payload?.text}`, 'info', 8000);
    }
  };

  useEffect(() => {
    if (user) loadUserData(user.username);
  }, [user?.username]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
      if (user && user.role !== 'Admin') {
        const bans = JSON.parse(localStorage.getItem('individual_bans') || '{}');
        const banInfo = bans[user.username];
        if (banInfo && (banInfo.expiresAt === 0 || Date.now() < banInfo.expiresAt)) {
          setIsBanned(true);
          setBanMessage(banInfo.message || 'Erişim Kısıtlı.');
        } else {
          setIsBanned(false);
        }
      } else {
        setIsBanned(false);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [user]);

  useEffect(() => {
    const savedUser = localStorage.getItem('current_user');
    if (savedUser && !user) setUser(JSON.parse(savedUser));

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'admin_action' && e.newValue) {
        const action: AdminAction = JSON.parse(e.newValue);
        processAdminAction(action);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [user, attempts]);

  const handleImpersonate = (targetUser: User) => {
    if (user?.role === 'Admin' || originalAdmin) {
      const adminIdentity = originalAdmin || user;
      setOriginalAdmin(adminIdentity);
      setUser({ ...targetUser, token: 'GHOST-' + Math.random().toString(36).substr(2, 5) });
      setView('setup');
      showNotice(`${targetUser.username} Terminaline Bağlanıldı`, 'success');
    }
  };

  const stopImpersonation = () => {
    if (originalAdmin) {
      setUser(originalAdmin);
      setOriginalAdmin(null);
      setView('admin');
      showNotice("Yönetici Terminaline Dönüldü", 'info');
    }
  };

  const handleGenerate = async (settings: QuizSettings) => {
    setLoading(true); setError(null);
    try {
      const generated = await generateQuizQuestions(settings);
      setQuestions(generated); setCurrentSettings(settings); setView('game');
    } catch (err: any) { setError(err.message || 'Hata oluştu.'); } finally { setLoading(false); }
  };

  const handleGameComplete = (score: number, userAnswers: Record<number, string>) => {
    if (!currentSettings || !user) return;
    const newAttempt: QuizAttempt = { id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString(), settings: currentSettings, score, total: questions.length, questions, userAnswers };
    const updatedAttempts = [...attempts, newAttempt];
    setAttempts(updatedAttempts);
    localStorage.setItem(`quiz_attempts_${user.username}`, JSON.stringify(updatedAttempts));
    setLastResult({ score, total: questions.length, answers: userAnswers }); 
    setView('result');
  };

  const stats: StudentStats = {
    totalXP: attempts.reduce((acc, curr) => acc + (curr.score * 20), 0),
    level: Math.floor(attempts.reduce((acc, curr) => acc + (curr.score * 20), 0) / 100) + 1,
    completedQuizzes: attempts.length,
    subjectPerformance: (['Matematik', 'Fen', 'Türkçe', 'Sosyal', 'Sistem'] as Subject[]).reduce((acc, sub) => {
      const subAttempts = attempts.filter(a => a.settings.subject === sub);
      if (subAttempts.length === 0) return { ...acc, [sub]: 0 };
      const totalScore = subAttempts.reduce((a, b) => a + b.score, 0);
      const totalQuest = subAttempts.reduce((a, b) => a + (b.total || 0), 0);
      return { ...acc, [sub]: totalQuest > 0 ? Math.round((totalScore / totalQuest) * 100) : 0 };
    }, {} as Record<Subject, number>)
  };

  if (!user) return <Login onLogin={(u) => { setUser(u); localStorage.setItem('current_user', JSON.stringify(u)); }} />;
  
  if (isBanned && !originalAdmin) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
      <div className="max-w-2xl">
         <h1 className="text-7xl font-black text-red-600 italic mb-6">ERİŞİM KESİLDİ.</h1>
         <p className="text-white text-xl font-bold mb-10 italic uppercase tracking-tighter">"{banMessage}"</p>
         <button onClick={() => { setUser(null); localStorage.removeItem('current_user'); }} className="px-10 py-5 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl">Terminali Kapat</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
      {/* SİSTEM BİLDİRİM TOAST */}
      {systemNotice && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[2000] animate-in slide-in-from-top-10 duration-500`}>
          <div className={`px-10 py-6 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-2 flex items-center gap-6 ${
            systemNotice.type === 'error' ? 'bg-red-600 border-red-400' : 
            systemNotice.type === 'warn' ? 'bg-amber-500 border-amber-300 text-black' :
            systemNotice.type === 'success' ? 'bg-emerald-600 border-emerald-400' : 'bg-indigo-600 border-indigo-400'
          }`}>
             <div className={`w-3 h-3 rounded-full animate-ping ${systemNotice.type === 'warn' ? 'bg-black' : 'bg-white'}`}></div>
             <span className="text-sm font-black uppercase tracking-[0.2em] italic leading-tight max-w-md">{systemNotice.message}</span>
          </div>
        </div>
      )}

      {/* HAYALET MODU HUD */}
      {originalAdmin && (
        <div className="sticky top-0 z-[1000] bg-gradient-to-r from-red-600 to-red-900 px-6 py-2 flex items-center justify-between border-b border-white/20 animate-pulse shadow-[0_5px_30px_rgba(220,38,38,0.4)]">
          <div className="flex items-center gap-3">
             <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
             <p className="text-[10px] font-black uppercase tracking-widest text-white italic">HAYALET_MODU: {user.username}</p>
          </div>
          <button onClick={stopImpersonation} className="bg-white text-red-600 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">ADMİNE_DÖN</button>
        </div>
      )}

      {xpRewardToast && <div className="fixed top-32 right-10 z-[300] bg-indigo-600 p-6 rounded-3xl border border-indigo-400 shadow-2xl animate-in slide-in-from-right-20"><p className="text-2xl font-black italic">+{xpRewardToast} XP YÜKLENDİ</p></div>}
      
      {showReportModal && <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"><div className="bg-[#0a0a0c] p-10 rounded-[3rem] w-full max-w-lg"><h3 className="text-3xl font-black italic mb-6">MERKEZE RAPOR ET</h3><textarea value={reportText} onChange={(e) => setReportText(e.target.value)} className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 mb-6" placeholder="Mesajınız..."/><div className="flex gap-4"><button onClick={() => setShowReportModal(false)} className="flex-1 py-4 bg-white/5 rounded-2xl">İPTAL</button><button onClick={() => {
        if (!reportText.trim() || !user) return;
        const reports = JSON.parse(localStorage.getItem('app_reports') || '[]');
        const newReport: Report = { id: Math.random().toString(36).substr(2, 9), sender: user.username, message: reportText, timestamp: Date.now(), status: 'pending' };
        localStorage.setItem('app_reports', JSON.stringify([newReport, ...reports]));
        setReportText(''); setShowReportModal(false); showNotice("Rapor İletildi", "success");
      }} className="flex-1 py-4 bg-indigo-600 rounded-2xl">GÖNDER</button></div></div></div>}
      
      {(user.role === 'Student' || originalAdmin) && <button onClick={() => setShowReportModal(true)} className="fixed bottom-10 left-10 z-[200] w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-2xl"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>}

      <header className={`px-6 pt-6 sticky ${originalAdmin ? 'top-10' : 'top-0'} z-[100]`}>
        <div className="max-w-7xl mx-auto bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-4 flex items-center justify-between">
           <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('setup')}><img src="https://cdn-icons-png.flaticon.com/512/802/802191.png" className="w-10 h-10"/><span className="font-black italic uppercase text-lg tracking-tighter">Musti<span className="text-indigo-500">Final</span></span></div>
           <nav className="flex gap-2 bg-white/5 p-1 rounded-2xl">
              <button onClick={() => setView('setup')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${view !== 'admin' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>Terminal</button>
              {(user.role === 'Admin' || originalAdmin) && (
                <button onClick={() => { if (originalAdmin) stopImpersonation(); else setView('admin'); }} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${view === 'admin' ? 'bg-red-600 text-white' : 'text-gray-500'}`}>Yönetim</button>
              )}
           </nav>
           <button onClick={() => { setUser(null); setOriginalAdmin(null); localStorage.removeItem('current_user'); }} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-6 0v-1m6-11V7a3 3 0 00-6 0v1" /></svg>
           </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 pt-12">
        {error && <div className="p-4 bg-red-600/20 text-red-500 rounded-2xl mb-10 font-bold uppercase text-[10px] tracking-widest text-center">{error}</div>}
        {view === 'setup' && <QuizGenerator onGenerate={handleGenerate} isLoading={loading} />}
        {view === 'game' && currentSettings && <GameInterface questions={questions} settings={currentSettings} onComplete={handleGameComplete} onExit={() => setView('setup')} isBanned={isBanned} adminUser={originalAdmin || user}/>}
        {view === 'result' && lastResult && <ResultView questions={questions} result={{ score: lastResult.score, total: lastResult.total, answers: questions.map((q, i) => ({ questionIndex: i, selectedOption: lastResult.answers[i], isCorrect: lastResult.answers[i] === q.correct_answer })) }} onRestart={() => setView('setup')}/>}
        {view === 'admin' && (user.role === 'Admin' || originalAdmin) && (
            <AdminDashboard 
                attempts={attempts} 
                stats={stats} 
                isSessionActive={false} 
                onAdminAction={(a) => {
                    localStorage.setItem('admin_action', JSON.stringify(a));
                    processAdminAction(a); // Kendi ekranında da göster
                }} 
                adminUser={originalAdmin || user} 
                onImpersonate={handleImpersonate} 
            />
        )}
      </main>
      <footer className="py-20 border-t border-white/5 opacity-40 text-center"><p className="text-[9px] font-black uppercase tracking-[0.5em] italic">MustiFinal // Neural_Gate_Module</p></footer>
    </div>
  );
};

export default App;
