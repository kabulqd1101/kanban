import { GoogleGenAI } from "@google/genai";
import { Task, User } from '../types';

// Safely initialize the AI client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateWeeklyReport = async (tasks: Task[], users: User[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "错误：缺少 API Key。请先选择 Key。";

  const tasksJson = JSON.stringify(tasks.map(t => ({
    title: t.title,
    assignee: users.find(u => u.id === t.assigneeId)?.name || '未知',
    status: t.status,
    plan: t.planContent,
    actual: t.actualContent,
    gap: t.planHours - t.actualHours
  })));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        你是一名敏捷项目管理助手。
        请分析本周的任务数据，并生成一份简洁的【团队周报】。
        
        报告必须使用中文（简体）撰写，并包含以下部分：
        1. 执行摘要 (完成率、主要阻塞点)。
        2. 个人高光时刻 (每个人取得了什么成就？)。
        3. 风险评估 (哪些任务受阻或与计划偏差较大？)。
        
        任务数据:
        ${tasksJson}
        
        请输出清晰的 Markdown 格式。
      `,
    });
    return response.text || "未生成报告。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "因 API 错误无法生成报告。";
  }
};

export const analyzeTaskGap = async (task: Task): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "错误：缺少 API Key。";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        请分析该任务“计划”与“实际”之间的偏差。
        请用中文（简体）提供 1 句风险评估 和 1 句改进建议。
        
        任务标题: ${task.title}
        计划内容: ${task.planContent}
        实际产出: ${task.actualContent}
        计划工时: ${task.planHours}
        已用工时: ${task.actualHours}
      `,
    });
    return response.text || "暂无分析结果。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "无法分析任务。";
  }
};