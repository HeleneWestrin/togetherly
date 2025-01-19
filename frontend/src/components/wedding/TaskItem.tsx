import { useState } from "react";
import { Typography } from "../ui/Typography";
import FormLabel from "../ui/FormLabel";
import { ITask, CreateTaskData, TaskResponse } from "../../types/wedding";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTask, updateTaskDetails } from "../../services/taskService";
import { Trash2, Edit } from "lucide-react";
import { Button } from "../ui/Button";
import SidePanel from "../ui/SidePanel";
import TaskForm from "./TaskForm";

interface TaskItemProps {
  task: ITask;
  onEditTask: (taskId: string) => void;
  tabIndex?: number;
  budgetItemId: string;
  weddingId: string;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onEditTask,
  tabIndex,
  budgetItemId,
  weddingId,
}) => {
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding"] });
    },
  });

  const updateTaskMutation = useMutation<
    TaskResponse,
    Error,
    { taskId: string; data: Partial<CreateTaskData> }
  >({
    mutationFn: ({ taskId, data }) => updateTaskDetails(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding"] });
      setIsEditPanelOpen(false);
    },
  });

  return (
    <>
      <div className="flex items-center justify-between bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            title={task.title}
            id={task.title}
            checked={task.completed}
            className="w-6 h-6 accent-pink-600"
            onChange={() => onEditTask(task._id)}
            tabIndex={tabIndex}
          />
          <div className="flex flex-col">
            <FormLabel
              htmlFor={task.title}
              className="mb-0"
            >
              {task.title}
            </FormLabel>
            <Typography
              element="p"
              styledAs="bodyExtraSmall"
              className="text-dark-600"
            >
              {task.actualCost.toLocaleString()} kr /{" "}
              {task.budget.toLocaleString()} kr
            </Typography>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="icon"
            onClick={() => setIsEditPanelOpen(true)}
            className="text-dark-700 hover:text-dark-950"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit task</span>
          </Button>
          <Button
            variant="icon"
            onClick={() => deleteTaskMutation.mutate(task._id)}
            className="text-dark-700 hover:text-dark-950"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete task</span>
          </Button>
        </div>
      </div>

      <SidePanel
        isOpen={isEditPanelOpen}
        onClose={() => setIsEditPanelOpen(false)}
        title={`Edit task: ${task.title}`}
      >
        <TaskForm
          task={task}
          category=""
          budgetItemId={budgetItemId}
          weddingId={weddingId}
          onSubmit={(data) =>
            updateTaskMutation.mutateAsync({ taskId: task._id, data })
          }
          onCancel={() => setIsEditPanelOpen(false)}
          isError={updateTaskMutation.isError}
          error={updateTaskMutation.error ?? undefined}
        />
      </SidePanel>
    </>
  );
};

export default TaskItem;
