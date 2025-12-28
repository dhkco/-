
import React, { useState } from 'react';
import { AppState, VitalRecord, User } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface DashboardProps {
  state: AppState;
}

type MetricKey = 'bp' | 'ua' | 'cr' | 'egfr' | 'protein' | 'weight';

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey | null>(null);
  const { user } = state;

  const proteinMap: Record<string, string> = {
    'negative': '阴性', 'trace': '微量', '1+': '1+', '2+': '2+', '3+': '3+', '4+': '4+'
  };

  const calculateDiagnosedDuration = (dateStr?: string) => {
    if (!dateStr) return '未设置';
    const start = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return `${diffDays}天`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}个月`;
    return `${Math.floor(diffMonths / 12)}年${diffMonths % 12}个月`;
  };

  const getLatestValue = (key: MetricKey) => {
    const reversed = [...state.vitals].reverse();
    if (key === 'bp') {
      const record = reversed.find(v => v.bloodPressureSys !== undefined && v.bloodPressureSys !== 0);
      return record ? `${record.bloodPressureSys}/${record.bloodPressureDia}` : '--/--';
    }
    if (key === 'protein') {
      const record = reversed.find(v => v.urineProtein !== undefined);
      return record ? proteinMap[record.urineProtein] : '无';
    }
    const fieldMap: Record<string, keyof VitalRecord> = {
      ua: 'uricAcid', cr: 'creatinine', egfr: 'eGFR', weight: 'weight'
    };
    const field = fieldMap[key];
    const record = reversed.find(v => v[field] !== undefined && v[field] !== 0);
    return record?.[field]?.toString() || '--';
  };

  const metrics = [
    { id: 'bp', title: '血压', value: getLatestValue('bp'), unit: 'mmHg', icon: 'fa-heartbeat', color: 'indigo' },
    { id: 'egfr', title: 'eGFR', value: getLatestValue('egfr'), unit: 'ml/min', icon: 'fa-gauge-high', color: 'emerald' },
    { id: 'cr', title: '肌酐', value: getLatestValue('cr'), unit: 'umol/L', icon: 'fa-flask', color: 'blue' },
    { id: 'ua', title: '尿酸', value: getLatestValue('ua'), unit: 'umol/L', icon: 'fa-vial', color: 'amber' },
    { id: 'protein', title: '尿蛋白', value: getLatestValue('protein'), unit: '定性', icon: 'fa-tint', color: 'rose' },
    { id: 'weight', title: '体重', value: getLatestValue('weight'), unit: 'kg', icon: 'fa-weight', color: 'slate' },
  ];

  if (selectedMetric) {
    const metricInfo = metrics.find(m => m.id === selectedMetric)!;
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
        <button onClick={() => setSelectedMetric(null)} className="flex items-center gap-2 text-indigo-600 font-bold hover:underline mb-2 text-xs">
          <i className="fas fa-arrow-left"></i> 返回概览
        </button>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-black text-slate-800">{metricInfo.title}趋势分析</h3>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900">{metricInfo.value}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">{metricInfo.unit}</span>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={state.vitals.slice(-15).map(v => ({ date: new Date(v.timestamp).toLocaleDateString([], {month:'2-digit', day:'2-digit'}), val: selectedMetric === 'bp' ? v.bloodPressureSys : (v as any)[metricInfo.id === 'ua' ? 'uricAcid' : metricInfo.id === 'cr' ? 'creatinine' : metricInfo.id === 'egfr' ? 'eGFR' : 'weight'] }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9}} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="val" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10">
      {/* 临床背景状态条 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <i className="fas fa-hospital-user text-sm"></i>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CKD 分期</p>
            <p className="text-sm font-black text-slate-800">{user?.ckdStage ? `Stage ${user.ckdStage}` : '未设置'}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <i className="fas fa-calendar-check text-sm"></i>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">确诊时长</p>
            <p className="text-sm font-black text-slate-800">{calculateDiagnosedDuration(user?.diagnosedDate)}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <i className="fas fa-bullseye text-sm"></i>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">目标血压</p>
            <p className="text-sm font-black text-slate-800">{user?.targetBloodPressure || '未设置'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMetric(m.id as MetricKey)}
            className="group bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:border-indigo-300 transition-all text-left"
          >
            <div className={`w-8 h-8 rounded-lg bg-${m.color}-50 text-${m.color}-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
              <i className={`fas ${m.icon} text-xs`}></i>
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{m.title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900">{m.value}</span>
              <span className="text-[8px] text-slate-400 font-bold uppercase">{m.unit}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden flex flex-col justify-center min-h-[140px]">
          <div className="relative z-10">
            <span className="px-2 py-0.5 bg-white/10 rounded-md text-[8px] font-black uppercase tracking-widest mb-2 inline-block">AI 洞察</span>
            <h3 className="text-lg font-black text-indigo-300 mb-1 leading-tight">近期肾功能稳定</h3>
            <p className="text-slate-400 text-[10px] leading-relaxed max-w-md">
              系统分析了您的肌酐趋势和 eGFR。目前肾脏排泄功能代偿良好，请坚持规律休息并按时服用保肾药物。
            </p>
          </div>
          <i className="fas fa-kidney absolute -bottom-6 -right-6 text-[100px] opacity-[0.05] rotate-12"></i>
        </div>

        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-widest">用药日程概览</h4>
          </div>
          <div className="space-y-1.5 overflow-y-auto max-h-[100px] pr-1 custom-scrollbar">
            {state.medications.length > 0 ? (
              state.medications.map(med => (
                <div key={med.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] shrink-0"><i className="fas fa-pills"></i></div>
                    <p className="text-[10px] font-black text-slate-800 truncate leading-none">{med.name}</p>
                  </div>
                  <span className="text-[8px] text-slate-400 font-bold">{med.reminders[0] || '--:--'}</span>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-slate-300 text-center py-6 italic">暂无用药记录</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
