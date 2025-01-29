interface OfflineTask {
  taskId: string;
  completed: boolean;
  timestamp: number;
}

const OFFLINE_TASKS_KEY = "offline_tasks";

export const offlineStorage = {
  saveTask(taskId: string, completed: boolean) {
    const offlineTasks = this.getTasks();
    offlineTasks.push({
      taskId,
      completed,
      timestamp: Date.now(),
    });
    localStorage.setItem(OFFLINE_TASKS_KEY, JSON.stringify(offlineTasks));
  },

  getTasks(): OfflineTask[] {
    const tasks = localStorage.getItem(OFFLINE_TASKS_KEY);
    return tasks ? JSON.parse(tasks) : [];
  },

  clearTasks() {
    localStorage.removeItem(OFFLINE_TASKS_KEY);
  },

  async syncTasks() {
    const tasks = this.getTasks();
    if (tasks.length === 0) return;

    try {
      await axiosInstance.patch("/api/tasks/batch", {
        updates: tasks.map(({ taskId, completed }) => ({ taskId, completed })),
      });
      this.clearTasks();
    } catch (error) {
      console.error("Failed to sync offline tasks:", error);
    }
  },
};
