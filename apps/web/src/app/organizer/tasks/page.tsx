"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function TaskList() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:3001/tasks');
      setTasks(res.data);
    } catch(err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      await axios.post('http://localhost:3001/tasks/global', { text: newTask });
      setNewTask("");
      fetchTasks();
    } catch(err) {
      console.error(err);
    }
  };

  const toggleTask = async (task: any) => {
    try {
      await axios.patch(`http://localhost:3001/tasks/${task.id}`, { completed: !task.completed });
      fetchTasks();
    } catch(err) {
      console.error(err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3001/tasks/${id}`);
      fetchTasks();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-headline-lg font-headline-lg text-on-surface">Global Task List</h1>
            <p className="text-on-surface-variant">Rangkuman seluruh tugas dari semua acara</p>
          </div>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-surface-container rounded-full text-on-surface hover:bg-surface-container-high transition flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Dashboard
          </button>
        </header>

        <form onSubmit={addTask} className="mb-8 flex gap-4">
          <input 
            type="text" 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Tambah tugas operasional EO secara umum..." 
            className="flex-1 bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
          />
          <button type="submit" className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:brightness-110 transition">
            Tambah
          </button>
        </form>

        {isLoading ? (
          <div className="flex justify-center py-10 text-primary">
            <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.length === 0 && (
              <p className="text-center text-on-surface-variant italic py-8">Belum ada tugas yang dicatat.</p>
            )}
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 hover:border-primary/30 transition">
                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleTask(task)}>
                  <div className={`w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 ${task.completed ? 'bg-primary border-primary text-on-primary' : 'border-outline text-transparent'}`}>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-body-lg ${task.completed ? 'line-through text-on-surface-variant opacity-70' : 'text-on-surface'}`}>
                      {task.text}
                    </p>
                    {task.event && (
                      <div className="flex items-center gap-1 mt-1 text-label-sm text-primary">
                        <span className="material-symbols-outlined text-[12px]">event</span>
                        <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded-md font-bold uppercase tracking-widest">{task.event.coupleName}</span>
                      </div>
                    )}
                    {!task.event && (
                      <div className="flex items-center gap-1 mt-1 text-label-sm text-secondary">
                        <span className="material-symbols-outlined text-[12px]">corporate_fare</span>
                        <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-md font-bold uppercase tracking-widest">Global EO Task</span>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => deleteTask(task.id)} className="text-error hover:bg-error-container p-2 rounded-lg transition ml-4">
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
