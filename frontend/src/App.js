import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

function App() {
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      setError("Erro ao atualizar tarefa");
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      setError("Erro ao remover tarefa");
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1>Lista de Tarefas</h1>

        {error && <div className="error">{error}</div>}

        <form onSubmit={addTask} className="form">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Digite uma nova tarefa..."
            className="input"
          />
          <button type="submit" className="btn-add">
            Adicionar
          </button>
        </form>

        {loading ? (
          <p className="loading">Carregando...</p>
        ) : (
          <ul className="task-list">
            {tasks.length === 0 && (
              <p className="empty">Nenhuma tarefa ainda. Adicione uma!</p>
            )}
            {tasks.map((task) => (
              <li key={task.id} className={`task ${task.completed ? "completed" : ""}`}>
                <label className="task-label">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id, task.completed)}
                  />
                  <span className="task-title">{task.title}</span>
                </label>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="btn-delete"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
