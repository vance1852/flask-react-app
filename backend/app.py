import psycopg2
import psycopg2.extras
from flask import Flask, jsonify, request
from flask_cors import CORS

from config import Config

app = Flask(__name__)
CORS(app)
config = Config()


def get_db():
    """Create a new database connection."""
    conn = psycopg2.connect(config.database_url)
    conn.autocommit = True
    return conn


def init_db():
    """Initialize database tables if they don't exist."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT '',
            completed BOOLEAN DEFAULT FALSE,
            category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cur.close()
    conn.close()


# ---------------------------------------------------------------------------
# Task endpoints
# ---------------------------------------------------------------------------

@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    """List all tasks, optionally filtered by category."""
    category_id = request.args.get("category")
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    if category_id:
        cur.execute(
            """
            SELECT t.*, c.name AS category_name, c.color AS category_color
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.category_id = %s
            ORDER BY t.created_at DESC
            """,
            (category_id,),
        )
    else:
        cur.execute(
            """
            SELECT t.*, c.name AS category_name, c.color AS category_color
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            ORDER BY t.created_at DESC
            """
        )

    tasks = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(tasks)


@app.route("/api/tasks", methods=["POST"])
def create_task():
    """Create a new task."""
    data = request.get_json()
    if not data or not data.get("title"):
        return jsonify({"error": "Title is required"}), 400

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        """
        INSERT INTO tasks (title, description, category_id)
        VALUES (%s, %s, %s)
        RETURNING *
        """,
        (data["title"], data.get("description", ""), data.get("category_id")),
    )
    task = cur.fetchone()
    cur.close()
    conn.close()
    return jsonify(task), 201


@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    """Update an existing task."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Build dynamic update query
    fields = []
    values = []
    for field in ("title", "description", "completed", "category_id"):
        if field in data:
            fields.append(f"{field} = %s")
            values.append(data[field])

    if not fields:
        return jsonify({"error": "No valid fields to update"}), 400

    fields.append("updated_at = CURRENT_TIMESTAMP")
    values.append(task_id)

    cur.execute(
        f"UPDATE tasks SET {', '.join(fields)} WHERE id = %s RETURNING *",
        values,
    )
    task = cur.fetchone()
    cur.close()
    conn.close()

    if not task:
        return jsonify({"error": "Task not found"}), 404
    return jsonify(task)


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    """Delete a task."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM tasks WHERE id = %s RETURNING id", (task_id,))
    deleted = cur.fetchone()
    cur.close()
    conn.close()

    if not deleted:
        return jsonify({"error": "Task not found"}), 404
    return jsonify({"message": "Task deleted"})


# ---------------------------------------------------------------------------
# Category endpoints
# ---------------------------------------------------------------------------

@app.route("/api/categories", methods=["GET"])
def get_categories():
    """List all categories."""
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM categories ORDER BY name")
    categories = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(categories)


@app.route("/api/categories", methods=["POST"])
def create_category():
    """Create a new category."""
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "Name is required"}), 400

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute(
            """
            INSERT INTO categories (name, color)
            VALUES (%s, %s)
            RETURNING *
            """,
            (data["name"], data.get("color", "#6366f1")),
        )
        category = cur.fetchone()
    except psycopg2.errors.UniqueViolation:
        cur.close()
        conn.close()
        return jsonify({"error": "Category already exists"}), 409

    cur.close()
    conn.close()
    return jsonify(category), 201


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.route("/api/health")
def health():
    """Health check endpoint."""
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        return jsonify({"status": "healthy", "database": "connected"})
    except Exception as e:
        return jsonify({"status": "unhealthy", "database": str(e)}), 503


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=config.FLASK_PORT, debug=config.FLASK_DEBUG)
