const { renderHtmlShell } = require('./layout');

const DEFAULT_TODOS = [
  { id: 1, text: 'Review quarterly priorities', completed: false },
  { id: 2, text: '30-minute deep reading', completed: true },
  { id: 3, text: 'Afternoon brisk walk outdoors', completed: false },
  { id: 4, text: 'Drink 2.5L water target', completed: false },
  { id: 5, text: 'Prepare tomorrow task log', completed: false }
];

function renderTodo() {
  const bodyContent = `
    <header class="meta-bar">
      <div>TODOS // DAILY FOCUS</div>
      <div id="todo-count">ACTIVE: 4</div>
    </header>

    <main class="content-zone" style="justify-content: flex-start; padding: 1rem; width: 100%;">
      <div id="todo-list" style="width: 100%; display: flex; flex-direction: column; gap: 0.75rem; max-width: 540px;">
        <!-- Populated via client-side state preserved in localStorage -->
      </div>
    </main>

    <script>
      (function() {
        var initialTodos = ${JSON.stringify(DEFAULT_TODOS)};
        var STORAGE_KEY = 'kindle_dash_todos_v1';

        function loadTodos() {
          try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
          } catch(e) {}
          return initialTodos;
        }

        function saveTodos(todos) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
          } catch(e) {}
        }

        var todos = loadTodos();

        function render() {
          var container = document.getElementById('todo-list');
          if (!container) return;
          container.innerHTML = '';

          var pendingCount = 0;

          todos.forEach(function(item, idx) {
            if (!item.completed) pendingCount++;

            var row = document.createElement('div');
            row.className = 'tactile';
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.border = 'var(--border-thick)';
            row.style.padding = '0.85rem 1rem';
            row.style.cursor = 'pointer';
            row.style.minHeight = '3.5rem';

            var box = document.createElement('div');
            box.style.width = '1.75rem';
            box.style.height = '1.75rem';
            box.style.border = 'var(--border-thick)';
            box.style.marginRight = '1rem';
            box.style.flexShrink = '0';
            box.style.display = 'flex';
            box.style.alignItems = 'center';
            box.style.justifyContent = 'center';
            box.style.backgroundColor = item.completed ? '#000000' : '#ffffff';

            if (item.completed) {
              box.innerHTML = '<span style="color: #ffffff; font-weight: 900; font-size: 1.2rem; line-height: 1;">&#10003;</span>';
            }

            var text = document.createElement('div');
            text.style.fontSize = '1.2rem';
            text.style.fontWeight = '700';
            text.style.textDecoration = item.completed ? 'line-through' : 'none';
            text.textContent = item.text;

            row.appendChild(box);
            row.appendChild(text);

            row.onclick = function() {
              todos[idx].completed = !todos[idx].completed;
              saveTodos(todos);
              render();
            };

            container.appendChild(row);
          });

          var countEl = document.getElementById('todo-count');
          if (countEl) countEl.textContent = 'REMAINING: ' + pendingCount;
        }

        render();
      })();
    </script>
  `;

  return renderHtmlShell({
    title: 'KindleDash // Todos',
    bodyContent,
    showActionBar: true,
    appName: 'TODOS'
  });
}

module.exports = { renderTodo };
