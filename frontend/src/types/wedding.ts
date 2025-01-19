export interface ITask {
  _id: string;
  title: string;
  budget: number;
  actualCost: number;
  completed: boolean;
  dueDate?: string;
  budgetItem?: string;
  weddingId?: string;
}

export interface CreateTaskData {
  title: string;
  budget: number;
  actualCost: number;
  dueDate: string;
  budgetItem: string;
  weddingId: string;
}

export interface TaskResponse {
  _id: string;
  title: string;
  budget: number;
  actualCost: number;
  dueDate: string;
  completed: boolean;
  budgetItem: string;
  weddingId: string;
  createdAt: string;
  updatedAt: string;
}
