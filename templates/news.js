const { renderHtmlShell } = require('./layout');

function renderNews(newsItems) {
  const serializedNews = JSON.stringify(newsItems);

  const bodyContent = `
    <header class="meta-bar">
      <div>NEWS // FEED READER</div>
      <div id="page-indicator">PAGE 1 OF 1</div>
    </header>

    <main class="content-zone" style="justify-content: flex-start; padding: 0.75rem; width: 100%;">
      <div id="news-container" style="
        width: 100%;
        max-width: 580px;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      ">
        <!-- Injected via client pagination script to strictly prevent scrolling -->
      </div>
    </main>

    <!-- Custom Pagination Action Bar -->
    <footer class="action-bar" style="border-top: var(--border-thick);">
      <a href="/" class="action-bar-btn tactile" aria-label="Go Back">
        &#9664; HOME
      </a>

      <div style="display: flex; align-items: stretch;">
        <button id="btn-prev" class="action-bar-btn tactile" style="font-size: 1.1rem; border-right: none; border-left: var(--border-thick);">
          &laquo; PREV
        </button>
        <button id="btn-next" class="action-bar-btn tactile" style="font-size: 1.1rem; border-right: none; border-left: var(--border-thick);">
          NEXT &raquo;
        </button>
        <div class="action-bar-title" style="border-left: var(--border-thick);">
          APP // NEWS
        </div>
      </div>
    </footer>

    <script>
      (function() {
        var items = ${serializedNews};
        var itemsPerPage = 3;
        var totalPages = Math.ceil(items.length / itemsPerPage) || 1;
        var currentPage = 0;

        function renderPage(page) {
          var container = document.getElementById('news-container');
          var indicator = document.getElementById('page-indicator');
          var btnPrev = document.getElementById('btn-prev');
          var btnNext = document.getElementById('btn-next');

          if (!container) return;
          container.innerHTML = '';

          var start = page * itemsPerPage;
          var end = Math.min(start + itemsPerPage, items.length);

          for (var i = start; i < end; i++) {
            var item = items[i];
            var card = document.createElement('article');
            card.style.border = 'var(--border-thick)';
            card.style.padding = '0.75rem 0.9rem';
            card.style.backgroundColor = 'var(--canvas)';

            var title = document.createElement('h2');
            title.style.fontFamily = 'var(--font-serif)';
            title.style.fontSize = '1.18rem';
            title.style.fontWeight = '900';
            title.style.lineHeight = '1.25';
            title.style.marginBottom = '0.35rem';
            title.textContent = item.title;

            var desc = document.createElement('p');
            desc.style.fontFamily = 'var(--font-sans)';
            desc.style.fontSize = '0.95rem';
            desc.style.lineHeight = '1.35';
            desc.textContent = item.description;

            card.appendChild(title);
            card.appendChild(desc);
            container.appendChild(card);
          }

          if (indicator) {
            indicator.textContent = 'PAGE ' + (page + 1) + ' OF ' + totalPages;
          }

          if (btnPrev) {
            btnPrev.disabled = (page === 0);
            btnPrev.style.opacity = (page === 0) ? '0.4' : '1';
          }
          if (btnNext) {
            btnNext.disabled = (page >= totalPages - 1);
            btnNext.style.opacity = (page >= totalPages - 1) ? '0.4' : '1';
          }
        }

        var btnPrev = document.getElementById('btn-prev');
        var btnNext = document.getElementById('btn-next');

        if (btnPrev) {
          btnPrev.onclick = function() {
            if (currentPage > 0) {
              currentPage--;
              renderPage(currentPage);
            }
          };
        }

        if (btnNext) {
          btnNext.onclick = function() {
            if (currentPage < totalPages - 1) {
              currentPage++;
              renderPage(currentPage);
            }
          };
        }

        renderPage(currentPage);
      })();
    </script>
  `;

  return renderHtmlShell({
    title: 'KindleDash // News',
    bodyContent,
    showActionBar: false // We use custom pagination bar
  });
}

module.exports = { renderNews };
