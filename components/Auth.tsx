
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
  savedUsers: User[];
}

const Auth: React.FC<AuthProps> = ({ onLogin, savedUsers }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showSwitch, setShowSwitch] = useState(savedUsers.length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: isLogin ? (email.split('@')[0]) : name,
      diagnosedDate: new Date().toISOString(),
    });
  };

  const handleQuickSwitch = (user: User) => {
    onLogin(user);
  };

  if (showSwitch && savedUsers.length > 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 animate-in fade-in duration-1000">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_50px_rgba(79,70,229,0.4)]">
            <i className="fas fa-kidney text-4xl"></i>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">谁正在使用肾益康？</h2>
          <p className="text-slate-500 text-lg font-bold">请选择您的账号以继续管理健康数据</p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12 max-w-6xl">
          {savedUsers.map((u) => (
            <button
              key={u.email}
              onClick={() => handleQuickSwitch(u)}
              className="group flex flex-col items-center gap-5 transition-all hover:scale-110 active:scale-95"
            >
              <div className="w-24 h-24 md:w-36 md:h-36 rounded-[2.5rem] bg-indigo-500/10 border-4 border-slate-800 flex items-center justify-center text-4xl md:text-6xl text-indigo-400 group-hover:border-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xl">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-center">
                <p className="text-white font-black text-lg md:text-xl tracking-tight">{u.name}</p>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {u.ckdStage ? `CKD ${u.ckdStage}期` : '未设置分期'}
                </p>
              </div>
            </button>
          ))}
          
          <button
            onClick={() => setShowSwitch(false)}
            className="group flex flex-col items-center gap-5 transition-all hover:scale-110 active:scale-95"
          >
            <div className="w-24 h-24 md:w-36 md:h-36 rounded-[2.5rem] bg-slate-900 border-4 border-slate-800 border-dashed flex items-center justify-center text-4xl text-slate-700 group-hover:border-indigo-500 group-hover:text-indigo-500 transition-all">
              <i className="fas fa-plus"></i>
            </div>
            <p className="text-slate-500 group-hover:text-indigo-500 font-black text-lg md:text-xl">登录其他</p>
          </button>
        </div>

        <p className="mt-20 text-slate-700 text-sm font-bold uppercase tracking-[0.3em]">Advanced Multi-User Management System</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-950 px-4 animate-in fade-in zoom-in-95 duration-700">
      <div className="max-w-md w-full bg-white rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden p-10 md:p-14 border border-white/5">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20">
            <i className="fas fa-kidney text-3xl"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">肾益康 Plus</h2>
          <p className="text-slate-400 font-bold">{isLogin ? '欢迎回到健康管理中心' : '开启您的肾脏保护之旅'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">您的姓名</label>
              <input 
                type="text"
                className="w-full px-8 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                placeholder="王小明"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">登录邮箱</label>
            <input 
              type="email"
              className="w-full px-8 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
              placeholder="user@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">安全密码</label>
            <input 
              type="password"
              className="w-full px-8 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-lg shadow-2xl transition-all active:scale-95 mt-4"
          >
            {isLogin ? '立即进入' : '创建账号'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 font-black text-sm hover:underline"
          >
            {isLogin ? "还没有账号？点击注册" : "已有账号？去登录"}
          </button>
          
          {savedUsers.length > 0 && (
            <button 
              onClick={() => setShowSwitch(true)}
              className="block w-full text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
            >
              <i className="fas fa-users-cog mr-2"></i> 返回账号切换
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
