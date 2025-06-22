export type TaskStatus = "todo" | "pending" | "inprogress" | "done" | "blocked";

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: User;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}
