const API_BASE = 'http://localhost:3000/api';

class TaskManager {
    constructor() {
        this.tasks = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTasks();
    }

    bindEvents() {
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });
    }

    async loadTasks() {
        try {
            const response = await fetch(`${API_BASE}/tasks`);
            this.tasks = await response.json();
            this.renderTasks();
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    async addTask() {
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;

        if (!title.trim()) return;

        try {
            const response = await fetch(`${API_BASE}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, description }),
            });

            if (response.ok) {
                document.getElementById('taskForm').reset();
                this.loadTasks();
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }

    async updateTaskStatus(id, status) {
        try {
            const response = await fetch(`${API_BASE}/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                this.loadTasks();
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    }

    async deleteTask(id) {
        try {
            const response = await fetch(`${API_BASE}/tasks/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                this.loadTasks();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        
        if (this.tasks.length === 0) {
            taskList.innerHTML = '<div class="no-tasks">No tasks yet. Add your first task above!</div>';
            return;
        }

        taskList.innerHTML = this.tasks.map(task => `
            <div class="task-item ${task.status}">
                <div class="task-header">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <div class="task-status ${task.status}">${task.status}</div>
                </div>
                ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                <div class="task-actions">
                    ${task.status === 'pending' ? 
                        `<button class="complete-btn" onclick="taskManager.updateTaskStatus(${task.id}, 'completed')">Complete</button>` : 
                        `<button class="complete-btn" onclick="taskManager.updateTaskStatus(${task.id}, 'pending')">Reopen</button>`
                    }
                    <button class="delete-btn" onclick="taskManager.deleteTask(${task.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
const taskManager = new TaskManager();