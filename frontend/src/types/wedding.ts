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
  dueDate?: string;
  budgetItem: string;
  weddingId: string;
}

export interface TaskResponse {
  _id: string;
  title: string;
  budget: number;
  actualCost: number;
  dueDate?: string;
  completed: boolean;
  budgetItem: string;
  weddingId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Wedding {
  _id: string;
  slug: string;
  title: string;
  date: string;
  location: {
    venue: string;
    address: string;
    city: string;
    country: string;
  };
  couple: Array<{
    _id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  }>;
  budget?: {
    total: number;
    spent: number;
    allocated: Array<{
      _id: string;
      category: string;
      estimatedCost: number;
      spent: number;
      progress: number;
      tasks: Array<{
        _id: string;
        title: string;
        budget: number;
        actualCost: number;
        completed: boolean;
        dueDate?: string;
      }>;
    }>;
  };
}

export interface WeddingListItem
  extends Pick<Wedding, "_id" | "title" | "slug" | "date"> {
  location: Pick<Wedding["location"], "venue" | "city" | "country">;
  couple: Array<{
    profile: Pick<Wedding["couple"][0]["profile"], "firstName" | "lastName">;
  }>;
}
