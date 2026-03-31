-- Task Manager Database Schema
-- Run: psql -U taskmanager -d taskmanager -f init_db.sql

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    completed BOOLEAN DEFAULT FALSE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed categories
INSERT INTO categories (name, color) VALUES
    ('Work', '#3b82f6'),
    ('Personal', '#10b981'),
    ('Shopping', '#f59e0b'),
    ('Health', '#ef4444'),
    ('Learning', '#8b5cf6')
ON CONFLICT (name) DO NOTHING;

-- Seed tasks
INSERT INTO tasks (title, description, completed, category_id) VALUES
    ('Review pull requests', 'Check open PRs on the main repo', FALSE, 1),
    ('Update project documentation', 'Add API docs for new endpoints', FALSE, 1),
    ('Buy groceries', 'Milk, eggs, bread, vegetables', FALSE, 3),
    ('Morning run', '5km run in the park', TRUE, 4),
    ('Read Clean Code chapter 5', 'Functions and error handling', FALSE, 5),
    ('Schedule dentist appointment', 'Annual checkup', FALSE, 2),
    ('Deploy staging build', 'Push latest changes to staging env', FALSE, 1),
    ('Organize desk', 'Clean up workspace and file papers', TRUE, 2)
ON CONFLICT DO NOTHING;
