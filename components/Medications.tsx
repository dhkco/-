
import React, { useState, useRef } from 'react';
import { Medication, Prescription } from '../types';
import { analyzePrescription } from '../services/geminiService';

interface MedProps {
  meds: Medication[];
  prescriptions: Prescription[];
  onAddMed: (med: Medication) => void;
  onDeleteMed: (id: string) => void;
  onAddPrescription: (p: Prescription) => void;
  onDeletePrescription: (id: string) => void;
}

const Medications: React.FC<MedProps> = ({ 
  meds, prescriptions, onAddMed, onDeleteMed, onAddPrescription, onDeletePrescription 
}) => {
  const [activeView, setActiveView] = useState<'current' | 'archive'>('current');
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedPrescription, setParsedPrescription] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 手动添加表单状态
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '' });
  const [tempReminders, setTempReminders] = useState<string[]>(['08:00']);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const result = await analyzePrescription(base64Data, file.type);
        if (result && result.medications) {
          setParsedPrescription({
            ...result,
            fileName: file.name,
            fileData: reader.result as string,
            mimeType: file.type
          });
        } else {
          alert("未能识别到处方内容，请尝试拍摄更清晰的照片");
        }
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert("处理失败");
      setIsProcessing(false);
    }
  };

  const confirmImportPrescription = () => {
    if (!parsedPrescription) return;
    const pId = Date.now().toString();
    const prescriptionMeds: Medication[] = parsedPrescription.medications.map((m: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      reminders: ['08:00'], // 默认提醒
      sourcePrescriptionId: pId
    }));

    onAddPrescription({
      id: pId,
      date: parsedPrescription.prescriptionDate || new Date().toISOString(),
      type: parsedPrescription.type || 'western',
      fileName: parsedPrescription.fileName,
      fileData: parsedPrescription.fileData,
      mimeType: parsedPrescription.mimeType,
      extractedMeds: prescriptionMeds
    });

    // 自动加入当前用药列表
    prescriptionMeds.forEach(m => onAddMed(m));
    setParsedPrescription(null);
    setActiveView('archive');
  };

  const handleManualAdd = () => {
    if (!newMed.name) return;
    onAddMed({
      id: Date.now().toString(),
      ...newMed,
      reminders: tempReminders,
    });
    setNewMed({ name: '', dosage: '', frequency: '' });
    setShowManualAdd(false);
  };

  // 按日期分组处方
  const groupedPrescriptions = prescriptions.reduce((groups: any, p) => {
    const date = p.date.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(p);
    return groups;
  }, {});

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* 顶部控制栏 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveView('current')} 
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'current' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            当前服用
          </button>
          <button 
            onClick={() => setActiveView('archive')} 
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'archive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            处方档案
          </button>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50"
          >
            <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-file-medical'}`}></i>
            {isProcessing ? 'AI 分析中...' : '上传处方'}
          </button>
          <button 
            onClick={() => setShowManualAdd(!showManualAdd)}
            className="flex-1 md:flex-none px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest"
          >
            手动添加
          </button>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,.pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
      </div>

      {/* AI 解析预览弹窗 */}
      {parsedPrescription && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl">
                  <i className="fas fa-magic"></i>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">AI 处方识别结果</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">请校对后确认导入</p>
                </div>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {parsedPrescription.medications.map((m: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="font-black text-slate-800 text-sm">{m.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">剂量: {m.dosage} | 频次: {m.frequency}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => setParsedPrescription(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest">取消</button>
                <button onClick={confirmImportPrescription} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100">导入并归档</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 手动添加表单 */}
      {showManualAdd && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input placeholder="药物名称" className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} />
            <input placeholder="剂量 (如 1粒)" className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} />
            <input placeholder="频次 (如 早晚各一次)" className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})} />
          </div>
          <button onClick={handleManualAdd} className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em]">确认添加药物</button>
        </div>
      )}

      {/* 内容视图 */}
      {activeView === 'current' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meds.map(med => (
            <div key={med.id} className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><i className="fas fa-capsules"></i></div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm leading-tight">{med.name}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{med.dosage} · {med.frequency}</p>
                  </div>
                </div>
                <button onClick={() => onDeleteMed(med.id)} className="text-slate-200 hover:text-rose-500 transition-colors"><i className="fas fa-trash-alt text-xs"></i></button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-50">
                {med.reminders.map(time => <span key={time} className="px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-[8px] font-black">{time}</span>)}
              </div>
              {med.sourcePrescriptionId && (
                <div className="absolute top-0 right-0 p-1 bg-indigo-500 text-white rounded-bl-lg text-[6px] font-black uppercase">来自处方</div>
              )}
            </div>
          ))}
          {meds.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-30">
              <i className="fas fa-pills text-4xl mb-4"></i>
              <p className="text-xs font-black uppercase tracking-widest">暂无正在服用的药物</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.keys(groupedPrescriptions).sort().reverse().map(date => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-black text-slate-800 bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">{date}</h3>
                <div className="flex-1 h-px bg-slate-100"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {groupedPrescriptions[date].map((p: Prescription) => (
                  <div key={p.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
                    <div className="aspect-[4/3] bg-slate-900 relative flex items-center justify-center overflow-hidden">
                      {p.mimeType.startsWith('image/') ? (
                        <img src={p.fileData} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Prescription" />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-white/30">
                          <i className="fas fa-file-pdf text-4xl"></i>
                          <span className="text-[10px] font-black uppercase tracking-widest">PDF 文档</span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${p.type === 'chinese' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'}`}>
                          {p.type === 'chinese' ? '中药方' : '西药处方'}
                        </span>
                      </div>
                      <button onClick={() => onDeletePrescription(p.id)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md text-white/50 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center">
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-black text-slate-800 text-xs truncate max-w-[150px]">{p.fileName}</h4>
                        <span className="text-[9px] text-slate-400 font-bold">{p.extractedMeds.length} 种药物</span>
                      </div>
                      <div className="space-y-1.5">
                        {p.extractedMeds.slice(0, 3).map(m => (
                          <div key={m.id} className="flex items-center gap-2 text-slate-500">
                            <i className="fas fa-check text-[8px] text-emerald-500"></i>
                            <span className="text-[10px] font-bold truncate">{m.name}</span>
                          </div>
                        ))}
                        {p.extractedMeds.length > 3 && <p className="text-[8px] text-slate-300 font-bold uppercase ml-4">... 及更多</p>}
                      </div>
                      <button className="w-full mt-4 py-2 border border-slate-100 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-colors">查看详情</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {prescriptions.length === 0 && (
            <div className="py-20 text-center opacity-30">
              <i className="fas fa-folder-open text-4xl mb-4"></i>
              <p className="text-xs font-black uppercase tracking-widest">还没有上传过处方</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Medications;
