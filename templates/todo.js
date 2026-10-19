const { renderAppShell } = require('./figma-layout');

const DEFAULT_TODOS = [
  { id: 1, text: 'Review quarterly priorities', completed: false },
  { id: 2, text: '30-minute deep reading', completed: true },
  { id: 3, text: 'Afternoon brisk walk outdoors', completed: false },
  { id: 4, text: 'Drink 2.5L water target', completed: false },
  { id: 5, text: 'Prepare tomorrow task log', completed: false }
];

function renderTodo() {
  const bodyContent = `
    <!-- Top Content Area (600x700px) -->
    <main style="
      width: 600px;
      height: 700px;
      position: absolute;
      top: 0;
      left: 0;
      overflow: hidden;
      padding: 35px 30px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    ">
      <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: baseline;">
        <h1 style="font-family: var(--font-main); font-size: 28px; font-weight: 700; color: var(--color-ink); letter-spacing: -0.5px;">
          Daily Focus
        </h1>
        <span id="todo-count" style="font-family: var(--font-main); font-size: 16px; font-weight: 500; color: var(--color-subtext);">
          Remaining: 4
        </span>
      </div>

      <div id="todo-list" style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
        <!-- Injected via client script -->
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
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.padding = '14px 18px';
            row.style.borderRadius = '12px';
            row.style.border = '1px solid var(--color-bar-border)';
            row.style.backgroundColor = item.completed ? '#f5f5f5' : '#ffffff';
            row.style.cursor = 'pointer';
            row.style.minHeight = '56px';

            var box = document.createElement('div');
            box.style.width = '24px';
            box.style.height = '24px';
            box.style.borderRadius = '6px';
            box.style.border = '2px solid var(--color-ink)';
            box.style.marginRight = '16px';
            box.style.flexShrink = '0';
            box.style.display = 'flex';
            box.style.alignItems = 'center';
            box.style.justifyContent = 'center';
            box.style.backgroundColor = item.completed ? 'var(--color-ink)' : 'transparent';

            if (item.completed) {
              box.innerHTML = '<span style="color: #ffffff; font-weight: 700; font-size: 16px; line-height: 1;">&#10003;</span>';
            }

            var text = document.createElement('div');
            text.style.fontFamily = 'var(--font-main)';
            text.style.fontSize = '19px';
            text.style.fontWeight = '500';
            text.style.color = item.completed ? 'var(--color-subtext)' : 'var(--color-ink)';
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
          if (countEl) countEl.textContent = 'Remaining: ' + pendingCount;
        }

        render();
      })();
    </script>
  `;

  return renderAppShell({
    title: 'KindleDash // Todos',
    bodyContent,
    currentAppName: 'Todos',
    backUrl: '/'
  });
}

module.exports = { renderTodo };
