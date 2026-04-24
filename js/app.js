/* ── Storage helpers ── */
const store = {
  get: (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val))
};

/* ══════════════════════════════════════
   GREETING & DATETIME
══════════════════════════════════════ */
const datetimeEl = document.getElementById('datetime');
const greetingEl = document.getElementById('greeting');

function getGreeting(hour) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

function updateDatetime() {
  const now = new Date();
  const hour = now.getHours();
  const name = store.get('userName', 'Friend');

  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  datetimeEl.textContent = `${dateStr} · ${timeStr}`;
  greetingEl.textContent = `${getGreeting(hour)}, ${name}!`;
}

updateDatetime();
setInterval(updateDatetime, 1000);

/* ══════════════════════════════════════
   THEME TOGGLE
══════════════════════════════════════ */
const themeToggle = document.getElementById('theme-toggle');
let currentTheme = store.get('theme', 'dark');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  store.set('theme', theme);
  currentTheme = theme;
}

applyTheme(currentTheme);
themeToggle.addEventListener('click', () => {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

/* ══════════════════════════════════════
   CUSTOM NAME
══════════════════════════════════════ */
const nameModal   = document.getElementById('name-modal');
const nameInput   = document.getElementById('name-input');
const editNameBtn = document.getElementById('edit-name-btn');
const saveNameBtn = document.getElementById('save-name-btn');
const cancelNameBtn = document.getElementById('cancel-name-btn');

editNameBtn.addEventListener('click', () => {
  nameInput.value = store.get('userName', '');
  nameModal.classList.remove('hidden');
  nameInput.focus();
});

saveNameBtn.addEventListener('click', saveName);
nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveName(); });
cancelNameBtn.addEventListener('click', () => nameModal.classList.add('hidden'));
nameModal.addEventListener('click', e => { if (e.target === nameModal) nameModal.classList.add('hidden'); });

function saveName() {
  const val = nameInput.value.trim();
  if (val) store.set('userName', val);
  nameModal.classList.add('hidden');
  updateDatetime();
}

/* ══════════════════════════════════════
   FOCUS TIMER
══════════════════════════════════════ */
const timerDisplay  = document.getElementById('timer-display');
const startBtn      = document.getElementById('timer-start');
const stopBtn       = document.getElementById('timer-stop');
const resetBtn      = document.getElementById('timer-reset');
const durationInput = document.getElementById('pomodoro-duration');

let timerInterval = null;
let totalSeconds  = 0;
let isRunning     = false;

function getDurationSeconds() {
  const mins = parseInt(durationInput.value, 10) || 25;
  return Math.max(1, Math.min(120, mins)) * 60;
}

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(totalSeconds);
}

function initTimer() {
  totalSeconds = getDurationSeconds();
  renderTimer();
  timerDisplay.classList.remove('running', 'finished');
}

// Load saved duration
durationInput.value = store.get('pomodoroDuration', 25);
initTimer();

durationInput.addEventListener('change', () => {
  store.set('pomodoroDuration', parseInt(durationInput.value, 10) || 25);
  if (!isRunning) initTimer();
});

startBtn.addEventListener('click', () => {
  if (isRunning) return;
  if (totalSeconds <= 0) initTimer();
  isRunning = true;
  timerDisplay.classList.add('running');
  timerDisplay.classList.remove('finished');

  timerInterval = setInterval(() => {
    totalSeconds--;
    renderTimer();
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      timerDisplay.classList.remove('running');
      timerDisplay.classList.add('finished');
      timerDisplay.textContent = 'Done!';
      notifyDone();
    }
  }, 1000);
});

stopBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  isRunning = false;
  timerDisplay.classList.remove('running');
});

resetBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  isRunning = false;
  initTimer();
});

function notifyDone() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Focus session complete!', { body: 'Time for a break.' });
  }
}
if ('Notification' in window) Notification.requestPermission();

