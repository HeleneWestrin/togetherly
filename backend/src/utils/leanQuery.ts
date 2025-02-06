import { Query } from "mongoose";

export const leanQuery = async <T>(query: Query<T, any>): Promise<T> => {
  try {
    return (await query.lean().exec()) as T;
  } catch (error) {
    console.error("Lean query execution error:", error);
    throw error;
  }
};
