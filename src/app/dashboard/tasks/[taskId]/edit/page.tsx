/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import API from "@/lib/axios";
import { User } from "@/types/task";
import { useState, useEffect } from "react";
import { Task } from "@/types/task";

export enum TaskStatus {
  TODO = "todo",
  PENDING = "pending",
  IN_PROGRESS = "inprogress",
  DONE = "done",
  BLOCKED = "blocked",
}

export default function EditTaskPage() {
  const { taskId } = useParams();
  const router = useRouter();

  const [error, setError] = useState("");
  const [taskState, setTaskState] = useState<Task | null>(null);
  const [usersState, setUsersState] = useState<User[]>([]);

  const queryClient = useQueryClient();

  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const res = await API.get(`/tasks/${taskId}`);
      return res.data;
    },
    enabled: !!taskId,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await API.get("/users");
      return res.data as User[];
    },
  });

  useEffect(() => {
    if (task && !taskState) setTaskState(task);
  }, [task, taskState]);

  useEffect(() => {
    if (users.length > 0 && usersState.length === 0) setUsersState(users);
  }, [users, usersState]);

  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: any) => {
      const res = await API.patch(`/tasks/${taskId}`, updatedTask);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      router.push("/dashboard/tasks");
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || "Failed to update task");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskState) return;
    updateTaskMutation.mutate({
      title: taskState.title,
      description: taskState.description,
      assignedToId: taskState.assignedTo.id,
      status: taskState.status,
    });
  };

  const handleAssigneeChange = (id: string) => {
    if (!taskState) return;
    const selectedUser = usersState.find((u: User) => u.id === id);
    if (!selectedUser) return;
    setTaskState({ ...taskState, assignedTo: { ...selectedUser } });
  };

  if (taskLoading || usersLoading || !taskState)
    return <p className="text-black">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4 text-black">Edit Task</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {taskState && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            className="w-full border p-2 rounded text-black border-gray-400"
            value={taskState.title}
            onChange={(e) =>
              setTaskState({ ...taskState, title: e.target.value })
            }
            required
          />
          <textarea
            className="w-full border p-2 rounded text-black border-gray-400"
            value={taskState.description}
            onChange={(e) =>
              setTaskState({ ...taskState, description: e.target.value })
            }
            required
          />

          <select
            className="w-full border p-2 rounded text-black border-gray-400"
            value={taskState.assignedTo?.id || ""}
            onChange={(e) => handleAssigneeChange(e.target.value)}
          >
            <option value="">Unassigned</option>
            {usersState.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} | {user.role}
              </option>
            ))}
          </select>

          <select
            className="w-full border p-2 rounded text-black border-gray-400"
            value={taskState.status}
            onChange={(e) =>
              setTaskState({
                ...taskState,
                status: e.target.value as TaskStatus,
              })
            }
          >
            <option value={TaskStatus.TODO}>To Do</option>
            <option value={TaskStatus.PENDING}>Pending</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.DONE}>Done</option>
            <option value={TaskStatus.BLOCKED}>Blocked</option>
          </select>

          <button
            type="submit"
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
}
