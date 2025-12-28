
import React, { useState, useEffect } from 'react';
import { AppState } from '../types';
import { getAIHealthInsights } from '../services/geminiService';

interface AIProps {
  state: AppState;
}

const AIInsights: React.FC<AIProps> = ({ state }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    if (state.vitals.length === 0) {
      setInsight("请先记录一些体征数据，以便获取个性化的 AI 分析。");
      return;
    }
    setLoading(true);
    try {
      const res = await getAIHealthInsights(state.vitals, state.meals, state.medications);
      setInsight(res || "暂时无法生成洞察建议。");
    } catch (err) {
      setInsight("连接 AI 服务时出错，请检查您的 API 密钥配置。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-indigo-700 to-violet-800 p-10 rounded-3xl shadow-2xl text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <i className="fas fa-brain text-2xl"></i>
            </div>
            <h2 className="text-3xl font-bold">智能肾脏健康洞察</h2>
          </div>
          <p className="text-indigo-100 max-w-2xl text-lg leading-relaxed">
            AI 引擎将根据您的血压趋势、尿蛋白情况及饮食习惯，提供专业的肾内科健康指引。
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
          <i className="fas fa-microchip text-[120px]"></i>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">正在深度分析您的健康数据...</p>
          </div>
        ) : insight ? (
          <div className="w-full prose prose-slate max-w-none">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 m-0">个性化分析报告</h3>
              <button 
                onClick={fetchInsights}
                className="text-indigo-600 font-bold hover:underline flex items-center gap-2"
              >
                <i className="fas fa-sync-alt text-sm"></i> 重新分析
              </button>
            </div>
            <div className="whitespace-pre-wrap text-slate-700 leading-loose bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
              {insight}
            </div>
            <div className="mt-8 p-4 bg-amber-50 rounded-xl flex items-start gap-4">
              <i className="fas fa-info-circle text-amber-500 mt-1"></i>
              <p className="text-sm text-amber-800 leading-relaxed italic">
                <strong>免责声明：</strong> AI 洞察建议仅供参考，不能替代专业的医疗诊断。任何治疗方案的调整请务必咨询您的主治医师。
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-slate-400 mb-4">点击下方按钮开始分析</p>
            <button 
              onClick={fetchInsights}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
            >
              运行 AI 分析
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
