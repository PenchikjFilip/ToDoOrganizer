// Todo UI Component

class TodoComponent {
  constructor() {
    this.todos = [];
    this.filter = 'all';
    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    this.taskInput = document.getElementById('taskInput');
    this.addTaskBtn = document.getElementById('addTaskBtn');
    this.taskList = document.getElementById('taskList');
    this.errorEl = document.getElementById('todoError');
    this.loadingEl = document.getElementById('loading');
    this.filterAllBtn = document.getElementById('filterAll');
    this.filterActiveBtn = document.getElementById('filterActive');
    this.filterCompletedBtn = document.getElementById('filterCompleted');
    this.clearCompletedBtn = document.getElementById('clearCompleted');
    this.todoCountEl = document.getElementById('todoCount');
  }

  attachEventListeners() {
    this.addTaskBtn.addEventListener('click', () => this.addTask());
    this.taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTask();
    });
    
    this.filterAllBtn.addEventListener('click', () => this.setFilter('all'));
    this.filterActiveBtn.addEventListener('click', () => this.setFilter('active'));
    this.filterCompletedBtn.addEventListener('click', () => this.setFilter('completed'));
    this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
  }

  async onUserLoggedIn() {
    await this.fetchTodos();
  }

  onUserLoggedOut() {
    this.todos = [];
    this.renderTodos();
  }

  showLoading(show = true) {
    if (this.loadingEl) {
      this.loadingEl.style.display = show ? 'block' : 'none';
    }
  }

  showError(message) {
    if (this.errorEl) {
      this.errorEl.textContent = message;
      this.errorEl.style.display = 'block';
      setTimeout(() => this.clearError(), 5000);
    }
  }

  clearError() {
    if (this.errorEl) {
      this.errorEl.textContent = '';
      this.errorEl.style.display = 'none';
    }
  }

  async fetchTodos() {
    this.clearError();
    this.showLoading(true);
    
    try {
      this.todos = await window.ApiService.todo.getAll();
      this.renderTodos();
    } catch (err) {
      this.showError(`Failed to load todos: ${err.message}`);
    } finally {
      this.showLoading(false);
    }
  }

  async addTask() {
    const title = this.taskInput.value.trim();
    
    if (!title) {
      this.showError('Please enter a task');
      return;
    }

    this.clearError();
    
    try {
      const newTodo = await window.ApiService.todo.create(title);
      this.todos.unshift(newTodo);
      this.taskInput.value = '';
      this.renderTodos();
    } catch (err) {
      this.showError(`Failed to add task: ${err.message}`);
    }
  }

  async toggleTodo(id) {
    const todo = this.todos.find(t => t._id === id);
    if (!todo) return;

    this.clearError();
    
    try {
      const updated = await window.ApiService.todo.update(id, { done: !todo.done });
      const index = this.todos.findIndex(t => t._id === id);
      if (index !== -1) {
        this.todos[index] = updated;
      }
      this.renderTodos();
    } catch (err) {
      this.showError(`Failed to update task: ${err.message}`);
    }
  }

  async deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    this.clearError();
    
    try {
      await window.ApiService.todo.delete(id);
      this.todos = this.todos.filter(t => t._id !== id);
      this.renderTodos();
    } catch (err) {
      this.showError(`Failed to delete task: ${err.message}`);
    }
  }

  async clearCompleted() {
    const completedCount = this.todos.filter(t => t.done).length;
    
    if (completedCount === 0) {
      this.showError('No completed tasks to clear');
      return;
    }

    if (!confirm(`Delete ${completedCount} completed task(s)?`)) {
      return;
    }

    this.clearError();
    
    try {
      await window.ApiService.todo.deleteCompleted();
      this.todos = this.todos.filter(t => !t.done);
      this.renderTodos();
    } catch (err) {
      this.showError(`Failed to clear completed: ${err.message}`);
    }
  }

  setFilter(filter) {
    this.filter = filter;
    
    [this.filterAllBtn, this.filterActiveBtn, this.filterCompletedBtn].forEach(btn => {
      btn.classList.remove('active');
    });
    
    if (filter === 'all') this.filterAllBtn.classList.add('active');
    else if (filter === 'active') this.filterActiveBtn.classList.add('active');
    else if (filter === 'completed') this.filterCompletedBtn.classList.add('active');
    
    this.renderTodos();
  }

  getFilteredTodos() {
    if (this.filter === 'active') {
      return this.todos.filter(t => !t.done);
    } else if (this.filter === 'completed') {
      return this.todos.filter(t => t.done);
    }
    return this.todos;
  }

  renderTodos() {
    const filtered = this.getFilteredTodos();
    
    const activeCount = this.todos.filter(t => !t.done).length;
    if (this.todoCountEl) {
      this.todoCountEl.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} left`;
    }
    
    if (filtered.length === 0) {
      this.taskList.innerHTML = '<li class="empty">No tasks to show</li>';
      return;
    }

    this.taskList.innerHTML = filtered.map(todo => this.renderTodoItem(todo)).join('');
    this.attachTodoEventListeners();
  }

  renderTodoItem(todo) {
    const escapedTitle = this.escapeHtml(todo.title);
    const checkedAttr = todo.done ? 'checked' : '';
    const doneClass = todo.done ? 'done' : '';
    const date = new Date(todo.updatedAt).toLocaleDateString();
    
    return `
      <li class="todo-item ${doneClass}" data-id="${todo._id}">
        <input type="checkbox" ${checkedAttr} class="todo-checkbox">
        <span class="todo-title">${escapedTitle}</span>
        <span class="todo-date">${date}</span>
        <button class="delete-btn">×</button>
      </li>
    `;
  }

  attachTodoEventListeners() {
    this.taskList.querySelectorAll('.todo-checkbox').forEach((checkbox, index) => {
      const filtered = this.getFilteredTodos();
      const todo = filtered[index];
      if (todo) {
        checkbox.addEventListener('change', () => this.toggleTodo(todo._id));
      }
    });
    
    this.taskList.querySelectorAll('.delete-btn').forEach((btn, index) => {
      const filtered = this.getFilteredTodos();
      const todo = filtered[index];
      if (todo) {
        btn.addEventListener('click', () => this.deleteTodo(todo._id));
      }
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize when ready
window.todoComponent = new TodoComponent();