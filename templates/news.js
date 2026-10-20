const { renderAppShell } = require('./figma-layout');

function renderNews(newsItems) {
  const serializedNews = JSON.stringify(newsItems);

  const bodyContent = `
    <!-- Top Content Area (600x700px) -->
    <main style="
      width: 600px;
      height: 700px;
      position: absolute;
      top: 0;
      left: 0;
      overflow: hidden;
      padding: 30px 25px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    ">
      <div style="margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center;">
        <h1 style="font-family: var(--font-main); font-size: 28px; font-weight: 700; color: var(--color-ink); letter-spacing: -0.5px;">
          Headlines
        </h1>
        <div style="display: flex; align-items: center; gap: 10px;">
          <button id="btn-prev" style="
            font-family: var(--font-main);
            font-size: 14px;
            font-weight: 600;
            color: var(--color-ink);
            background: #ffffff;
            border: 1px solid var(--color-bar-border);
            border-radius: 6px;
            padding: 4px 10px;
            cursor: pointer;
          ">&laquo; Prev</button>
          <span id="page-indicator" style="font-family: var(--font-main); font-size: 14px; font-weight: 500; color: var(--color-subtext);">
            1 of 1
          </span>
          <button id="btn-next" style="
            font-family: var(--font-main);
            font-size: 14px;
            font-weight: 600;
            color: var(--color-ink);
            background: #ffffff;
            border: 1px solid var(--color-bar-border);
            border-radius: 6px;
            padding: 4px 10px;
            cursor: pointer;
          ">Next &raquo;</button>
        </div>
      </div>

      <div id="news-container" style="
        display: flex;
        flex-direction: column;
        gap: 14px;
        width: 100%;
      ">
        <!-- Injected via client pagination script -->
      </div>
    </main>

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
            card.style.border = '1px solid var(--color-bar-border)';
            card.style.borderRadius = '12px';
            card.style.padding = '14px 18px';
            card.style.backgroundColor = '#ffffff';

            var title = document.createElement('h2');
            title.style.fontFamily = 'var(--font-main)';
            title.style.fontSize = '18px';
            title.style.fontWeight = '700';
            title.style.lineHeight = '23px';
            title.style.color = 'var(--color-ink)';
            title.style.marginBottom = '6px';
            title.textContent = item.title;

            var desc = document.createElement('p');
            desc.style.fontFamily = 'var(--font-main)';
            desc.style.fontSize = '14.5px';
            desc.style.lineHeight = '20px';
            desc.style.color = 'var(--color-subtext)';
            desc.textContent = item.description;

            card.appendChild(title);
            card.appendChild(desc);
            container.appendChild(card);
          }

          if (indicator) {
            indicator.textContent = 'Page ' + (page + 1) + ' of ' + totalPages;
          }

          if (btnPrev) {
            btnPrev.disabled = (page === 0);
            btnPrev.style.opacity = (page === 0) ? '0.3' : '1';
          }
          if (btnNext) {
            btnNext.disabled = (page >= totalPages - 1);
            btnNext.style.opacity = (page >= totalPages - 1) ? '0.3' : '1';
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

  return renderAppShell({
    title: 'KindleDash // News',
    bodyContent,
    currentAppName: 'News',
    backUrl: '/'
  });
}

module.exports = { renderNews };
