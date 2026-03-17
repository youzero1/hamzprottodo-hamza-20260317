'use client';

import { useState, useEffect, useCallback } from 'react';

interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/todos');
      if (!res.ok) {
        const data = (await res.json()) as { error: string };
        throw new Error(data.error || 'Failed to fetch todos');
      }
      const data = (await res.json()) as Todo[];
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTodos();
  }, [fetchTodos]);

  const handleAddTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setSubmitError('Title is required');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error: string };
        throw new Error(data.error || 'Failed to create todo');
      }
      const created = (await res.json()) as Todo;
      setTodos((prev) => [created, ...prev]);
      setNewTitle('');
      setNewDescription('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error: string };
        throw new Error(data.error || 'Failed to update todo');
      }
      const updated = (await res.json()) as Todo;
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this todo?')) return;
    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = (await res.json()) as { error: string };
        throw new Error(data.error || 'Failed to delete todo');
      }
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '40px 20px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#1a1a2e',
            margin: '0 0 8px 0',
          }}
        >
          📝 Todo App
        </h1>
        <p style={{ color: '#666', margin: 0, fontSize: '1rem' }}>
          {loading
            ? 'Loading...'
            : `${completedCount} of ${todos.length} tasks completed`}
        </p>
      </div>

      {/* Add Todo Form */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <h2
          style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#333',
            margin: '0 0 16px 0',
          }}
        >
          Add New Task
        </h2>
        <form onSubmit={handleAddTodo}>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Task title (required)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '1rem',
                border: '1.5px solid #e0e0e0',
                borderRadius: '8px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                backgroundColor: submitting ? '#f9f9f9' : '#fff',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#4f46e5')}
              onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
            />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <textarea
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              disabled={submitting}
              rows={2}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '1rem',
                border: '1.5px solid #e0e0e0',
                borderRadius: '8px',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
                backgroundColor: submitting ? '#f9f9f9' : '#fff',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#4f46e5')}
              onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
            />
          </div>
          {submitError && (
            <p
              style={{
                color: '#e53e3e',
                fontSize: '0.875rem',
                margin: '0 0 12px 0',
              }}
            >
              ⚠️ {submitError}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{
              backgroundColor: submitting ? '#a5b4fc' : '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              width: '100%',
            }}
          >
            {submitting ? 'Adding...' : '+ Add Task'}
          </button>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div
          style={{
            backgroundColor: '#fff5f5',
            border: '1px solid #feb2b2',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            color: '#c53030',
            fontSize: '0.95rem',
          }}
        >
          ⚠️ {error}
          <button
            onClick={() => void fetchTodos()}
            style={{
              marginLeft: '12px',
              backgroundColor: 'transparent',
              border: '1px solid #c53030',
              borderRadius: '4px',
              color: '#c53030',
              cursor: 'pointer',
              padding: '2px 10px',
              fontSize: '0.875rem',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 0',
            color: '#888',
            fontSize: '1rem',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
          Loading your tasks...
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && todos.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 0',
            color: '#999',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
          <p style={{ fontSize: '1.1rem', margin: 0 }}>No tasks yet!</p>
          <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>
            Add your first task above.
          </p>
        </div>
      )}

      {/* Todo List */}
      {!loading && todos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {todos.map((todo) => (
            <div
              key={todo.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '18px 20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                borderLeft: `4px solid ${
                  todo.completed ? '#48bb78' : '#4f46e5'
                }`,
                opacity: todo.completed ? 0.75 : 1,
                transition: 'all 0.2s',
              }}
            >
              {/* Checkbox */}
              <button
                onClick={() => void handleToggle(todo)}
                title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                style={{
                  flexShrink: 0,
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: `2px solid ${todo.completed ? '#48bb78' : '#c0c0c0'}`,
                  backgroundColor: todo.completed ? '#48bb78' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  marginTop: '2px',
                  transition: 'all 0.2s',
                }}
              >
                {todo.completed && (
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>
                    ✓
                  </span>
                )}
              </button>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: '0 0 4px 0',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: todo.completed ? '#999' : '#1a1a2e',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    wordBreak: 'break-word',
                  }}
                >
                  {todo.title}
                </p>
                {todo.description && (
                  <p
                    style={{
                      margin: '0 0 6px 0',
                      fontSize: '0.875rem',
                      color: todo.completed ? '#bbb' : '#666',
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      wordBreak: 'break-word',
                    }}
                  >
                    {todo.description}
                  </p>
                )}
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: '#aaa',
                  }}
                >
                  {formatDate(todo.createdAt)}
                </p>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => void handleDelete(todo.id)}
                title="Delete task"
                style={{
                  flexShrink: 0,
                  backgroundColor: 'transparent',
                  border: '1px solid #fca5a5',
                  borderRadius: '6px',
                  color: '#e53e3e',
                  cursor: 'pointer',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fff5f5';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {!loading && todos.length > 0 && (
        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            color: '#bbb',
            fontSize: '0.8rem',
          }}
        >
          {completedCount === todos.length
            ? '🎉 All tasks completed!'
            : `${todos.length - completedCount} task${
                todos.length - completedCount !== 1 ? 's' : ''
              } remaining`}
        </div>
      )}
    </div>
  );
}
