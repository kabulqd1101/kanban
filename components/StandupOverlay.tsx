import React, { useState, useEffect } from 'react';
import { User, Task, TaskStatus } from '../types';
import { X, ChevronRight, ChevronLeft, Mic } from 'lucide-react';
import { TaskCard } from './TaskCard';

interface StandupOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  tasks: Task[];
}

export const StandupOverlay: React.FC<StandupOverlayProps> = ({ isOpen, onClose, users, tasks }) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  
  // Reset index when opened
  useEffect(() => {
    if (isOpen) setCurrentUserIndex(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentUser = users[currentUserIndex];
  const userTasks = tasks.filter(t => t.assigneeId === currentUser.id);
  
  // Group tasks for the view
  const doneTasks = userTasks.filter(t => t.status === TaskStatus.DONE);
  const inProgressTasks = userTasks.filter(t => t.status === TaskStatus.IN_PROGRESS);
  const blockedTasks = userTasks.filter(t => t.status === TaskStatus.BLOCKED);

  const nextUser = () => {
    if (currentUserIndex < users.length - 1) setCurrentUserIndex(p => p + 1);
  };

  const prevUser = () => {
    if (currentUserIndex > 0) setCurrentUserIndex(p => p - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
          <h1 className="text-2xl font-bold tracking-tight">每日晨会 (Daily Standup)</h1>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: User Profile & Navigation */}
        <div className="w-1/4 bg-slate-800 p-8 flex flex-col items-center justify-center border-r border-slate-700 relative">
           {/* Navigation Arrows */}
           <button 
             onClick={prevUser} 
             disabled={currentUserIndex === 0}
             className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-700 rounded-full disabled:opacity-20"
           >
             <ChevronLeft className="w-8 h-8" />
           </button>
           <button 
             onClick={nextUser} 
             disabled={currentUserIndex === users.length - 1}
             className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-700 rounded-full disabled:opacity-20"
           >
             <ChevronRight className="w-8 h-8" />
           </button>

           <div className="relative">
             <div className="w-32 h-32 rounded-full border-4 border-blue-500 overflow-hidden mb-6 shadow-xl shadow-blue-500/20">
               <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
             </div>
             <div className="absolute bottom-6 right-0 bg-blue-600 p-2 rounded-full border-4 border-slate-800">
               <Mic className="w-4 h-4 text-white" />
             </div>
           </div>
           
           <h2 className="text-3xl font-bold mb-2 text-center">{currentUser.name}</h2>
           <p className="text-slate-400 text-lg">{currentUser.role}</p>

           <div className="mt-12 w-full grid grid-cols-3 gap-4 text-center">
             <div className="bg-slate-700/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-emerald-400">{doneTasks.length}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">已完成</div>
             </div>
             <div className="bg-slate-700/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{inProgressTasks.length}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">进行中</div>
             </div>
             <div className="bg-slate-700/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{blockedTasks.length}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">阻塞</div>
             </div>
           </div>
        </div>

        {/* Right: Tasks Swimlane for User */}
        <div className="flex-1 bg-slate-900 p-8 overflow-y-auto">
          <div className="grid grid-cols-3 gap-8 h-full">
            {/* Column 1: What I did (Done) */}
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-emerald-400 font-semibold mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                近期完成
              </h3>
              <div className="space-y-4">
                {doneTasks.map(task => (
                  <TaskCard key={task.id} task={task} onClick={() => {}} />
                ))}
                {doneTasks.length === 0 && <p className="text-slate-600 text-center py-10">暂无已完成任务。</p>}
              </div>
            </div>

            {/* Column 2: What I'm doing (In Progress) */}
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-blue-400 font-semibold mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                进行中
              </h3>
              <div className="space-y-4">
                {inProgressTasks.map(task => (
                  <TaskCard key={task.id} task={task} onClick={() => {}} />
                ))}
                {inProgressTasks.length === 0 && <p className="text-slate-600 text-center py-10">暂无进行中的任务。</p>}
              </div>
            </div>

            {/* Column 3: Blockers */}
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
               <h3 className="text-red-400 font-semibold mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                阻塞 / 风险
              </h3>
              <div className="space-y-4">
                {blockedTasks.map(task => (
                  <TaskCard key={task.id} task={task} onClick={() => {}} />
                ))}
                {blockedTasks.length === 0 && <p className="text-slate-600 text-center py-10">无阻塞问题。</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};