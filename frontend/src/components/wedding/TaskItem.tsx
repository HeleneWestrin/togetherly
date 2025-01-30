import { useState } from "react";
import { NumericFormat } from "react-number-format";
import { Typography } from "../ui/Typography";
import FormLabel from "../ui/FormLabel";
import { Task, CreateTaskData, TaskResponse } from "../../types/wedding";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTask, updateTaskDetails } from "../../services/taskService";
import { Trash2, Edit2 } from "lucide-react";
import { Button } from "../ui/Button";
import SidePanel from "../ui/SidePanel";
import TaskForm from "./TaskForm";
import { useUIStore } from "../../stores/useUIStore";
import FormCheckbox from "../ui/FormCheckbox";

interface TaskItemProps {
  task: Task;
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
  const { activePanels, openPanel, closePanel } = useUIStore();
  const isEditPanelOpen =
    activePanels.editTask?.isOpen && activePanels.editTask.taskId === task._id;

  const handleOpenPanel = () => {
    updateTaskMutation.reset();
    openPanel("editTask", { isOpen: true, taskId: task._id });
  };
  const handleClosePanel = () => closePanel("editTask");

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
      handleClosePanel();
    },
  });

  return (
    <>
      <div className="flex items-center justify-between bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <FormCheckbox
            id={task.title}
            checked={task.completed}
            onChange={() => onEditTask(task._id)}
            size="large"
          />
          <div className="flex flex-col">
            <FormLabel
              htmlFor={task.title}
              className="mb-1"
            >
              {task.title}
            </FormLabel>
            <Typography
              element="p"
              styledAs="bodyExtraSmall"
              className="text-dark-600"
            >
              {task.budget > 0 && (
                <>
                  <NumericFormat
                    value={task.actualCost}
                    displayType={"text"}
                    thousandSeparator=" "
                    decimalSeparator="."
                    suffix=" kr"
                  />{" "}
                  /{" "}
                  <NumericFormat
                    value={task.budget}
                    displayType={"text"}
                    thousandSeparator=" "
                    decimalSeparator="."
                    suffix=" kr"
                  />
                </>
              )}
            </Typography>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="icon"
            size="icon"
            tooltip="Edit task"
            onClick={handleOpenPanel}
          >
            <Edit2 className="h-4 w-4" />
            <span className="sr-only">Edit task</span>
          </Button>

          <Button
            variant="icon"
            size="icon"
            tooltip="Delete task"
            onClick={() => deleteTaskMutation.mutate(task._id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete task</span>
          </Button>
        </div>
      </div>

      <SidePanel
        isOpen={isEditPanelOpen || false}
        onClose={handleClosePanel}
        title="Edit task"
      >
        <TaskForm
          task={task}
          budgetItemId={budgetItemId}
          weddingId={weddingId}
          onSubmit={(data) =>
            updateTaskMutation.mutateAsync({ taskId: task._id, data })
          }
          onCancel={handleClosePanel}
          isError={updateTaskMutation.isError}
          error={updateTaskMutation.error ?? undefined}
        />
      </SidePanel>
    </>
  );
};

export default TaskItem;
