import React, { useState } from 'react';
import { USERS, MOCK_TASKS } from './constants';
import { Task, TaskStatus, ViewMode, User } from './types';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { Button } from './components/Button';
import { Analytics } from './components/Analytics';
import { StandupOverlay } from './components/StandupOverlay';
import { generateWeeklyReport } from './services/geminiService';
import { 
  Layout, 
  Plus, 
  Search, 
  Filter, 
  BarChart2, 
  Users, 
  Columns, 
  Presentation,
  FileText,
  Bell,
  Settings,
  ChevronLeft
} from 'lucide-react';

const statusLabels = {
  [TaskStatus.TODO]: '待办',
  [TaskStatus.IN_PROGRESS]: '进行中',
  [TaskStatus.DONE]: '已完成',
  [TaskStatus.BLOCKED]: '阻塞'
};

const App: React.FC = () => {
  // State
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.MEMBER); // Default to member view
  const [activeTab, setActiveTab] = useState<'board' | 'analytics'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser] = useState<User>(USERS[0]); // Simulating logged in user (Manager)
  
  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isStandupOpen, setIsStandupOpen] = useState(false);
  
  // Reporting State
  const [reportResult, setReportResult] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Handlers
  const handleSaveTask = (task: Task) => {
    if (tasks.find(t => t.id === task.id)) {
      setTasks(tasks.map(t => t.id === task.id ? task : t));
    } else {
      setTasks([...tasks, task]);
    }
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    setEditingTask(null);
    setIsTaskModalOpen(false);
  };

  const openNewTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    const report = await generateWeeklyReport(tasks, USERS);
    setReportResult(report);
    setIsGeneratingReport(false);
  };

  // Derived State
  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.planContent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-16 lg:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <span className="hidden lg:block ml-3 font-bold text-white tracking-wide">Kanban Pro</span>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('board')}
            className={`w-full flex items-center p-2 rounded-lg transition-colors ${activeTab === 'board' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}
          >
            <Columns className="w-5 h-5 min-w-[20px]" />
            <span className="hidden lg:block ml-3 font-medium">看板 (Board)</span>
          </button>
          
          <button 
             onClick={() => setActiveTab('analytics')}
             className={`w-full flex items-center p-2 rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}
          >
            <BarChart2 className="w-5 h-5 min-w-[20px]" />
            <span className="hidden lg:block ml-3 font-medium">统计分析 (Analytics)</span>
          </button>

          <div className="pt-4 mt-4 border-t border-slate-800 hidden lg:block">
            <h3 className="text-xs font-semibold uppercase text-slate-500 mb-2 px-2">团队工具</h3>
            <button 
              onClick={() => setIsStandupOpen(true)}
              className="w-full flex items-center p-2 rounded-lg hover:bg-slate-800 text-emerald-400"
            >
              <Presentation className="w-5 h-5 min-w-[20px]" />
              <span className="ml-3 font-medium">站会模式 (Standup)</span>
            </button>
            <button 
              onClick={handleGenerateReport}
              className="w-full flex items-center p-2 rounded-lg hover:bg-slate-800 text-purple-400"
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? (
                 <div className="w-5 h-5 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
              ) : (
                 <FileText className="w-5 h-5 min-w-[20px]" />
              )}
              <span className="ml-3 font-medium">自动周报 (Report)</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
             <img src={currentUser.avatar} alt="Me" className="w-8 h-8 rounded-full border border-slate-600" />
             <div className="hidden lg:block overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-500 truncate">{currentUser.role}</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            {activeTab === 'board' && (
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode(ViewMode.MEMBER)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === ViewMode.MEMBER ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  按成员
                </button>
                <button 
                  onClick={() => setViewMode(ViewMode.STATUS)}
                   className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === ViewMode.STATUS ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  按状态
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索任务..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <Button onClick={openNewTask} className="gap-2">
              <Plus className="w-4 h-4" />
              新建任务
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden bg-slate-50/50 relative">
          
          {/* View: Analytics */}
          {activeTab === 'analytics' && <Analytics tasks={tasks} users={USERS} />}

          {/* View: Kanban Board */}
          {activeTab === 'board' && (
            <div className="h-full p-6 overflow-y-auto">
              
              {/* MEMBER VIEW (Swimlanes) */}
              {viewMode === ViewMode.MEMBER && (
                <div className="space-y-6">
                  {USERS.map(user => {
                    const userTasks = filteredTasks.filter(t => t.assigneeId === user.id);
                    const hoursLeft = userTasks.reduce((acc, t) => acc + (t.planHours - t.actualHours), 0);
                    
                    return (
                      <div key={user.id} className="bg-slate-100/50 rounded-xl border border-slate-200 overflow-hidden">
                        {/* Swimlane Header */}
                        <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                          <div className="flex items-center gap-3">
                            <img src={user.avatar} className="w-8 h-8 rounded-full" alt={user.name} />
                            <div>
                              <h3 className="font-semibold text-slate-800">{user.name}</h3>
                              <p className="text-xs text-slate-500">{userTasks.length} 个任务</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                             {/* Mini Workload Indicator */}
                             <div className="flex items-center gap-2 text-xs font-medium">
                                <span className="text-slate-500">净工作量 (Net Workload):</span>
                                <span className={`px-2 py-1 rounded ${hoursLeft < 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                   {hoursLeft > 0 ? `剩 ${hoursLeft}h` : `超 ${Math.abs(hoursLeft)}h`}
                                </span>
                             </div>
                          </div>
                        </div>
                        
                        {/* Swimlane Content */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                           {userTasks.length > 0 ? (
                             userTasks.map(task => (
                               <TaskCard 
                                 key={task.id} 
                                 task={task} 
                                 onClick={() => openEditTask(task)} 
                               />
                             ))
                           ) : (
                             <div className="col-span-full py-8 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                               暂无分配任务
                             </div>
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* STATUS VIEW (Columns) */}
              {viewMode === ViewMode.STATUS && (
                <div className="flex h-full gap-6 min-w-[1000px]">
                  {Object.values(TaskStatus).map(status => {
                     const statusTasks = filteredTasks.filter(t => t.status === status);
                     return (
                       <div key={status} className="flex-1 flex flex-col bg-slate-100/50 rounded-xl border border-slate-200 h-full max-h-full">
                          <div className="p-3 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center sticky top-0">
                            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide px-2">
                              {statusLabels[status]}
                            </h3>
                            <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
                              {statusTasks.length}
                            </span>
                          </div>
                          <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                             {statusTasks.map(task => (
                               <TaskCard 
                                 key={task.id} 
                                 task={task} 
                                 assignee={USERS.find(u => u.id === task.assigneeId)}
                                 onClick={() => openEditTask(task)}
                                 compact
                               />
                             ))}
                             <button 
                               onClick={openNewTask}
                               className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors text-sm font-medium"
                             >
                               + 添加任务
                             </button>
                          </div>
                       </div>
                     )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Report Viewer Overlay */}
          {reportResult && (
             <div className="absolute inset-0 bg-white/95 z-30 p-8 overflow-y-auto backdrop-blur-sm">
                <div className="max-w-3xl mx-auto">
                   <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-slate-900">每周团队周报</h2>
                      <Button variant="secondary" onClick={() => setReportResult(null)}>关闭报告</Button>
                   </div>
                   <div className="prose prose-slate lg:prose-lg bg-white p-8 rounded-xl shadow-xl border border-slate-200">
                      <pre className="whitespace-pre-wrap font-sans">{reportResult}</pre>
                   </div>
                </div>
             </div>
          )}

        </div>
      </main>

      {/* Standup Overlay */}
      <StandupOverlay 
        isOpen={isStandupOpen} 
        onClose={() => setIsStandupOpen(false)} 
        users={USERS} 
        tasks={tasks}
      />

      {/* Task Edit/Create Modal */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSave={handleSaveTask}
        task={editingTask}
        users={USERS}
        currentUserId={currentUser.id}
      />
    </div>
  );
};

export default App;