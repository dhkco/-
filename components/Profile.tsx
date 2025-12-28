
import React, { useState } from 'react';
import { User } from '../types';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState<User>(user);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(formData);
      setIsSaving(false);
      alert('资料更新成功！');
    }, 600);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tighter">账号与临床背景</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Clinical Profile</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-base shadow-lg shadow-indigo-100">
          <i className="fas fa-user-gear"></i>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
            <i className="fas fa-id-card text-indigo-500 text-xs"></i>
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">基础信息</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">姓名</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">年龄</label>
              <input type="number" name="age" value={formData.age || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">性别</label>
              <select name="gender" value={formData.gender || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm">
                <option value="">请选择</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">基础体重 (kg)</label>
              <input type="number" name="baselineWeight" value={formData.baselineWeight || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm" />
            </div>
          </div>
        </section>

        <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
            <i className="fas fa-notes-medical text-emerald-500 text-xs"></i>
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">疾病诊断</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">CKD 分期</label>
              <select name="ckdStage" value={formData.ckdStage || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm">
                <option value="unknown">未确定</option>
                <option value="1">CKD 1期</option>
                <option value="2">CKD 2期</option>
                <option value="3a">CKD 3a期</option>
                <option value="3b">CKD 3b期</option>
                <option value="4">CKD 4期</option>
                <option value="5">CKD 5期</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">确诊日期</label>
              <input type="date" name="diagnosedDate" value={formData.diagnosedDate?.split('T')[0] || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">目标血压</label>
              <input type="text" name="targetBloodPressure" value={formData.targetBloodPressure || ''} onChange={handleChange} placeholder="< 130/80" className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm" />
            </div>
          </div>
        </section>

        <button 
          type="submit"
          disabled={isSaving}
          className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <><i className="fas fa-check-circle"></i> 保存资料更新</>
          )}
        </button>
      </form>
    </div>
  );
};

export default Profile;
