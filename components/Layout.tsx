
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'dashboard', label: '仪表盘', icon: 'fa-chart-pie' },
    { id: 'monitoring', label: '监测', icon: 'fa-heartbeat' },
    { id: 'meds', label: '用药', icon: 'fa-pills' },
    { id: 'diet', label: '饮食', icon: 'fa-utensils' },
    { id: 'ai', label: '洞察', icon: 'fa-robot' },
    { id: 'profile', label: '我的', icon: 'fa-user-circle' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuAction = (action: () => void) => {
    setIsUserMenuOpen(false);
    action();
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-hidden h-screen">
      {/* Sidebar Desktop - Narrower and more compact */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-6 shadow-2xl shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-indigo-600 p-2.5 rounded-xl">
            <i className="fas fa-kidney text-white text-xl"></i>
          </div>
          <h1 className="text-xl font-black tracking-tighter">肾益康 Plus</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-500 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fas ${item.icon} w-5 text-base`}></i>
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Compact User Profile */}
        <div className="mt-auto pt-6 border-t border-slate-800 relative" ref={menuRef}>
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-0 w-full mb-3 bg-slate-800 border border-white/5 rounded-2xl shadow-2xl p-2 animate-in slide-in-from-bottom-2 duration-200 z-50">
              <button onClick={() => handleMenuAction(() => setActiveTab('profile'))} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-all font-bold text-xs"><i className="fas fa-user-edit"></i> 资料设置</button>
              <button onClick={() => handleMenuAction(onLogout)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-all font-bold text-xs"><i className="fas fa-users-cog"></i> 切换账号</button>
              <div className="my-1 border-t border-white/5"></div>
              <button onClick={() => handleMenuAction(onLogout)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all font-bold text-xs"><i className="fas fa-power-off"></i> 退出系统</button>
            </div>
          )}
          <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center font-black shadow-lg uppercase">{user.name.charAt(0)}</div>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-xs font-black truncate leading-tight">{user.name}</p>
              <p className="text-[9px] text-slate-500 truncate font-bold uppercase tracking-wider mt-0.5">{user.ckdStage ? `CKD ${user.ckdStage}期` : 'CKD 未分期'}</p>
            </div>
            <i className={`fas fa-chevron-up text-[10px] text-slate-600 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}></i>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-50">
        <header className="bg-white/70 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-base font-black text-slate-800 tracking-tight uppercase">
            {navItems.find(i => i.id === activeTab)?.label || '概览'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all border border-slate-100"><i className="fas fa-bell text-sm"></i></button>
            <button onClick={() => setIsUserMenuOpen(true)} className="md:hidden w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">{user.name.charAt(0)}</button>
          </div>
        </header>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {children}
        </div>

        {/* Mobile Bottom Navigation - Compact */}
        <nav className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 flex justify-around p-2.5 shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`}
            >
              <i className={`fas ${item.icon} text-sm`}></i>
              <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>

      {/* Mobile Context Menu Overlay */}
      {isUserMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div ref={menuRef} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-400">
             <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-50">
               <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl">{user.name.charAt(0)}</div>
               <div><p className="font-black text-slate-900">{user.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">CKD 分期: {user.ckdStage || '未知'}</p></div>
             </div>
             <div className="grid gap-3">
               <button onClick={() => handleMenuAction(() => setActiveTab('profile'))} className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-xl font-bold text-xs"><i className="fas fa-id-card text-indigo-500"></i> 资料设置</button>
               <button onClick={() => handleMenuAction(onLogout)} className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-xl font-bold text-xs"><i className="fas fa-sync text-blue-500"></i> 切换账号</button>
               <button onClick={() => handleMenuAction(onLogout)} className="w-full flex items-center gap-4 p-4 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs"><i className="fas fa-sign-out-alt"></i> 退出系统</button>
               <button onClick={() => setIsUserMenuOpen(false)} className="mt-4 w-full py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">取消</button>
             </div>
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default Layout;
