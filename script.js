// Grab references to the HTML elements we need to work with
const taskInput = document.getElementById('task-input');
const addButton = document.getElementById('add-button');
const taskList = document.getElementById('task-list');

// Load any tasks saved from last time, or start with an empty list
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Plays a short beep using the Web Audio API (no sound file needed)
function playCheckSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContextClass();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.value = 880; // musical note A5

  // Quick fade-out so it sounds like a short "ding" rather than a buzz
  gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.2);
}

function renderTasks() {
  // Clear the current list and rebuild it from the `tasks` array
  taskList.innerHTML = '';

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    if (task.completed) {
      li.classList.add('completed');
    }

    const circle = document.createElement('div');
    circle.classList.add('check-circle');
    if (task.completed) {
      circle.classList.add('checked');
    }
    circle.addEventListener('click', () => toggleComplete(index));

    const span = document.createElement('span');
    span.textContent = task.text;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', () => deleteTask(index));

    li.appendChild(circle);
    li.appendChild(span);
    li.appendChild(deleteButton);
    taskList.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim();
  if (text === '') return;

  tasks.push({ text: text, completed: false });
  taskInput.value = '';

  saveTasks();
  renderTasks();
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;

  if (tasks[index].completed) {
    playCheckSound();
  }

  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

addButton.addEventListener('click', addTask);

taskInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addTask();
  }
});

renderTasks();
