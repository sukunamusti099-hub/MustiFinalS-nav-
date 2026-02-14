
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [specialKey, setSpecialKey] = useState('');
  const [role, setRole] = useState<UserRole>('Student');
  const [adminSecret, setAdminSecret] = useState(''); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ADMIN_SECRET_KEY = 'TEKNOFEST2025';

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    const hasAdmin = users.some((u: any) => u.username === 'admin');
    if (!hasAdmin) {
      localStorage.setItem('app_users', JSON.stringify([...users, { username: 'admin', password: 'admin', role: 'Admin', specialKey: 'MASTER' }]));
    }
    // Varsayılan master admin key ayarla
    if (!localStorage.getItem('master_admin_key')) {
      localStorage.setItem('master_admin_key', 'MUSTI_MASTER_2025');
    }
  }, []);

  // Özel anahtar ile hızlı giriş kontrolü
  useEffect(() => {
    if (!isRegistering && specialKey.length >= 4) {
      const masterKey = localStorage.getItem('master_admin_key') || 'MUSTI_MASTER_2025';
      
      // Master Admin Key kontrolü (En üst yetki)
      if (specialKey === masterKey) {
        setIsScanning(true);
        setIsLoading(true);
        const timer = setTimeout(() => {
          onLogin({ 
            username: 'Musti_Admin', 
            role: 'Admin', 
            token: 'MASTER-' + Math.random().toString(36).substr(2, 6).toUpperCase(), 
            canSkip: true 
          });
          setIsLoading(false);
          setIsScanning(false);
        }, 1200);
        return () => clearTimeout(timer);
      }

      // Normal kullanıcı anahtar kontrolü
      const users = JSON.parse(localStorage.getItem('app_users') || '[]');
      const found = users.find((u: any) => u.specialKey === specialKey);
      if (found) {
        setIsScanning(true);
        setIsLoading(true);
        const timer = setTimeout(() => {
          onLogin({ ...found, token: Math.random().toString(36), canSkip: found.role === 'Admin' });
          setIsLoading(false);
          setIsScanning(false);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [specialKey, isRegistering, onLogin]);

  // Gizli Admin Girişi: Logoya 3 saniye basılı tutma
  const handleLogoTouchStart = () => {
    holdTimerRef.current = setTimeout(() => {
      setRole('Admin');
      setIsRegistering(true);
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 500);
    }, 3000); 
  };

  const handleLogoTouchEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isRegistering && role === 'Admin' && adminSecret !== ADMIN_SECRET_KEY) {
      setError('Erişim reddedildi: Geçersiz yetki kodu.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('app_users') || '[]');
      if (isRegistering) {
        if (!username || !password) { setError('Gerekli alanları doldurun.'); setIsLoading(false); return; }
        if (users.find((u: any) => u.username === username)) { setError('Kimlik kullanımda.'); setIsLoading(false); return; }
        
        const newUser = { username, password, role, specialKey: specialKey || undefined };
        localStorage.setItem('app_users', JSON.stringify([...users, newUser]));
        onLogin({ username, role, token: Math.random().toString(36), canSkip: role === 'Admin', specialKey: specialKey || undefined });
      } else {
        const found = users.find((u: any) => u.username === username && u.password === password);
        if (found) onLogin({ ...found, token: Math.random().toString(36), canSkip: found.role === 'Admin' });
        else setError('Bilgiler uyuşmuyor.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#020203] flex items-center justify-center p-6 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-0 left-0 w-full h-1 bg-indigo-500/50 shadow-[0_0_30px_#6366f1] transition-transform duration-[1200ms] ease-in-out z-50 ${isScanning ? 'translate-y-[100vh]' : '-translate-y-full'}`}></div>
        <div className={`absolute inset-0 bg-indigo-500/5 transition-opacity duration-500 ${isScanning ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-indigo-900/10 blur-[180px] rounded-full"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-blue-900/10 blur-[180px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <div 
            onMouseDown={handleLogoTouchStart} 
            onMouseUp={handleLogoTouchEnd}
            onMouseLeave={handleLogoTouchEnd}
            onTouchStart={handleLogoTouchStart}
            onTouchEnd={handleLogoTouchEnd}
            className="relative inline-block mb-8 select-none cursor-default group"
          >
            <div className="absolute inset-0 bg-indigo-600/20 blur-2xl rounded-full"></div>
            <div className="relative w-24 h-24 bg-[#0a0a0c] border border-white/5 rounded-[2rem] flex items-center justify-center shadow-2xl overflow-hidden">
               <svg viewBox="0 0 100 100" className="w-16 h-16 text-indigo-500/30">
                  <path d="M50 15 L20 40 L20 70 L50 90 L80 70 L80 40 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="50" cy="50" r="10" fill="currentColor" className="opacity-10" />
                  <path d="M35 45 Q50 35 65 45" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
               </svg>
            </div>
          </div>
          
          <h1 className="text-4xl font-black text-white tracking-tighter mb-1 italic uppercase">
            MUSTI<span className="text-indigo-500 font-light not-italic">FINAL</span>
          </h1>
          <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.6em] italic">Access_Terminal_V8.5</p>
        </div>

        <div className="bg-[#08080a]/90 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isRegistering && (
               <div className="space-y-2 group">
                <label className="text-[8px] font-black text-indigo-400/40 uppercase tracking-widest ml-1 italic group-focus-within:text-indigo-400 transition-colors">>> ANAHTAR_MODU</label>
                <input
                  type="text"
                  value={specialKey}
                  onChange={(e) => setSpecialKey(e.target.value.toUpperCase())}
                  autoComplete="off"
                  className={`w-full bg-white/[0.02] border rounded-2xl px-6 py-4 text-white focus:outline-none transition-all font-black tracking-[0.2em] text-center text-lg ${isScanning ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-white/5 focus:border-indigo-500/30'}`}
                  placeholder={isScanning ? "..." : "ÖZEL_KOD"}
                />
              </div>
            )}

            <div className="relative py-2 flex items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-[8px] font-black text-white/10 uppercase italic tracking-widest">GİRİŞ</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/30 transition-all font-bold placeholder-white/5"
                placeholder="KULLANICI"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/30 transition-all font-bold placeholder-white/5"
                placeholder="ŞİFRE"
              />
            </div>

            {isRegistering && (
              <div className="space-y-4 pt-2 animate-in slide-in-from-top-4 duration-500">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-indigo-400/30 uppercase tracking-widest ml-1 italic">Anahtar Belirle (Opsiyonel)</label>
                  <input
                    type="text"
                    value={specialKey}
                    onChange={(e) => setSpecialKey(e.target.value.toUpperCase())}
                    className="w-full bg-indigo-500/5 border border-indigo-500/10 rounded-2xl px-6 py-4 text-indigo-400 focus:outline-none focus:border-indigo-500/30 transition-all font-black text-center"
                    placeholder="KEY_CODE"
                  />
                </div>
                {role === 'Admin' && (
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-red-500/40 uppercase tracking-widest ml-1 italic">Yönetici Doğrulama</label>
                    <input
                      type="password"
                      value={adminSecret}
                      onChange={(e) => setAdminSecret(e.target.value)}
                      className="w-full bg-red-900/5 border border-red-500/20 rounded-2xl px-6 py-4 text-red-400 focus:outline-none focus:border-red-500/50 transition-all font-bold"
                      placeholder="AUTH_SECRET"
                    />
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-red-500 text-[9px] font-black uppercase tracking-tight text-center italic">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl font-black text-[9px] tracking-[0.4em] uppercase transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] ${isRegistering ? 'bg-indigo-600 text-white shadow-indigo-600/20' : 'bg-white text-black hover:bg-indigo-50'}`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                isRegistering ? 'KAYDI_TAMAMLA' : 'OTURUM_AÇ'
              )}
            </button>
          </form>

          <div className="mt-8">
            <button onClick={() => { setIsRegistering(!isRegistering); setRole('Student'); setError(''); }} className="w-full text-center text-[9px] font-black text-white/20 uppercase tracking-widest hover:text-indigo-400 transition-colors italic">
              {isRegistering ? 'Giriş Ekranı' : 'Yeni Kimlik Oluştur'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