/* ══════════════════════════════════════
   TO-DO LIST
══════════════════════════════════════ */
const todoInput = document.getElementById('todo-input');
const todoAddBtn = document.getElementById('todo-add');
const todoList  = document.getElementById('todo-list');

let todos = store.get('todos', []);

function saveTodos() { store.set('todos', todos); }

function renderTodos() {
  todoList.innerHTML = '';
  todos.forEach((task, idx) => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (task.done ? ' done' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => {
      todos[idx].done = checkbox.checked;
      saveTodos();
      renderTodos();
    });

    const textSpan = document.createElement('span');
    textSpan.className = 'todo-text';
    textSpan.textContent = task.text;
    textSpan.title = 'Double-click to edit';
    textSpan.addEventListener('dblclick', () => startEdit(idx, li, textSpan));

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.className = 'secondary';
    editBtn.title = 'Edit';
    editBtn.addEventListener('click', () => startEdit(idx, li, textSpan));

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑';
    delBtn.className = 'danger';
    delBtn.title = 'Delete';
    delBtn.addEventListener('click', () => {
      todos.splice(idx, 1);
      saveTodos();
      renderTodos();
    });

    actions.append(editBtn, delBtn);
    li.append(checkbox, textSpan, actions);
    todoList.appendChild(li);
  });
}

function startEdit(idx, li, textSpan) {
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'todo-edit-input';
  editInput.value = todos[idx].text;

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = '✔';
  confirmBtn.title = 'Save';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = '✖';
  cancelBtn.className = 'secondary';
  cancelBtn.title = 'Cancel';

  function commitEdit() {
    const val = editInput.value.trim();
    if (val) todos[idx].text = val;
    saveTodos();
    renderTodos();
  }

  confirmBtn.addEventListener('click', commitEdit);
  cancelBtn.addEventListener('click', renderTodos);
  editInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') renderTodos();
  });

  textSpan.replaceWith(editInput);
  li.querySelector('.todo-actions').replaceChildren(confirmBtn, cancelBtn);
  editInput.focus();
  editInput.select();
}

function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;
  todos.push({ text, done: false });
  saveTodos();
  renderTodos();
  todoInput.value = '';
  todoInput.focus();
}

todoAddBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTodo(); });

renderTodos();

/* ══════════════════════════════════════
   QUICK LINKS
══════════════════════════════════════ */
const linkNameInput = document.getElementById('link-name');
const linkUrlInput  = document.getElementById('link-url');
const linkAddBtn    = document.getElementById('link-add');
const linksGrid     = document.getElementById('links-grid');

let links = store.get('quickLinks', [
  { label: 'Google', url: 'https://google.com' },
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'YouTube', url: 'https://youtube.com' }
]);

function saveLinks() { store.set('quickLinks', links); }

function getFavicon(url) {
  try {
    const origin = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain=${origin}&sz=32`;
  } catch { return ''; }
}

function renderLinks() {
  linksGrid.innerHTML = '';
  links.forEach((link, idx) => {
    const chip = document.createElement('div');
    chip.className = 'link-chip';

    const img = document.createElement('img');
    img.src = getFavicon(link.url);
    img.width = 16;
    img.height = 16;
    img.style.borderRadius = '3px';
    img.onerror = () => img.style.display = 'none';

    const a = document.createElement('a');
    a.href = link.url;
    a.textContent = link.label;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.className = 'remove-link';
    removeBtn.title = 'Remove';
    removeBtn.addEventListener('click', () => {
      links.splice(idx, 1);
      saveLinks();
      renderLinks();
    });

    chip.append(img, a, removeBtn);
    linksGrid.appendChild(chip);
  });
}

function addLink() {
  const label = linkNameInput.value.trim();
  let url = linkUrlInput.value.trim();
  if (!label || !url) return;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  links.push({ label, url });
  saveLinks();
  renderLinks();
  linkNameInput.value = '';
  linkUrlInput.value = '';
  linkNameInput.focus();
}

linkAddBtn.addEventListener('click', addLink);
linkUrlInput.addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });

renderLinks();
