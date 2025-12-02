import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, User } from '../types';
import { Button } from './Button';
import { X, Sparkles, Calendar, User as UserIcon } from 'lucide-react';
import { analyzeTaskGap } from '../services/geminiService';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task?: Task | null;
  users: User[];
  currentUserId: string;
}

const statusLabels = {
  [TaskStatus.TODO]: '待办',
  [TaskStatus.IN_PROGRESS]: '进行中',
  [TaskStatus.DONE]: '已完成',
  [TaskStatus.BLOCKED]: '阻塞'
};

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task, users, currentUserId }) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    status: TaskStatus.TODO,
    planContent: '',
    actualContent: '',
    planHours: 0,
    actualHours: 0,
    deadline: new Date().toISOString().split('T')[0],
    assigneeId: ''
  });
  
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        deadline: task.deadline.split('T')[0]
      });
      setAnalysis("");
    } else {
      setFormData({
         title: '',
         status: TaskStatus.TODO,
         planContent: '',
         actualContent: '',
         planHours: 0,
         actualHours: 0,
         deadline: new Date().toISOString().split('T')[0],
         assigneeId: currentUserId
      });
      setAnalysis("");
    }
  }, [task, isOpen, currentUserId]);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeTaskGap(formData as Task);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: task?.id || Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date().toISOString(),
      updatedBy: currentUserId,
      deadline: new Date(formData.deadline!).toISOString(),
    } as Task);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
            {task ? '编辑任务' : '新建任务'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Top Row: Title & Meta */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-8">
                <label className="block text-sm font-medium text-slate-700 mb-1">任务标题</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例如：Q3 财务报表分析"
                />
              </div>
              <div className="col-span-4">
                 <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
                 <select
                   value={formData.status}
                   onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                   className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                 >
                   {Object.values(TaskStatus).map(s => (
                     <option key={s} value={s}>{statusLabels[s]}</option>
                   ))}
                 </select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
               <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">负责人</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <select
                      value={formData.assigneeId}
                      onChange={e => setFormData({ ...formData, assigneeId: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
               </div>
               <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">截止日期</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
               </div>
            </div>

            <hr className="border-slate-100" />

            {/* Split View: Plan vs Actual */}
            <div className="grid grid-cols-2 gap-6">
              {/* PLAN (Blue) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide">计划 (Plan)</h3>
                   <div className="flex items-center gap-2">
                     <label className="text-xs text-slate-500">预估工时</label>
                     <input
                        type="number"
                        min="0"
                        value={formData.planHours}
                        onChange={e => setFormData({ ...formData, planHours: Number(e.target.value) })}
                        className="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-blue-500"
                      />
                   </div>
                </div>
                <textarea
                  value={formData.planContent}
                  onChange={e => setFormData({ ...formData, planContent: e.target.value })}
                  placeholder="详细计划是什么？"
                  className="w-full h-40 p-3 bg-blue-50/30 border border-blue-100 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                ></textarea>
              </div>

              {/* ACTUAL (Green) */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide">实际 (Actual)</h3>
                   <div className="flex items-center gap-2">
                     <label className="text-xs text-slate-500">已用工时</label>
                     <input
                        type="number"
                        min="0"
                        value={formData.actualHours}
                        onChange={e => setFormData({ ...formData, actualHours: Number(e.target.value) })}
                        className="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-emerald-500"
                      />
                   </div>
                </div>
                <textarea
                  value={formData.actualContent}
                  onChange={e => setFormData({ ...formData, actualContent: e.target.value })}
                  placeholder="实际完成了什么？有何偏差？"
                  className="w-full h-40 p-3 bg-emerald-50/30 border border-emerald-100 rounded-md focus:ring-2 focus:ring-emerald-500 text-sm"
                ></textarea>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
               <div className="flex items-center justify-between mb-2">
                 <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                   <Sparkles className="w-4 h-4 text-purple-600" />
                   AI 偏差分析 (AI Deviation Analysis)
                 </h4>
                 <Button type="button" size="sm" variant="ghost" onClick={handleAnalyze} isLoading={isAnalyzing}>
                   分析差距
                 </Button>
               </div>
               {analysis ? (
                 <div className="text-sm text-slate-600 bg-white p-3 rounded border border-slate-100 prose prose-sm max-w-none">
                   {analysis}
                 </div>
               ) : (
                 <p className="text-xs text-slate-400 italic">
                   点击“分析差距”以生成基于计划与实际数据的风险评估。
                 </p>
               )}
            </div>

          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit}>保存任务</Button>
        </div>
      </div>
    </div>
  );
};