
import React, { useState, useRef } from 'react';
import { VitalRecord } from '../types';
import { analyzeLabReport } from '../services/geminiService';

interface MonitoringProps {
  vitals: VitalRecord[];
  onAdd: (record: VitalRecord) => void;
}

type MetricType = 'bp' | 'ua' | 'cr' | 'egfr' | 'protein' | 'weight' | 'symptoms';

const METRIC_OPTIONS = [
  { value: 'bp', label: '血压 (BP)', icon: 'fa-heartbeat', color: 'indigo' },
  { value: 'ua', label: '尿酸 (UA)', icon: 'fa-vial', color: 'amber' },
  { value: 'cr', label: '肌酐 (Cr)', icon: 'fa-flask', color: 'blue' },
  { value: 'egfr', label: 'eGFR', icon: 'fa-gauge-high', color: 'emerald' },
  { value: 'protein', label: '尿蛋白', icon: 'fa-tint', color: 'rose' },
  { value: 'weight', label: '体重 (Weight)', icon: 'fa-weight', color: 'slate' },
];

const Monitoring: React.FC<MonitoringProps> = ({ vitals, onAdd }) => {
  const [activeMode, setActiveMode] = useState<'manual' | 'ai'>('manual');
  const [selectedType, setSelectedType] = useState<MetricType>('bp');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<any>({
    sys: 120, dia: 80, val: '', protein: 'negative',
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setExtractedData(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const result = await analyzeLabReport(base64Data, file.type);
        setExtractedData(result && Object.keys(result).length > 0 ? result : null);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert("文件处理失败");
      setIsProcessing(false);
    }
  };

  const handleConfirmAI = () => {
    if (!extractedData) return;
    onAdd({
      id: Date.now().toString(),
      timestamp: extractedData.reportDate ? new Date(extractedData.reportDate).toISOString() : new Date().toISOString(),
      bloodPressureSys: extractedData.bloodPressureSys || 0,
      bloodPressureDia: extractedData.bloodPressureDia || 0,
      weight: extractedData.weight || 0,
      urineProtein: extractedData.urineProtein || 'negative',
      creatinine: extractedData.creatinine,
      uricAcid: extractedData.uricAcid,
      eGFR: extractedData.eGFR,
      edemaLevel: 0,
    });
    setExtractedData(null);
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const baseRecord: any = { id: Date.now().toString(), timestamp: new Date().toISOString(), edemaLevel: 0 };
    if (selectedType === 'bp') { 
      baseRecord.bloodPressureSys = Number(formData.sys); 
      baseRecord.bloodPressureDia = Number(formData.dia); 
    }
    else if (selectedType === 'weight') baseRecord.weight = Number(formData.val);
    else if (selectedType === 'protein') baseRecord.urineProtein = formData.protein;
    else if (selectedType === 'ua') baseRecord.uricAcid = Number(formData.val);
    else if (selectedType === 'cr') baseRecord.creatinine = Number(formData.val);
    else if (selectedType === 'egfr') baseRecord.eGFR = Number(formData.val);
    onAdd(baseRecord as VitalRecord);
    setFormData({ ...formData, val: '' });
  };

  const proteinMap: Record<string, string> = {
    'negative': '阴性', 'trace': '微量', '1+': '1+', '2+': '2+', '3+': '3+', '4+': '4+'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex">
        <button onClick={() => setActiveMode('manual')} className={`flex-1 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeMode === 'manual' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>手动录入</button>
        <button onClick={() => setActiveMode('ai')} className={`flex-1 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeMode === 'ai' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>AI 分析</button>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        {activeMode === 'ai' ? (
          <div className="text-center space-y-4">
            {!extractedData ? (
              <div className="py-10 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'} text-2xl text-indigo-500 mb-2`}></i>
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">上传化验单</h4>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,.pdf" />
                <button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="mt-4 px-6 py-2 bg-slate-900 text-white text-[9px] font-black rounded-lg uppercase tracking-[0.2em] transition-all">{isProcessing ? '处理中...' : '选择文件'}</button>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(extractedData).map(([k, v]: [string, any]) => v && (
                    <div key={k} className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{k}</p>
                      <p className="text-xs font-black text-slate-800">{k === 'urineProtein' ? proteinMap[v] || v : v}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setExtractedData(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase">取消</button>
                  <button onClick={handleConfirmAI} className="flex-[2] py-2.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase shadow-lg">确认导入数据</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmitManual} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">指标类型</label>
                <select 
                  value={selectedType} 
                  onChange={(e) => setSelectedType(e.target.value as MetricType)} 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm outline-none"
                >
                  {METRIC_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              
              <div className="md:col-span-8">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">指标数值</label>
                {selectedType === 'bp' ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input type="number" value={formData.sys} onChange={e => setFormData({...formData, sys: e.target.value})} className="w-full text-center py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-black text-indigo-600 text-lg outline-none focus:border-indigo-500" placeholder="收缩压" />
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-2 text-[7px] font-black text-indigo-400 border border-indigo-50">SYS</span>
                    </div>
                    <div className="relative flex-1">
                      <input type="number" value={formData.dia} onChange={e => setFormData({...formData, dia: e.target.value})} className="w-full text-center py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-black text-emerald-600 text-lg outline-none focus:border-emerald-500" placeholder="舒张压" />
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-2 text-[7px] font-black text-emerald-400 border border-emerald-50">DIA</span>
                    </div>
                  </div>
                ) : selectedType === 'protein' ? (
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(proteinMap).map(([k, v]) => (
                      <button 
                        key={k} 
                        type="button" 
                        onClick={() => setFormData({...formData, protein: k})} 
                        className={`py-2 rounded-lg font-bold text-[10px] border transition-all ${formData.protein === k ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.1" 
                      value={formData.val} 
                      onChange={e => setFormData({...formData, val: e.target.value})} 
                      className="w-full text-center py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-black text-xl text-slate-800 outline-none focus:border-indigo-500" 
                      placeholder="0.00" 
                    />
                    <span className="absolute top-1/2 right-4 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">
                      {METRIC_OPTIONS.find(o => o.value === selectedType)?.label.split('(')[1]?.replace(')', '') || ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all">保存监测数据</button>
          </form>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col max-h-[350px]">
        <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between shrink-0">
          <h4 className="text-[9px] font-black text-slate-400 tracking-widest uppercase">历史记录</h4>
          <span className="text-[8px] bg-slate-50 px-2 py-0.5 rounded-md font-bold text-slate-400">{vitals.length} 条</span>
        </div>
        <div className="overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <tr className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="px-5 py-2">日期</th>
                <th className="px-5 py-2">指标</th>
                <th className="px-5 py-2">结果</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {vitals.slice().reverse().map(v => {
                const info = getRecordInfo(v, proteinMap);
                return (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-2.5 text-[10px] font-bold text-slate-800">{new Date(v.timestamp).toLocaleDateString([], {month: '2-digit', day: '2-digit'})}</td>
                    <td className="px-5 py-2.5"><span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-${info.color}-50 text-${info.color}-600 border border-${info.color}-100`}>{info.label}</span></td>
                    <td className="px-5 py-2.5 font-black text-slate-700 text-[10px]">{info.value}</td>
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

function getRecordInfo(v: any, proteinMap: any) {
  if (v.bloodPressureSys) return { label: '血压', value: `${v.bloodPressureSys}/${v.bloodPressureDia}`, color: 'indigo' };
  if (v.creatinine) return { label: '肌酐', value: `${v.creatinine}`, color: 'blue' };
  if (v.uricAcid) return { label: '尿酸', value: `${v.uricAcid}`, color: 'amber' };
  if (v.eGFR) return { label: 'eGFR', value: `${v.eGFR}`, color: 'emerald' };
  if (v.urineProtein) return { label: '尿蛋白', value: proteinMap[v.urineProtein], color: 'rose' };
  if (v.weight) return { label: '体重', value: `${v.weight}`, color: 'slate' };
  return { label: '其他', value: '-', color: 'slate' };
}

export default Monitoring;
