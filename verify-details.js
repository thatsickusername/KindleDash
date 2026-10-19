const http = require('http');

async function getPage(route) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${route}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function verifyDetails() {
  const css = await getPage('/style.css');
  const scaler = await getPage('/scaler.js');
  const index = await getPage('/');
  const clock = await getPage('/clock');
  const weather = await getPage('/weather');
  const todo = await getPage('/todo');
  const news = await getPage('/news');

  const checks = [
    { name: 'CSS Zero-Margin Reset', pass: css.includes('margin: 0') && css.includes('width: 100vw') && css.includes('overflow: hidden') },
    { name: 'CSS Animation/Transition Kill', pass: css.includes('transition: none !important') && css.includes('animation: none !important') },
    { name: 'CSS Tactile Active Feedback', pass: css.includes('background-color: var(--ink) !important') && css.includes('color: var(--canvas) !important') },
    { name: 'Dynamic Scaler Implementation', pass: scaler.includes('baseFontSize') && scaler.includes('triggerAntiGhosting') },
    { name: 'Launcher Meta Bar and 2x2 Grid', pass: index.includes('KINDLEDASH') && index.includes('/clock') && index.includes('/weather') && index.includes('/todo') && index.includes('/news') },
    { name: 'Clock Large Display & Micro-ticker', pass: clock.includes('clock-display') && clock.includes('scheduleNext') && clock.includes('BACK') },
    { name: 'Weather 15-min Refresh & Metrics', pass: weather.includes('http-equiv="refresh" content="900"') && weather.includes('HUMIDITY') && weather.includes('WIND') },
    { name: 'Todo High Contrast & LocalStorage', pass: todo.includes('todo-list') && todo.includes('localStorage') && todo.includes('BACK') },
    { name: 'News Editorial Typography & Pagination', pass: news.includes('btn-prev') && news.includes('btn-next') && news.includes('HOME') },
    { name: 'Action Bar Clear/Reset Button', pass: clock.includes('CLEAR') && weather.includes('CLEAR') && todo.includes('CLEAR') }
  ];

  console.log('[Verification Suite] Checking acceptance criteria:');
  let allPassed = true;
  for (const c of checks) {
    console.log(`${c.pass ? '✓' : '✗'} ${c.name}`);
    if (!c.pass) allPassed = false;
  }
  process.exit(allPassed ? 0 : 1);
}

verifyDetails().catch(e => {
  console.error(e);
  process.exit(1);
});
