import { useState } from "react";
import { createCategory } from "../api/tasks";

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
  onCategoriesChange,
}) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6366f1");
  const [showForm, setShowForm] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      await createCategory({ name: newName.trim(), color: newColor });
      setNewName("");
      setNewColor("#6366f1");
      setShowForm(false);
      onCategoriesChange();
    } catch (err) {
      console.error("Failed to create category", err);
    }
  };

  return (
    <div className="category-filter">
      <h2 className="sidebar-title">Categories</h2>

      <ul className="category-list">
        <li>
          <button
            className={`category-btn ${selected === null ? "active" : ""}`}
            onClick={() => onSelect(null)}
          >
            <span
              className="category-dot"
              style={{ backgroundColor: "#94a3b8" }}
            />
            All Tasks
          </button>
        </li>
        {categories.map((cat) => (
          <li key={cat.id}>
            <button
              className={`category-btn ${selected === cat.id ? "active" : ""}`}
              onClick={() => onSelect(cat.id)}
            >
              <span
                className="category-dot"
                style={{ backgroundColor: cat.color }}
              />
              {cat.name}
            </button>
          </li>
        ))}
      </ul>

      {showForm ? (
        <form className="add-category-form" onSubmit={handleAdd}>
          <input
            type="text"
            className="input input-sm"
            placeholder="Category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <div className="color-row">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              aria-label="Category color"
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Add
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>
          </div>
        </form>
      ) : (
        <button
          className="btn btn-ghost add-category-btn"
          onClick={() => setShowForm(true)}
        >
          + New Category
        </button>
      )}
    </div>
  );
}
