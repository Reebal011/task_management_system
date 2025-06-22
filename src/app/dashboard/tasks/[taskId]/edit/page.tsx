/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "@/lib/axios";
import { Task } from "@/types/task";
import { User } from "@/types/user";

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

  const [task, setTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTask = async () => {
    try {
      const res = await API.get(`/tasks/${taskId}`);
      setTask(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch task");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch {
      console.warn("Could not load users");
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchTask();
      fetchUsers();
    }
  }, [taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    try {
      const res = await API.patch(`/tasks/${taskId}`, {
        title: task.title,
        description: task.description,
        assignedToId: task.assignedTo.id,
        status: task.status,
      });
      console.log("handleSubmit", res);
      router.push("/dashboard/tasks");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update task");
    }
  };

  const handleAssigneeChange = (id: string) => {
    console.log("id", id);
    const selectedUser = users.find((u) => u.id === id);
    if (!selectedUser) return; // avoid undefined assignment
    console.log("selectedUser", selectedUser);
    setTask({ ...task, assignedTo: selectedUser as User });
  };

  if (loading) return <p className="text-black">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4 text-black">Edit Task</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {task && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            className="w-full border p-2 rounded text-black border-gray-400"
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            required
          />
          <textarea
            className="w-full border p-2 rounded text-black border-gray-400"
            value={task.description}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
            required
          />

          <select
            className="w-full border p-2 rounded text-black border-gray-400"
            value={task.assignedTo?.id || ""}
            onChange={(e) => handleAssigneeChange(e.target.value)}
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} | {user.role}
              </option>
            ))}
          </select>

          <select
            className="w-full border p-2 rounded text-black border-gray-400"
            value={task.status}
            onChange={(e) =>
              setTask({ ...task, status: e.target.value as TaskStatus })
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
