import { Typography } from "../ui/Typography";
import FormLabel from "../ui/FormLabel";
import { ITask } from "../../types/wedding";

interface TaskItemProps {
  task: ITask;
  onEditTask: (taskId: string) => void;
  tabIndex?: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEditTask, tabIndex }) => {
  return (
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
    </div>
  );
};

export default TaskItem;
