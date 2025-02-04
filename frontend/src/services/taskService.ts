import { axiosInstance } from "./axiosService";

interface CreateTaskData {
  title: string;
  budget: number;
  actualCost: number;
  dueDate?: string;
  budgetCategoryId: string;
  weddingId: string;
}

interface TaskResponse {
  _id: string;
  title: string;
  budget: number;
  actualCost: number;
  dueDate?: string;
  completed: boolean;
  budgetCategoryId: string;
  weddingId: string;
  createdAt: string;
  updatedAt: string;
}

export const createTask = async (
  data: CreateTaskData
): Promise<TaskResponse> => {
  const { weddingId, ...createData } = data;
  const response = await axiosInstance.post<{
    status: string;
    data: TaskResponse;
  }>(`/api/tasks/${weddingId}`, createData);
  return response.data.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await axiosInstance.delete(`/api/tasks/${taskId}`);
};

export const updateTaskDetails = async (
  taskId: string,
  data: Partial<CreateTaskData>
): Promise<TaskResponse> => {
  const { weddingId, ...updateData } = data;
  const response = await axiosInstance.put<{
    status: string;
    data: TaskResponse;
  }>(`/api/tasks/${taskId}`, updateData);
  return response.data.data;
};
