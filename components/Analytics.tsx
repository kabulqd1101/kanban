import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Task, User, TaskStatus } from '../types';

interface AnalyticsProps {
  tasks: Task[];
  users: User[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ tasks, users }) => {
  
  // Calculate Workload (Plan vs Actual hours per user)
  const workloadData = users.map(user => {
    const userTasks = tasks.filter(t => t.assigneeId === user.id);
    return {
      name: user.name.split(' ')[0],
      plan: userTasks.reduce((acc, t) => acc + t.planHours, 0),
      actual: userTasks.reduce((acc, t) => acc + t.actualHours, 0),
    };
  });

  // Calculate Status Distribution
  const statusData = [
    { name: '待办', value: tasks.filter(t => t.status === TaskStatus.TODO).length, color: '#94a3b8' },
    { name: '进行中', value: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length, color: '#3b82f6' },
    { name: '已完成', value: tasks.filter(t => t.status === TaskStatus.DONE).length, color: '#10b981' },
    { name: '阻塞', value: tasks.filter(t => t.status === TaskStatus.BLOCKED).length, color: '#ef4444' },
  ];

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto">
      
      {/* Workload Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">工作量分析 (小时)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workloadData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend iconType="circle" />
              <Bar dataKey="plan" name="计划工时" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="实际工时" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">任务状态分布</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap / Burnup placeholder */}
      <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
         <h3 className="text-lg font-semibold text-slate-800 mb-4">冲刺健康度 (Sprint Health)</h3>
         <div className="w-full bg-slate-50 h-32 rounded flex items-center justify-center text-slate-400">
            <p>本周冲刺始于 10月23日。计划 12 个任务，已完成 5 个。</p>
         </div>
         <div className="mt-4 flex gap-4">
            <div className="flex-1 bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{Math.round((tasks.filter(t => t.status === TaskStatus.DONE).length / tasks.length) * 100)}%</div>
                <div className="text-xs text-blue-600 font-medium">完成率 (Completion Rate)</div>
            </div>
            <div className="flex-1 bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{tasks.filter(t => t.status === TaskStatus.BLOCKED).length}</div>
                <div className="text-xs text-red-600 font-medium">阻塞任务 (Blockers)</div>
            </div>
            <div className="flex-1 bg-emerald-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-emerald-700">
                    {workloadData.reduce((acc, curr) => acc + (curr.plan - curr.actual), 0)}h
                </div>
                <div className="text-xs text-emerald-600 font-medium">剩余工时预算 (Remaining Budget)</div>
            </div>
         </div>
      </div>

    </div>
  );
};