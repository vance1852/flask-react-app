import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ---- Tasks ----

export async function fetchTasks(categoryId = null) {
  const params = categoryId ? { category: categoryId } : {};
  const { data } = await api.get("/tasks", { params });
  return data;
}

export async function createTask(task) {
  const { data } = await api.post("/tasks", task);
  return data;
}

export async function updateTask(id, updates) {
  const { data } = await api.put(`/tasks/${id}`, updates);
  return data;
}

export async function deleteTask(id) {
  const { data } = await api.delete(`/tasks/${id}`);
  return data;
}

// ---- Categories ----

export async function fetchCategories() {
  const { data } = await api.get("/categories");
  return data;
}

export async function createCategory(category) {
  const { data } = await api.post("/categories", category);
  return data;
}
