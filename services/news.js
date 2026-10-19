const https = require('https');

function fetchRss(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'KindleDash/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function stripHtml(html) {
  return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function parseRssItems(xmlString, maxItems = 12) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xmlString)) !== null && items.length < maxItems) {
    const itemContent = match[1];

    const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const descMatch = itemContent.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);

    const title = titleMatch ? stripHtml(titleMatch[1]) : 'News Bulletin';
    const description = descMatch ? stripHtml(descMatch[1]) : '';
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';

    items.push({
      title: title.slice(0, 110),
      description: description.slice(0, 180) + (description.length > 180 ? '...' : ''),
      pubDate
    });
  }

  return items;
}

const FALLBACK_NEWS = [
  {
    title: "Global Tech Summit Highlights Edge Computing and Low-Power Devices",
    description: "Industry leaders gather to demonstrate innovations in minimal computing, ambient displays, and distraction-free hardware.",
    pubDate: "Today"
  },
  {
    title: "Breakthrough in Solid-State Battery Density Promises Extended Life",
    description: "Researchers announce a stable electrolyte composition that could double the runtime of compact e-readers and IoT sensors.",
    pubDate: "Today"
  },
  {
    title: "Open Source Communities Expand Autonomous Offline Architectures",
    description: "Software developers worldwide prioritize offline-first frameworks, standard web protocols, and zero-dependency microservices.",
    pubDate: "Today"
  },
  {
    title: "The Resurgence of Ambient E-Paper Displays in Modern Workspaces",
    description: "Monochrome e-ink screens find renewed popularity as dedicated calm displays on developers and writers desks.",
    pubDate: "Today"
  }
];

async function getNewsFeed() {
  try {
    // BBC World News RSS feed
    const xml = await fetchRss('https://feeds.bbci.co.uk/news/world/rss.xml');
    const items = parseRssItems(xml, 12);
    if (items.length > 0) return items;
    return FALLBACK_NEWS;
  } catch (err) {
    return FALLBACK_NEWS;
  }
}

module.exports = { getNewsFeed };
