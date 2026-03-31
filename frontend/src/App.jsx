import { useEffect, useState } from "react";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import CategoryFilter from "./components/CategoryFilter";
import {
  fetchTasks,
  fetchCategories,
  createTask,
  updateTask,
  deleteTask,
} from "./api/tasks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksData, categoriesData] = await Promise.all([
        fetchTasks(selectedCategory),
        fetchCategories(),
      ]);
      setTasks(tasksData);
      setCategories(categoriesData);
    } catch (err) {
      setError("Failed to load data. Is the backend running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleCreateTask = async (task) => {
    await createTask(task);
    loadData();
  };

  const handleUpdateTask = async (id, updates) => {
    await updateTask(id, updates);
    setEditingTask(null);
    loadData();
  };

  const handleDeleteTask = async (id) => {
    await deleteTask(id);
    loadData();
  };

  const handleToggleComplete = async (task) => {
    await updateTask(task.id, { completed: !task.completed });
    loadData();
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>📋 Task Manager</h1>
          <p className="subtitle">Stay organized, get things done</p>
        </div>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            onCategoriesChange={loadData}
          />
        </aside>

        <section className="content">
          <TaskForm
            categories={categories}
            editingTask={editingTask}
            onSubmit={
              editingTask
                ? (data) => handleUpdateTask(editingTask.id, data)
                : handleCreateTask
            }
            onCancel={() => setEditingTask(null)}
          />

          {error && <div className="error-banner">{error}</div>}

          {loading ? (
            <div className="loading">Loading tasks...</div>
          ) : (
            <TaskList
              tasks={tasks}
              onToggle={handleToggleComplete}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
            />
          )}
        </section>
      </main>
    </div>
  );
}
