
import React, { useState, useEffect } from 'react';
import { Meal } from '../types';
import { GoogleGenAI } from "@google/genai";

interface DietProps {
  meals: Meal[];
  onAdd: (meal: Meal) => void;
}

interface Recommendation {
  name: string;
  reason: string;
  recipe: string;
  tags: string[];
}

const Dietary: React.FC<DietProps> = ({ meals, onAdd }) => {
  const [mealForm, setMealForm] = useState({ description: '', protein: 0, sodium: 0, potassium: 0 });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const totalProtein = meals.reduce((sum, m) => sum + m.proteinG, 0);
  const totalSodium = meals.reduce((sum, m) => sum + m.sodiumMg, 0);
  const totalPotassium = meals.reduce((sum, m) => sum + m.potassiumMg, 0);

  // 获取 AI 推荐饮食
  const fetchDietaryRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "请作为肾内科营养师，为慢性肾炎患者推荐3种今日健康食物。要求包含食物名称、推荐理由（侧重低钠、低磷、优质低蛋白）、简易做法。以JSON格式返回，数组格式，字段：name, reason, recipe, tags(字符串数组)。",
        config: {
          responseMimeType: "application/json",
        }
      });
      const data = JSON.parse(response.text || '[]');
      setRecommendations(data);
    } catch (err) {
      console.error("无法获取推荐饮食", err);
      // 备选静态数据
      setRecommendations([
        { name: "清蒸鲈鱼", reason: "优质蛋白来源，磷含量适中，易于消化。", recipe: "葱姜铺底，大火蒸8分钟，少许低钠酱油即可。", tags: ["优质蛋白", "低脂"] },
        { name: "西葫芦炒蛋", reason: "低钾蔬菜，口感清爽，补充必需氨基酸。", recipe: "西葫芦切片，少油快炒，最后加入蛋碎。", tags: ["低钾", "清淡"] },
        { name: "冬瓜排骨汤", reason: "利尿消肿，汤头清甜，注意不要喝太多汤汁以控盐。", recipe: "冬瓜去皮切块，排骨焯水后小火慢炖，极少盐。", tags: ["利尿", "控钠"] }
      ]);
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    fetchDietaryRecommendations();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealForm.description) return;
    onAdd({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      description: mealForm.description,
      proteinG: mealForm.protein,
      sodiumMg: mealForm.sodium,
      potassiumMg: mealForm.potassium,
      calories: 0
    });
    setMealForm({ description: '', protein: 0, sodium: 0, potassium: 0 });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* AI 每日推荐板块 */}
      <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">
              <i className="fas fa-lightbulb"></i>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 tracking-tight">每日膳食灵感</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Recommended for Nephritis</p>
            </div>
          </div>
          <button 
            onClick={fetchDietaryRecommendations}
            disabled={loadingRecs}
            className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            <i className={`fas fa-sync-alt ${loadingRecs ? 'fa-spin' : ''}`}></i> 换一换
          </button>
        </div>
        
        <div className="p-5 overflow-x-auto custom-scrollbar flex gap-4">
          {loadingRecs ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="min-w-[280px] h-32 bg-slate-50 rounded-2xl animate-pulse"></div>
            ))
          ) : recommendations.map((rec, idx) => (
            <div key={idx} className="min-w-[280px] md:min-w-[320px] bg-indigo-50/40 border border-indigo-100/50 p-4 rounded-2xl flex flex-col group hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-black text-slate-800">{rec.name}</h4>
                <div className="flex gap-1">
                  {rec.tags.map(tag => (
                    <span key={tag} className="text-[8px] font-black bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">{tag}</span>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-3 line-clamp-2">
                <i className="fas fa-check-circle text-emerald-500 mr-1 text-[8px]"></i>
                {rec.reason}
              </p>
              <div className="mt-auto pt-3 border-t border-indigo-100/30">
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <i className="fas fa-mortar-pestle"></i> 简易做法
                </p>
                <p className="text-[10px] text-slate-600 font-bold leading-snug">{rec.recipe}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">今日营养摄入统计</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricBox label="蛋白质" value={totalProtein} unit="g" limit={60} color="amber" />
              <MetricBox label="钠" value={totalSodium} unit="mg" limit={2000} color="red" />
              <MetricBox label="钾" value={totalPotassium} unit="mg" limit={2000} color="indigo" />
              <MetricBox label="热量" value={meals.length * 400} unit="kcal" limit={2500} color="emerald" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">今日饮食记录</h3>
              <span className="text-[9px] text-slate-400 font-bold uppercase">{meals.length} 餐</span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {meals.slice().reverse().map(meal => (
                <div key={meal.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
                  <div className="overflow-hidden">
                    <p className="font-black text-slate-800 text-[11px] truncate">{meal.description}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex gap-2 text-[9px] font-black shrink-0">
                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">蛋: {meal.proteinG}g</span>
                    <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">钠: {meal.sodiumMg}mg</span>
                  </div>
                </div>
              ))}
              {meals.length === 0 && (
                <div className="text-center py-10 opacity-30 grayscale">
                  <i className="fas fa-utensils text-2xl mb-2"></i>
                  <p className="text-[10px] font-bold uppercase tracking-widest">暂无记录</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">记录新餐食</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">餐食内容</label>
              <input 
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                placeholder="例如：清炒白菜"
                value={mealForm.description}
                onChange={e => setMealForm({...mealForm, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">蛋白质 (g)</label>
                <input 
                  type="number"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm"
                  value={mealForm.protein || ''}
                  onChange={e => setMealForm({...mealForm, protein: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">钠 (mg)</label>
                <input 
                  type="number"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm"
                  value={mealForm.sodium || ''}
                  onChange={e => setMealForm({...mealForm, sodium: Number(e.target.value)})}
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all active:scale-95 mt-2"
            >
              添加记录
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const MetricBox = ({ label, value, unit, limit, color }: any) => {
  const percentage = Math.min((value / limit) * 100, 100);
  const colorClass = {
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
  }[color as 'amber' | 'red' | 'indigo' | 'emerald'];

  return (
    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-0.5">
        <span className="text-lg font-black text-slate-800">{value}</span>
        <span className="text-[8px] text-slate-400 font-bold uppercase">{unit}</span>
      </div>
      <div className="mt-2 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

export default Dietary;
