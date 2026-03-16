"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/tasks`);
      const data = await res.json();
      setTasks(data);
      setError(null);
    } catch {
      setError("Nao foi possivel conectar ao backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask }),
      });
      const task = await res.json();
      setTasks([task, ...tasks]);
      setNewTask("");
    } catch {
      setError("Erro ao adicionar tarefa");
    }
  };

  const toggleTask = async (id, completed) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      const updated = await res.json();
      setTasks(tasks.map((t) => (t.id === id ? updated : t)));
    } catch {
      setError("Erro ao atualizar tarefa");
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
      setTasks(tasks.filter((t) => t.id !== id));
    } catch {
      setError("Erro ao remover tarefa");
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 mb-4">
            <ClipboardList className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Lista de Tarefas</h1>
          <p className="text-zinc-500 mt-2 text-sm">
            {tasks.length === 0
              ? "Nenhuma tarefa ainda"
              : `${completedCount} de ${tasks.length} concluidas`}
          </p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={addTask} className="flex gap-2 mb-8">
          <Input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="O que precisa ser feito?"
          />
          <Button type="submit">
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </form>

        {loading ? (
          <div className="text-center py-12 text-zinc-500">Carregando...</div>
        ) : (
          <div className="space-y-2">
            {tasks.length === 0 && (
              <div className="text-center py-12 text-zinc-600">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Adicione sua primeira tarefa!</p>
              </div>
            )}
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  task.completed
                    ? "bg-zinc-900/50 border-zinc-800"
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id, task.completed)}
                />
                <span
                  className={`flex-1 text-sm transition-all ${
                    task.completed
                      ? "line-through text-zinc-600"
                      : "text-zinc-200"
                  }`}
                >
                  {task.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-zinc-500 hover:text-red-400" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
