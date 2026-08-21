export type Task = {
  id: string;
  title: string;
  done: boolean;
};

export type Goal = {
  id: string;
  title: string;
  color: string;      // planet color
  progress: number;   // 0–100
  tasks: Task[];
};