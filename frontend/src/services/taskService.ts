import { axiosInstance } from "./axiosService";

interface CreateTaskData {
  title: string;
  budget: number;
  actualCost: number;
  dueDate: string;
  budgetItem: string; // ID of the budget category
  weddingId: string;
}

interface TaskResponse {
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

export const createTask = async (
  data: CreateTaskData
): Promise<TaskResponse> => {
  const response = await axiosInstance.post<{
    status: string;
    data: TaskResponse;
  }>(`/api/tasks/${data.weddingId}`, data);
  return response.data.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await axiosInstance.delete(`/api/tasks/${taskId}`);
};

export const updateTaskDetails = async (
  taskId: string,
  data: Partial<CreateTaskData>
): Promise<TaskResponse> => {
  const response = await axiosInstance.put<{
    status: string;
    data: TaskResponse;
  }>(`/api/tasks/${taskId}`, data);
  return response.data.data;
};
