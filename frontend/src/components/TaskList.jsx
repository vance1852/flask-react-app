export default function TaskList({ tasks, onToggle, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">🎉</span>
        <p>No tasks yet. Add one above!</p>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li
          key={task.id}
          className={`task-item ${task.completed ? "completed" : ""}`}
        >
          <button
            className="task-checkbox"
            onClick={() => onToggle(task)}
            aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
          >
            {task.completed ? "✅" : "⬜"}
          </button>

          <div className="task-body">
            <span className="task-title">{task.title}</span>
            {task.description && (
              <span className="task-description">{task.description}</span>
            )}
            {task.category_name && (
              <span
                className="task-category-badge"
                style={{ backgroundColor: task.category_color || "#6366f1" }}
              >
                {task.category_name}
              </span>
            )}
          </div>

          <div className="task-actions">
            <button
              className="btn-icon"
              onClick={() => onEdit(task)}
              aria-label="Edit task"
            >
              ✏️
            </button>
            <button
              className="btn-icon"
              onClick={() => onDelete(task.id)}
              aria-label="Delete task"
            >
              🗑️
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
