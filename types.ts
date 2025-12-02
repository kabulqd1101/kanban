export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED'
}

export enum ViewMode {
  STATUS = 'STATUS',
  MEMBER = 'MEMBER'
}

export interface User {
  id: string;
  name: string;
  avatar: string; // URL
  role: 'Manager' | 'Contributor';
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string;
  status: TaskStatus;
  planContent: string;
  actualContent: string;
  planHours: number;
  actualHours: number; // Consumed
  deadline: string; // ISO Date string
  lastUpdated: string; // ISO Date string
  updatedBy: string; // User ID
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  totalPlanHours: number;
  totalActualHours: number;
}