import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, Check, Moon, Sun, Calendar, Tag, Filter } from 'lucide-react';

const TodoApp = () => {
  // Load state from localStorage or use defaults
  const loadState = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  // State with localStorage persistence
  const [tasks, setTasks] = useState(loadState('tasks', [
    { id: 1, text: 'Welcome to your colorful to-do app!', completed: false, priority: 'medium', tag: 'welcome', dueDate: '2025-06-18' },
    { id: 2, text: 'Try adding a new task', completed: false, priority: 'high', tag: 'tutorial', dueDate: '' }
  ]));
  const [darkMode, setDarkMode] = useState(loadState('darkMode', false));
  const [filter, setFilter] = useState(loadState('filter', 'all'));
  const [searchTerm, setSearchTerm] = useState(loadState('searchTerm', ''));
  
  // Other state that doesn't need persistence
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskTag, setNewTaskTag] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  
  const inputRef = useRef(null);

  // Save relevant state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('filter', JSON.stringify(filter));
  }, [filter]);

  useEffect(() => {
    localStorage.setItem('searchTerm', JSON.stringify(searchTerm));
  }, [searchTerm]);

  const priorityColors = {
    high: 'from-red-400 to-pink-500',
    medium: 'from-yellow-400 to-orange-500',
    low: 'from-green-400 to-blue-500'
  };

  const tagColors = [
    'bg-gradient-to-r from-purple-400 to-pink-400',
    'bg-gradient-to-r from-blue-400 to-cyan-400',
    'bg-gradient-to-r from-green-400 to-teal-400',
    'bg-gradient-to-r from-yellow-400 to-orange-400',
    'bg-gradient-to-r from-indigo-400 to-purple-400'
  ];

  const getTagColor = (tag) => {
    if (!tag) return '';
    const hash = tag.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return tagColors[hash % tagColors.length];
  };

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        priority: newTaskPriority,
        tag: newTaskTag.trim(),
        dueDate: newTaskDueDate
      };
      setTasks([...tasks, task]);
      setNewTask('');
      setNewTaskPriority('medium');
      setNewTaskTag('');
      setNewTaskDueDate('');
      setShowAddForm(false);
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = () => {
    if (editText.trim()) {
      setTasks(tasks.map(task => 
        task.id === editingId ? { ...task, text: editText.trim() } : task
      ));
    }
    setEditingId(null);
    setEditText('');
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetTask) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.id === targetTask.id) return;

    const draggedIndex = tasks.findIndex(task => task.id === draggedTask.id);
    const targetIndex = tasks.findIndex(task => task.id === targetTask.id);
    
    const newTasks = [...tasks];
    newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, draggedTask);
    
    setTasks(newTasks);
    setDraggedTask(null);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && !task.completed) || 
      (filter === 'completed' && task.completed);
    
    const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.tag && task.tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const dueDate = new Date(dateString);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent`}>
              Colorful Tasks
            </h1>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              Your vibrant productivity companion
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-full transition-all duration-300 ${
              darkMode 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg hover:shadow-yellow-400/25' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-purple-500/25'
            } hover:scale-110`}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        {/* Search and Filters */}
        <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl mb-6`}>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', 'active', 'completed'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === filterType
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Add Task Section */}
        <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl mb-6`}>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-purple-500/25"
            >
              <Plus className="inline mr-2" size={20} />
              Add New Task
            </button>
          ) : (
            <div className="space-y-4">
              <input
                ref={inputRef}
                type="text"
                placeholder="What needs to be done?"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                autoFocus
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>

                <input
                  type="text"
                  placeholder="Tag (optional)"
                  value={newTaskTag}
                  onChange={(e) => setNewTaskTag(e.target.value)}
                  className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />

                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addTask}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-200 hover:scale-[1.02] shadow-lg"
                >
                  Add Task
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, task)}
              className={`p-4 rounded-2xl transition-all duration-300 cursor-move hover:scale-[1.01] ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg hover:shadow-xl ${
                task.completed ? 'opacity-75' : ''
              } ${isOverdue(task.dueDate) && !task.completed ? 'ring-2 ring-red-400' : ''}`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleComplete(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    task.completed
                      ? 'bg-gradient-to-r from-green-400 to-blue-500 border-transparent text-white'
                      : darkMode
                      ? 'border-gray-600 hover:border-green-400'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {task.completed && <Check size={14} />}
                </button>

                <div className="flex-1">
                  {editingId === task.id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                      onBlur={saveEdit}
                      className={`w-full px-2 py-1 rounded border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      autoFocus
                    />
                  ) : (
                    <div>
                      <span
                        className={`text-lg ${
                          task.completed ? 'line-through' : ''
                        } ${darkMode ? 'text-white' : 'text-gray-900'}`}
                      >
                        {task.text}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-3 py-1 text-xs rounded-full bg-gradient-to-r ${priorityColors[task.priority]} text-white font-medium`}>
                          {task.priority.toUpperCase()}
                        </span>
                        {task.tag && (
                          <span className={`px-3 py-1 text-xs rounded-full ${getTagColor(task.tag)} text-white font-medium`}>
                            {task.tag}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${
                            isOverdue(task.dueDate) && !task.completed
                              ? 'bg-red-100 text-red-700'
                              : darkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            <Calendar size={12} />
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(task.id, task.text)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      darkMode 
                        ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700' 
                        : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      darkMode 
                        ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' 
                        : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl">No tasks found</p>
            <p className="text-sm mt-2">
              {searchTerm ? 'Try adjusting your search' : 'Add a new task to get started!'}
            </p>
          </div>
        )}

        {/* Stats Footer */}
        <div className={`mt-8 p-4 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
          <div className="flex justify-center gap-8 text-sm">
            <div className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                {tasks.length}
              </div>
              <div>Total</div>
            </div>
            <div className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                {tasks.filter(t => t.completed).length}
              </div>
              <div>Completed</div>
            </div>
            <div className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                {tasks.filter(t => !t.completed).length}
              </div>
              <div>Remaining</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoApp;