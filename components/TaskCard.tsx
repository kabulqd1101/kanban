import React, { useMemo } from 'react';
import { Task, TaskStatus, User } from '../types';
import { AlertTriangle, Clock, PlayCircle, CheckCircle, XCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  assignee?: User;
  onClick: () => void;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, assignee, onClick, compact }) => {
  const isOverdue = new Date(task.deadline) < new Date() && task.status !== TaskStatus.DONE;
  const progress = Math.min(100, (task.actualHours / (task.planHours || 1)) * 100);
  const remainingHours = task.planHours - task.actualHours;
  
  // Progress color logic: Green if on track, Red if over budget
  const progressColor = remainingHours < 0 ? 'bg-red-500' : 'bg-emerald-500';

  const statusIcons = {
    [TaskStatus.TODO]: <Clock className="w-4 h-4 text-slate-400" />,
    [TaskStatus.IN_PROGRESS]: <PlayCircle className="w-4 h-4 text-blue-500" />,
    [TaskStatus.DONE]: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    [TaskStatus.BLOCKED]: <XCircle className="w-4 h-4 text-red-500" />
  };

  const statusLabels = {
    [TaskStatus.TODO]: '待办',
    [TaskStatus.IN_PROGRESS]: '进行中',
    [TaskStatus.DONE]: '已完成',
    [TaskStatus.BLOCKED]: '阻塞'
  };

  return (
    <div 
      onClick={onClick}
      className={`
        group relative bg-white rounded-lg border border-slate-200 shadow-sm 
        hover:shadow-md hover:border-blue-300 transition-all cursor-pointer overflow-hidden
        ${task.status === TaskStatus.BLOCKED ? 'border-l-4 border-l-red-500' : ''}
        ${isOverdue ? 'ring-1 ring-red-100' : ''}
      `}
    >
      <div className="p-3">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {statusIcons[task.status]}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              task.status === TaskStatus.BLOCKED ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {statusLabels[task.status]}
            </span>
          </div>
          {assignee && (
            <img 
              src={assignee.avatar} 
              alt={assignee.name} 
              className="w-6 h-6 rounded-full border border-white shadow-sm"
              title={assignee.name}
            />
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-slate-800 line-clamp-2 mb-3 leading-snug">
          {task.title}
        </h3>

        {/* Plan vs Actual Snippets */}
        {!compact && (
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="bg-blue-50/50 p-1.5 rounded border border-blue-100">
              <span className="text-blue-700 font-semibold block text-[10px] uppercase tracking-wider mb-0.5">计划 Plan</span>
              <p className="text-slate-600 line-clamp-2">{task.planContent || '暂无计划详情'}</p>
            </div>
            <div className={`bg-emerald-50/50 p-1.5 rounded border border-emerald-100 ${remainingHours < 0 ? 'bg-red-50 border-red-100' : ''}`}>
               <span className={`${remainingHours < 0 ? 'text-red-700' : 'text-emerald-700'} font-semibold block text-[10px] uppercase tracking-wider mb-0.5`}>实际 Actual</span>
              <p className="text-slate-600 line-clamp-2">{task.actualContent || '暂无进展更新'}</p>
            </div>
          </div>
        )}

        {/* Footer Metrics */}
        <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-50">
          <div className="flex items-center gap-1">
            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${progressColor} transition-all duration-500`} style={{ width: `${progress}%` }}></div>
            </div>
            <span className={remainingHours < 0 ? 'text-red-600 font-bold' : ''}>
              {remainingHours >= 0 ? `剩 ${remainingHours}h` : `超 ${Math.abs(remainingHours)}h`}
            </span>
          </div>
          
          {isOverdue && (
            <div className="flex items-center text-red-600 font-medium">
              <AlertTriangle className="w-3 h-3 mr-1" />
              <span>已逾期</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};