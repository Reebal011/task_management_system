/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import Link from "next/link";
import useSocket from "@/hooks/useSocket";
import { useQuery } from "@tanstack/react-query";
import API from "@/lib/axios";
import { isAdmin } from "@/utils/auth";

const statusColors = {
  todo: "text-blue-500",
  pending: "text-yellow-500",
  inprogress: "text-purple-500",
  done: "text-green-600",
  blocked: "text-red-600",
} as const;
const statusLabels = {
  todo: "To Do",
  pending: "Pending",
  inprogress: "In Progress",
  done: "Done",
  blocked: "Blocked",
} as const;

export default function TaskListPage() {
  const socket = useSocket();
  const isUserAdmin = isAdmin();

  const {
    data: tasks = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await API.get("/tasks");
      return res.data;
    },
  });

  const deleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await API.delete(`/tasks/${id}`);
      console.log("deleteTask", res);
      refetch();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete task");
    }
  };

  // 🔁 WebSocket updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (event: string) => {
      console.log(`Real-time update received: ${event}`);
      refetch();
    };

    socket.on("taskCreated", handleUpdate);
    socket.on("taskUpdated", handleUpdate);
    socket.on("taskDeleted", handleUpdate);

    return () => {
      socket.off("taskCreated", handleUpdate);
      socket.off("taskUpdated", handleUpdate);
      socket.off("taskDeleted", handleUpdate);
    };
  }, [socket, refetch]);

  if (isLoading) return <p>Loading tasks...</p>;
  if (isError) return <p className="text-red-500">Failed to load tasks</p>;
  if (tasks.length === 0)
    return (
      <div className="flex justify-between">
        {isUserAdmin && (
          <Link
            href="/dashboard/tasks/create"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
          >
            ➕ Create New Task
          </Link>
        )}
        <p className="text-black">No tasks found.</p>;
      </div>
    );

  return (
    <div>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4 text-black">Your Tasks</h1>
        {isUserAdmin && (
          <Link
            href="/dashboard/tasks/create"
            className="inline-block bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 mb-4"
          >
            ➕ Create New Task
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task: any) => (
          <div
            key={task.id}
            className="bg-white p-4 rounded shadow hover:shadow-lg transition relative"
          >
            <h2 className="font-semibold text-gray-900">{task.title}</h2>
            <p className="text-sm text-gray-600">{task.description}</p>
            <p className="mt-2 text-black text-xs">
              Status:{" "}
              <span
                className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${
                  statusColors[task.status as keyof typeof statusColors]
                }`}
              >
                {statusLabels[task.status as keyof typeof statusLabels]}
              </span>
            </p>
            <p className="text-black text-xs">
              <span className="font-medium">Assigned To: </span>
              {task.assignedTo?.name}
            </p>
            <p className="text-black text-xs">
              <span className="font-medium">Created By: </span>
              {task.createdBy?.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Created: {new Date(task.createdAt).toLocaleString()}
            </p>
            {isUserAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  deleteTask(task.id);
                }}
                className="mt-2 bg-red-500 text-white px-2 py-0.5 text-sm rounded hover:bg-red-600"
              >
                Delete
              </button>
            )}
            <button
              className={
                isUserAdmin
                  ? "ml-2"
                  : "mt-2  bg-green-500 text-white px-2 py-0.5 text-sm rounded hover:bg-green-600"
              }
            >
              <Link href={`/dashboard/tasks/${task.id}/edit`}>Edit</Link>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
