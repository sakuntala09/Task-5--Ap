document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const taskCount = document.getElementById('task-count');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const themeSwitch = document.getElementById('theme-switch');
    
    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Initialize
    renderTasks();
    updateTaskCount();
    loadTheme();
    
    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
    
    clearCompletedBtn.addEventListener('click', clearCompleted);
    themeSwitch.addEventListener('change', toggleTheme);
    
    // Functions
    function addTask() {
        const text = taskInput.value.trim();
        if (!text) return;
        
        const newTask = {
            id: Date.now(),
            text,
            completed: false,
            timestamp: new Date().toISOString()
        };
        
        tasks.unshift(newTask);
        saveTasks();
        taskInput.value = '';
        renderTasks();
        
        // Highlight new task
        const newTaskElement = taskList.firstChild;
        newTaskElement.classList.add('new-task');
        setTimeout(() => {
            newTaskElement.classList.remove('new-task');
        }, 300);
    }
    
    function renderTasks() {
        taskList.innerHTML = '';
        
        const filteredTasks = getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'No tasks found';
            emptyMessage.classList.add('empty-message');
            taskList.appendChild(emptyMessage);
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.dataset.id = task.id;
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <button class="task-delete"><i class="fas fa-trash"></i></button>
            `;
            
            // Add event listeners to dynamic elements
            const checkbox = taskItem.querySelector('.task-checkbox');
            const deleteBtn = taskItem.querySelector('.task-delete');
            
            checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
            
            taskList.appendChild(taskItem);
        });
        
        updateTaskCount();
    }
    
    function getFilteredTasks() {
        switch (currentFilter) {
            case 'active':
                return tasks.filter(task => !task.completed);
            case 'completed':
                return tasks.filter(task => task.completed);
            default:
                return [...tasks];
        }
    }
    
    function toggleTaskCompletion(id) {
        const task = tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    }
    
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }
    
    function clearCompleted() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    }
    
    function updateTaskCount() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        taskCount.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} left`;
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function toggleTheme() {
        const isDark = themeSwitch.checked;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        themeSwitch.checked = savedTheme === 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    // Drag and drop functionality
    let draggedItem = null;
    
    taskList.addEventListener('dragstart', function(e) {
        if (e.target.classList.contains('task-item')) {
            draggedItem = e.target;
            setTimeout(() => {
                e.target.style.opacity = '0.5';
            }, 0);
        }
    });
    
    taskList.addEventListener('dragend', function(e) {
        if (e.target.classList.contains('task-item')) {
            e.target.style.opacity = '1';
        }
    });
    
    taskList.addEventListener('dragover', function(e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(taskList, e.clientY);
        if (afterElement == null) {
            taskList.appendChild(draggedItem);
        } else {
            taskList.insertBefore(draggedItem, afterElement);
        }
    });
    
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
});