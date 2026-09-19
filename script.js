import { auth, db } from './firebase-config.js';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Grab references to the HTML elements we need to work with
const signInButton = document.getElementById('sign-in-button');
const signOutButton = document.getElementById('sign-out-button');
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const appArea = document.getElementById('app-area');

const taskInput = document.getElementById('task-input');
const addButton = document.getElementById('add-button');
const taskList = document.getElementById('task-list');

let currentUser = null;
let unsubscribeFromTasks = null; // stops listening to the previous user's tasks on sign-out

const googleProvider = new GoogleAuthProvider();

signInButton.addEventListener('click', () => {
  signInWithPopup(auth, googleProvider).catch((error) => {
    console.error('Sign-in failed:', error);
    alert('Sign-in failed: ' + error.message);
  });
});

signOutButton.addEventListener('click', () => {
  signOut(auth);
});

// Firebase calls this function automatically whenever the user signs in,
// signs out, or the page first loads (to report whether they're already
// signed in from a previous visit).
onAuthStateChanged(auth, (user) => {
  currentUser = user;

  if (unsubscribeFromTasks) {
    unsubscribeFromTasks();
    unsubscribeFromTasks = null;
  }

  if (user) {
    signInButton.style.display = 'none';
    userInfo.style.display = 'block';
    userName.textContent = user.displayName;
    appArea.style.display = 'block';

    // Each user's tasks live in their own Firestore subcollection.
    // onSnapshot "subscribes" to that subcollection: it runs immediately
    // with the current data, then runs again automatically every time
    // the data changes (including changes from another tab or device).
    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    unsubscribeFromTasks = onSnapshot(tasksRef, (snapshot) => {
      const tasks = [];
      snapshot.forEach((docSnapshot) => {
        tasks.push({ id: docSnapshot.id, ...docSnapshot.data() });
      });
      renderTasks(tasks);
    });
  } else {
    signInButton.style.display = 'inline-block';
    userInfo.style.display = 'none';
    appArea.style.display = 'none';
    taskList.innerHTML = '';
  }
});

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

  gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.2);
}

function renderTasks(tasks) {
  taskList.innerHTML = '';

  tasks.forEach((task) => {
    const li = document.createElement('li');
    if (task.completed) {
      li.classList.add('completed');
    }

    const circle = document.createElement('div');
    circle.classList.add('check-circle');
    if (task.completed) {
      circle.classList.add('checked');
    }
    circle.addEventListener('click', () => toggleComplete(task.id, task.completed));

    const span = document.createElement('span');
    span.textContent = task.text;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(circle);
    li.appendChild(span);
    li.appendChild(deleteButton);
    taskList.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim();
  if (text === '' || !currentUser) return;

  const tasksRef = collection(db, 'users', currentUser.uid, 'tasks');
  addDoc(tasksRef, { text: text, completed: false });
  taskInput.value = '';
  // No manual re-render here: the onSnapshot listener above fires
  // automatically once Firestore confirms the new task, and redraws the list.
}

function toggleComplete(taskId, currentlyCompleted) {
  const taskRef = doc(db, 'users', currentUser.uid, 'tasks', taskId);
  updateDoc(taskRef, { completed: !currentlyCompleted });

  if (!currentlyCompleted) {
    playCheckSound();
  }
}

function deleteTask(taskId) {
  const taskRef = doc(db, 'users', currentUser.uid, 'tasks', taskId);
  deleteDoc(taskRef);
}

addButton.addEventListener('click', addTask);

taskInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addTask();
  }
});
