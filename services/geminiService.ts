
import { GoogleGenAI, Type } from "@google/genai";
import { VitalRecord, Meal, Medication } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIHealthInsights = async (
  vitals: VitalRecord[],
  meals: Meal[],
  meds: Medication[]
) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      请作为一名专业的肾内科专家，分析以下慢性肾炎患者的详细健康数据。
      最新体征：${JSON.stringify(vitals.slice(-5))}
      今日饮食：${JSON.stringify(meals)}
      当前用药：${JSON.stringify(meds)}
      提供中文报告：1.肾功能评估 2.并发症风险 3.饮食建议 4.预警提示。
    `,
  });
  return response.text;
};

// 智能分析检验报告
export const analyzeLabReport = async (base64Data: string, mimeType: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      { inlineData: { data: base64Data, mimeType } },
      {
        text: `你是一个专业的医学报告解析专家。请从这张检验报告中提取以下肾内科关键指标，返回 JSON。
        字段：bloodPressureSys, bloodPressureDia, weight, urineProtein, creatinine, uricAcid, eGFR, reportDate(YYYY-MM-DD)。`
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bloodPressureSys: { type: Type.NUMBER },
          bloodPressureDia: { type: Type.NUMBER },
          weight: { type: Type.NUMBER },
          urineProtein: { type: Type.STRING },
          creatinine: { type: Type.NUMBER },
          uricAcid: { type: Type.NUMBER },
          eGFR: { type: Type.NUMBER },
          reportDate: { type: Type.STRING },
        }
      }
    }
  });
  try { return JSON.parse(response.text || '{}'); } catch (e) { return null; }
};

// 新增：智能分析处方单
export const analyzePrescription = async (base64Data: string, mimeType: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      { inlineData: { data: base64Data, mimeType } },
      {
        text: `你是一个专业的药剂师。请从处方单（图片/PDF）中提取药物信息。
        需识别：药物名称、单次剂量、服用频次（如QD, BID, TID）。
        如果是中药，药名应包含核心方剂名，剂量为一贴的总量。
        如果是西药，药名包含规格。
        返回 JSON 数组，包含：name, dosage, frequency, type(chinese/western), prescriptionDate(YYYY-MM-DD)。`
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prescriptionDate: { type: Type.STRING },
          type: { type: Type.STRING },
          medications: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                dosage: { type: Type.STRING },
                frequency: { type: Type.STRING },
              },
              required: ["name", "dosage", "frequency"]
            }
          }
        }
      }
    }
  });
  try { return JSON.parse(response.text || '{}'); } catch (e) { return null; }
};
