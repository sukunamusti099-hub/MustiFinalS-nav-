
import React, { useState, useEffect, useRef } from 'react';
import { QuizAttempt, StudentStats, AdminAction, User, Report, UserRole } from '../types';

interface AdminDashboardProps {
  attempts: QuizAttempt[];
  stats: StudentStats;
  isSessionActive: boolean;
  onAdminAction: (action: AdminAction) => void;
  adminUser: User;
  isGlobalBanned?: boolean;
  onImpersonate?: (user: User) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ attempts, stats, isSessionActive, onAdminAction, adminUser, isGlobalBanned, onImpersonate }) => {
  const [logs, setLogs] = useState<{msg: string, time: string, type: 'info' | 'warn' | 'crit'}[]>([]);
  const [broadcastText, setBroadcastText] = useState('');
  const [alert, setAlert] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [individualBans, setIndividualBans] = useState<Record<string, { expiresAt: number, message: string }>>({});
  const [masterAdminKey, setMasterAdminKey] = useState(localStorage.getItem('master_admin_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [aiInstruction, setAiInstruction] = useState(localStorage.getItem('ai_personality_instruction') || "Sen uzman bir ortaokul-lise öğretmenisin...");
  
  // Yeni Kullanıcı Formu State
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserData, setNewUserData] = useState({ username: '', password: '', role: 'Student' as UserRole, specialKey: '' });

  // Gelişmiş Düzenleme Modu State
  const [editingFullDataFor, setEditingFullDataFor] = useState<string | null>(null);
  const [advancedEditData, setAdvancedEditData] = useState({ username: '', password: '', role: 'Student' as UserRole });

  // Ban Süresi Menüsü State
  const [banMenuUser, setBanMenuUser] = useState<string | null>(null);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  const fetchData = () => {
    const usersRaw = localStorage.getItem('app_users');
    const users = JSON.parse(usersRaw || '[]');
    setAllUsers(users);
    const bans = JSON.parse(localStorage.getItem('individual_bans') || '{}');
    setIndividualBans(bans);
    const reps = JSON.parse(localStorage.getItem('app_reports') || '[]');
    setReports(reps);
    setMasterAdminKey(localStorage.getItem('master_admin_key') || '');
  };

  useEffect(() => {
    fetchData();
    setLogs([{ msg: "Yönetim Terminali Bağlantısı Kuruldu.", time: new Date().toLocaleTimeString(), type: 'info' }] as any);
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  const addLog = (msg: string, type: 'info' | 'warn' | 'crit' = 'info') => {
    setLogs(prev => [...prev.slice(-20), { msg, time: new Date().toLocaleTimeString(), type }]);
  };

  const showAlert = (m: string) => {
    setAlert(m);
    setTimeout(() => setAlert(null), 3000);
  };

  const startAdvancedEdit = (user: any) => {
    setEditingFullDataFor(user.username);
    setAdvancedEditData({
      username: user.username,
      password: user.password,
      role: user.role || 'Student'
    });
  };

  const handleAdvancedSave = (oldUsername: string) => {
    const cleanNewName = advancedEditData.username.trim();
    const cleanPass = advancedEditData.password.trim();

    if (!cleanNewName || !cleanPass) {
      showAlert("BOŞ ALAN BIRAKILAMAZ");
      return;
    }

    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    
    if (cleanNewName.toLowerCase() !== oldUsername.toLowerCase() && 
        users.find((u: any) => u.username.toLowerCase() === cleanNewName.toLowerCase())) {
      showAlert("BU İSİM KULLANILIYOR");
      return;
    }

    const updatedUsers = users.map((u: any) => {
      if (u.username.trim() === oldUsername.trim()) {
        return { ...u, username: cleanNewName, password: cleanPass, role: advancedEditData.role };
      }
      return u;
    });

    if (cleanNewName !== oldUsername) {
      const oldAttempts = localStorage.getItem(`quiz_attempts_${oldUsername}`);
      if (oldAttempts) {
        localStorage.setItem(`quiz_attempts_${cleanNewName}`, oldAttempts);
        localStorage.removeItem(`quiz_attempts_${oldUsername}`);
      }
      const bans = JSON.parse(localStorage.getItem('individual_bans') || '{}');
      if (bans[oldUsername]) {
        bans[cleanNewName] = bans[oldUsername];
        delete bans[oldUsername];
        localStorage.setItem('individual_bans', JSON.stringify(bans));
      }
      addLog(`${oldUsername} -> ${cleanNewName} kimlik göçü tamamlandı.`, 'warn');
    }

    localStorage.setItem('app_users', JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);
    setEditingFullDataFor(null);
    addLog(`${cleanNewName} birimi yeniden yapılandırıldı.`, 'crit');
    showAlert("VERİLER GÜNCELLENDİ");
    
    if (oldUsername === adminUser.username) {
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        localStorage.setItem('current_user', JSON.stringify({ ...currentUser, username: cleanNewName, role: advancedEditData.role }));
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = newUserData.username.trim();
    const cleanPassword = newUserData.password.trim();

    if (!cleanUsername || !cleanPassword) {
      showAlert("BİLGİLER EKSİK");
      return;
    }

    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    if (users.find((u: any) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      showAlert("KULLANICI ZATEN VAR");
      return;
    }

    const newUser = { 
      ...newUserData, 
      username: cleanUsername, 
      password: cleanPassword, 
      token: Math.random().toString(36).substr(2, 9) 
    };
    
    const updatedUsers = [...users, newUser];
    localStorage.setItem('app_users', JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);
    addLog(`Yeni birim eklendi: ${cleanUsername}`, 'info');
    showAlert("BİRİM KAYDEDİLDİ");
    setNewUserData({ username: '', password: '', role: 'Student', specialKey: '' });
    setShowAddUserForm(false);
  };

  const handleDeleteUser = (targetUsername: string) => {
    const targetClean = targetUsername.trim();
    const currentAdminClean = adminUser.username.trim();

    if (targetClean.toLowerCase() === currentAdminClean.toLowerCase()) {
        showAlert("AKTİF OTURUM SİLİNEMEZ");
        return;
    }

    if (!window.confirm(`${targetClean} kullanıcısını KALICI olarak silmek istiyor musunuz?`)) return;

    try {
        const users = JSON.parse(localStorage.getItem('app_users') || '[]');
        const updatedUsers = users.filter((u: any) => u.username.trim().toLowerCase() !== targetClean.toLowerCase());
        setAllUsers(updatedUsers);
        localStorage.setItem('app_users', JSON.stringify(updatedUsers));
        localStorage.removeItem(`quiz_attempts_${targetClean}`);
        const bans = JSON.parse(localStorage.getItem('individual_bans') || '{}');
        if (bans[targetClean]) {
            delete bans[targetClean];
            localStorage.setItem('individual_bans', JSON.stringify(bans));
        }
        addLog(`${targetClean} terminalden tamamen kaldırıldı.`, 'crit');
        showAlert("HESAP SİLİNDİ");
        setTimeout(fetchData, 500);
    } catch (e) {
        showAlert("SİSTEM HATASI");
    }
  };

  const handleIndividualBan = (username: string, durationMinutes: number) => {
    const bans = JSON.parse(localStorage.getItem('individual_bans') || '{}');
    const expiresAt = durationMinutes === 0 ? 0 : Date.now() + (durationMinutes * 60 * 1000);
    const durationLabel = durationMinutes === 0 ? 'SÜRESİZ' : `${durationMinutes} dk`;
    
    bans[username] = { 
      expiresAt, 
      message: `Terminal erişiminiz yönetici tarafından ${durationLabel} askıya alındı.` 
    };
    
    localStorage.setItem('individual_bans', JSON.stringify(bans));
    fetchData();
    setBanMenuUser(null);
    addLog(`${username} terminal bağlantısı ${durationLabel} KESİLDİ.`, 'crit');
    showAlert(`ERİŞİM ENGELLENDİ: ${durationLabel}`);
    
    // Diğer sekmelere bildirim gönder
    onAdminAction({ 
      type: 'BAN', 
      payload: { target: username, durationMinutes }, 
      timestamp: Date.now(), 
      adminId: adminUser.token 
    });
  };

  const handleUnban = (username: string) => {
    const bans = JSON.parse(localStorage.getItem('individual_bans') || '{}');
    delete bans[username];
    localStorage.setItem('individual_bans', JSON.stringify(bans));
    fetchData();
    addLog(`${username} terminal erişimi YENİDEN AKTİF.`, 'info');
    showAlert("ENGEL KALDIRILDI");
    onAdminAction({ 
      type: 'UNBAN', 
      payload: { target: username }, 
      timestamp: Date.now(), 
      adminId: adminUser.token 
    });
  };

  const isUserBanned = (username: string) => {
    const ban = individualBans[username];
    if (!ban) return false;
    return ban.expiresAt === 0 || Date.now() < ban.expiresAt;
  };

  const updateAiPersonality = () => {
    localStorage.setItem('ai_personality_instruction', aiInstruction);
    addLog("Yapay Zeka sistemi yeniden yapılandırıldı.", 'warn');
    showAlert("SİSTEM GÜNCELLENDİ");
    onAdminAction({ type: 'AI_UPDATE', timestamp: Date.now(), adminId: adminUser.token });
  };

  const updateReportStatus = (id: string, status: Report['status']) => {
    const updated = reports.map(r => r.id === id ? { ...r, status } : r);
    localStorage.setItem('app_reports', JSON.stringify(updated));
    setReports(updated);
    addLog(`Rapor #${id.slice(0,4)} arşive alındı.`, 'info');
  };

  const handleAction = (type: AdminAction['type'], payload?: any) => {
    onAdminAction({ type, payload, timestamp: Date.now(), adminId: adminUser.token });
    if (type === 'WARN') { 
      addLog(`UYARI_PAKETİ: ${payload.target} adresine iletildi.`, 'warn'); 
      showAlert('UYARI İLETİLDİ'); 
    }
    if (type === 'AWARD_XP') { 
      addLog(`${payload.target} için ${payload.amount} XP senkronizasyonu tamamlandı.`, 'info'); 
      showAlert('XP AKTARILDI'); 
    }
    if (type === 'MESSAGE') { 
      addLog("GENEL_YAYIN: " + payload.text, 'info'); 
      setBroadcastText(''); 
      showAlert('DUYURU YAYINLANDI'); 
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">
      {alert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[3000] animate-bounce">
          <div className="bg-red-600 text-white px-10 py-4 rounded-full shadow-2xl border-2 border-red-400 font-black text-[10px] uppercase tracking-[0.4em] italic">
            {alert}
          </div>
        </div>
      )}

      {/* ÜST PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0a0a0c] border border-white/5 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
           <div className="flex justify-between items-center mb-10">
              <div>
                <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">MustiFinal // Command_Unit</p>
                <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">KOMUTA<br/>MERKEZİ</h2>
              </div>
              <div className="bg-red-600/5 border border-red-500/20 rounded-[2rem] p-5 w-64">
                <p className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-3 opacity-50">MASTER_KEY_AUTH</p>
                <div className="flex gap-2">
                   <input type={showKey ? "text" : "password"} value={masterAdminKey} readOnly className="flex-1 bg-black/50 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-mono text-red-500"/>
                   <button onClick={() => setShowKey(!showKey)} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                 <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">NEURAL_AI_PERSONALITY</p>
                 <textarea value={aiInstruction} onChange={(e) => setAiInstruction(e.target.value)} className="w-full h-32 bg-black/50 border border-white/5 rounded-2xl p-4 text-[11px] text-gray-400 focus:outline-none focus:border-indigo-500 transition-all mb-4" placeholder="Gemini talimatları..."/>
                 <button onClick={updateAiPersonality} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">GÜNCELLE</button>
              </div>
              <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
                 <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.3em] mb-4">BEKLEYEN_RAPORLAR</p>
                 <div className="space-y-3 overflow-y-auto max-h-40 pr-2 custom-scrollbar">
                    {reports.filter(r => r.status === 'pending').length === 0 && <p className="text-[10px] text-gray-600 italic">Şu an her şey yolunda.</p>}
                    {reports.filter(r => r.status === 'pending').map(r => (
                      <div key={r.id} className="bg-black/40 p-3 rounded-xl border border-white/5 group">
                        <div className="flex justify-between items-start mb-1">
                           <span className="text-[9px] font-black text-white italic">{r.sender}</span>
                           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => updateReportStatus(r.id, 'resolved')} className="w-5 h-5 bg-emerald-500/20 text-emerald-500 rounded flex items-center justify-center text-[8px]"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></button>
                           </div>
                        </div>
                        <p className="text-[10px] text-gray-500 italic line-clamp-2">"{r.message}"</p>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-[#050505] border border-white/5 rounded-[3.5rem] p-8 font-mono shadow-2xl relative overflow-hidden flex flex-col">
           <h4 className="text-indigo-500/60 font-black text-[9px] uppercase tracking-[0.4em] italic mb-6">Live_System_Feed</h4>
           <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar text-[9px]">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3 border-l-2 border-white/5 pl-3 animate-in slide-in-from-left-2">
                   <span className="text-gray-700 shrink-0">[{log.time}]</span>
                   <span className={`font-black tracking-tight ${log.type === 'crit' ? 'text-red-500' : log.type === 'warn' ? 'text-amber-500' : 'text-indigo-400'}`}>{log.type === 'crit' ? '>> CRIT:' : log.type === 'warn' ? '>> WARN:' : '>> INFO:'}</span>
                   <span className="text-gray-400 italic leading-relaxed">{log.msg}</span>
                </div>
              ))}
              <div ref={logEndRef}></div>
           </div>
        </div>
      </div>

      {/* KULLANICI LİSTESİ VE KAYIT FORMU */}
      <div className="bg-[#0a0a0c] border border-white/5 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
         <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
            <div className="flex items-center gap-4">
              <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter">TERMİNAL_DATABASE</h3>
              <button 
                onClick={() => setShowAddUserForm(!showAddUserForm)} 
                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${showAddUserForm ? 'bg-red-600 text-white' : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white'}`}
              >
                {showAddUserForm ? 'İPTAL_ET' : 'YENİ_BİRİM_EKLE'}
              </button>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
               <input type="text" value={broadcastText} onChange={(e) => setBroadcastText(e.target.value)} placeholder="Genel duyuru..." className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-xs flex-1 md:w-80 focus:border-red-500 transition-all outline-none"/>
               <button onClick={() => broadcastText && handleAction('MESSAGE', { text: broadcastText })} className="px-8 py-3 bg-red-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl active:scale-95">YAYINLA</button>
            </div>
         </div>

         {/* HIZLI KULLANICI EKLEME FORMU */}
         {showAddUserForm && (
           <form onSubmit={handleCreateUser} className="mb-12 bg-white/5 border border-indigo-500/20 p-8 rounded-[2.5rem] animate-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-2">KULLANICI_ADI</label>
                  <input 
                    type="text" 
                    value={newUserData.username} 
                    onChange={e => setNewUserData({...newUserData, username: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none"
                    placeholder="Örn: Ogrenci_01"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-2">ŞİFRE</label>
                  <input 
                    type="text" 
                    value={newUserData.password} 
                    onChange={e => setNewUserData({...newUserData, password: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none"
                    placeholder="****"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-2">ÖZEL_ANAHTAR (OPSİYONEL)</label>
                  <input 
                    type="text" 
                    value={newUserData.specialKey} 
                    onChange={e => setNewUserData({...newUserData, specialKey: e.target.value.toUpperCase()})}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-indigo-400 font-mono focus:border-indigo-500 outline-none"
                    placeholder="KEY_CODE"
                  />
                </div>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white h-11 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">SİSTEME_KAYDET</button>
              </div>
           </form>
         )}

         <div className="overflow-x-auto">
            <div className="mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
              <p className="text-[9px] font-black text-indigo-400/50 uppercase tracking-widest italic">İPUCU: Kullanıcı adına çift tıklayarak kimlik bilgilerini ve yetkiyi düzenle.</p>
            </div>
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-white/5 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                     <th className="pb-6 px-4">KİMLİK (ÇİFT_TIK_DÜZENLE)</th>
                     <th className="pb-6 px-4">ŞİFRE_ANAHTARI</th>
                     <th className="pb-6 px-4">YETKİ_MODU</th>
                     <th className="pb-6 px-4 text-right relative">OPERASYONLAR</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.02]">
                  {allUsers.map((user) => {
                    const isBanned = isUserBanned(user.username);
                    const isCurrentUser = user.username.trim().toLowerCase() === adminUser.username.trim().toLowerCase();
                    const isEditing = editingFullDataFor === user.username;
                    const isBanMenuOpen = banMenuUser === user.username;

                    return (
                      <tr key={user.username} className={`group hover:bg-white/[0.01] transition-all ${isBanned ? 'opacity-60 bg-red-500/5' : ''}`}>
                         <td className="py-6 px-4">
                            {isEditing ? (
                              <input 
                                type="text" 
                                value={advancedEditData.username} 
                                onChange={e => setAdvancedEditData({...advancedEditData, username: e.target.value})}
                                className="bg-black border border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-white font-black italic outline-none"
                              />
                            ) : (
                              <div 
                                onDoubleClick={() => startAdvancedEdit(user)}
                                className="cursor-pointer select-none font-black text-white italic hover:text-indigo-400 transition-colors"
                              >
                                {user.username}
                                {isBanned && <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-[7px] rounded-full uppercase not-italic">ASKIYA_ALINDI</span>}
                              </div>
                            )}
                         </td>
                         <td className="py-6 px-4">
                            {isEditing ? (
                              <input 
                                type="text" 
                                value={advancedEditData.password} 
                                onChange={e => setAdvancedEditData({...advancedEditData, password: e.target.value})}
                                className="bg-black border border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none"
                              />
                            ) : (
                              <code className="text-indigo-400 text-xs font-mono bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-indigo-500/10">{user.password}</code>
                            )}
                         </td>
                         <td className="py-6 px-4">
                            {isEditing ? (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setAdvancedEditData({...advancedEditData, role: 'Student'})}
                                  className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${advancedEditData.role === 'Student' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-500'}`}
                                >
                                  Öğrenci
                                </button>
                                <button 
                                  onClick={() => setAdvancedEditData({...advancedEditData, role: 'Admin'})}
                                  className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${advancedEditData.role === 'Admin' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-500'}`}
                                >
                                  Admin
                                </button>
                              </div>
                            ) : (
                              <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase italic ${user.role === 'Admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'}`}>
                                {user.role || 'Student'}
                              </span>
                            )}
                         </td>
                         <td className="py-6 px-4 text-right relative">
                            {isEditing ? (
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleAdvancedSave(user.username)} className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">KAYDET</button>
                                <button onClick={() => setEditingFullDataFor(null)} className="px-6 py-2 bg-white/5 text-gray-400 rounded-lg text-[9px] font-black uppercase tracking-widest">İPTAL</button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2 items-center">
                                {!isCurrentUser && (
                                  <>
                                     <button onClick={() => onImpersonate?.(user)} className="px-4 py-2 bg-indigo-600/10 text-indigo-500 rounded-lg border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all text-[8px] font-black uppercase tracking-widest">GİRİŞ_YAP</button>
                                     <button onClick={() => handleAction('WARN', { target: user.username, message: 'Musti seni izliyor, kurallara uy!' })} className="p-2 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></button>
                                     
                                     {isBanned ? (
                                       <button onClick={() => handleUnban(user.username)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-black text-[8px] uppercase tracking-widest hover:bg-emerald-500 transition-all">ENGELİ_KALDIR</button>
                                     ) : (
                                       <div className="relative">
                                         <button onClick={() => setBanMenuUser(isBanMenuOpen ? null : user.username)} className={`p-2 rounded-lg border transition-all ${isBanMenuOpen ? 'bg-red-600 text-white border-red-400' : 'bg-red-600/10 text-red-600 border-red-600/20 hover:bg-red-600 hover:text-white'}`}>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                         </button>
                                         
                                         {/* BAN SÜRESİ MENÜSÜ */}
                                         {isBanMenuOpen && (
                                           <div className="absolute bottom-full right-0 mb-3 z-[100] bg-[#0f0f12] border border-red-500/30 rounded-2xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.8)] min-w-[140px] animate-in slide-in-from-bottom-2">
                                              <p className="text-[7px] font-black text-red-500 uppercase tracking-widest mb-2 px-2">Süre_Seçiniz</p>
                                              <div className="flex flex-col gap-1">
                                                 <button onClick={() => handleIndividualBan(user.username, 10)} className="text-[8px] font-black text-left px-3 py-2 rounded-lg hover:bg-red-600/20 hover:text-red-400 transition-all uppercase">10 Dakika</button>
                                                 <button onClick={() => handleIndividualBan(user.username, 60)} className="text-[8px] font-black text-left px-3 py-2 rounded-lg hover:bg-red-600/20 hover:text-red-400 transition-all uppercase">1 Saat</button>
                                                 <button onClick={() => handleIndividualBan(user.username, 1440)} className="text-[8px] font-black text-left px-3 py-2 rounded-lg hover:bg-red-600/20 hover:text-red-400 transition-all uppercase">24 Saat</button>
                                                 <button onClick={() => handleIndividualBan(user.username, 0)} className="text-[8px] font-black text-left px-3 py-2 rounded-lg bg-red-600 text-white uppercase">Süresiz_Ban</button>
                                              </div>
                                           </div>
                                         )}
                                       </div>
                                     )}

                                     <button onClick={() => handleDeleteUser(user.username)} className="p-2 bg-red-600/20 text-red-500 rounded-lg border border-red-500/30 hover:bg-red-600 hover:text-white transition-all">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                     </button>
                                  </>
                                )}
                              </div>
                            )}
                         </td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
